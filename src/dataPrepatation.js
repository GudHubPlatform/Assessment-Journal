import { reportSettingProperties } from "./data.js";
import { filterItems } from "./filterItems.js";

// Cell types
export const cellTypes = {
    HEADER: 'header',
    REPORT: 'report',
    REPORT_HEADER: 'report_header',
    VALUE: 'value',
    EMPTY: 'empty'
};

// Create a cell of specified type
function createCell(type, value, options = {}) {
    return {
        type,
        value,
        ...options
    };
}

export default async function create2dDataArray(scope) {
    const settings = scope.field_model.data_model
    // Get all required settings from configuration
    const {
        records_app_id,          // ID of the app containing assessment records
        row_item_reference_field_id,    // ID of the field referencing row
        column_item_reference_field_id, // ID of the field referencing column
        record_value_field_id,   // ID of the field containing assessment value
        row_app_id,              // ID of the app containing rows
        row_title_field_id,      // ID of the field containing row title
        row_filters_list,        // Filters for rows
        column_app_id,           // ID of the app containing columns
        column_title_field_id,   // ID of the field containing column title
        column_filters_list,     // Filters for columns
        record_filters_list,     // Filters for records
        reportOptions,           // Report settings
    } = settings;

    // Get all data from GudHub
    const rowItems = await filterItems(await gudhub.getItems(row_app_id, false), scope, row_filters_list);        // Get all rows
    const columnItems = await filterItems(await gudhub.getItems(column_app_id, false), scope, column_filters_list);  // Get all columns
    const recordItems = await filterItems(await gudhub.getItems(records_app_id, false), scope, record_filters_list || []);     // Get all assessment records (filtered)

    // Create maps for quick title lookup by ID
    const [rowMap, columnMap] = await Promise.all([
        createMap(row_app_id, rowItems, row_title_field_id),           // Map: row ID -> row title
        createMap(column_app_id, columnItems, column_title_field_id)      // Map: column ID -> column title
    ]);

    // Create first row of the table (headers)
    // First element - empty cell (for corner)
    // Then column titles
    const dataArray = [[createCell(cellTypes.EMPTY, "")].concat(
        columnItems.map(item => createCell(cellTypes.HEADER, columnMap[item.item_id]))
    )];

    // Process all rows
    for (const rowItem of rowItems) {
        // Create new row, first element - row header
        const row = [createCell(cellTypes.HEADER, rowMap[rowItem.item_id])];

        // Process all columns
        for (const columnItem of columnItems) {
            const record = findRecord(
                recordItems,
                row_app_id,
                row_item_reference_field_id,
                rowItem.item_id,
                column_app_id,
                column_item_reference_field_id,
                columnItem.item_id
            );

            const interpritatedValue = record ? await gudhub.getInterpretationById(records_app_id, record.item_id, record_value_field_id, 'value') : '';

            // Add value to row with record item_id
            row.push(createCell(cellTypes.VALUE, interpritatedValue, {
                item_id: record ? record.item_id : null,
                row_item_id: rowItem.item_id,
                column_item_id: columnItem.item_id
            }));
        };

        dataArray.push(row);
    };

    // Add reports (summaries) to the table
    const dataArrayWithReports = addReports(dataArray, reportOptions, recordItems, scope);

    return dataArrayWithReports;
}

/************************** helper functions **************************/

// Create a map: ID -> title
async function createMap(app_id, items, title_field_id) {
    const map = {};
    for (const item of items) {
        const value = await gudhub.getInterpretationById(app_id, item.item_id, title_field_id, 'value');
        map[item.item_id] = value;
    }
    return map;
}

// Find assessment record for specific cell
function findRecord(records, row_app_id, row_item_reference_field_id, row_item_id, column_app_id, column_item_reference_field_id, column_item_id) {
    return records.find(record =>
        // Check row reference
        record.fields.some(
            f => f.field_id == row_item_reference_field_id && f.field_value == `${row_app_id}.${row_item_id}`
        ) &&
        // Check column reference
        record.fields.some(
            f => f.field_id == column_item_reference_field_id && f.field_value == `${column_app_id}.${column_item_id}`
        )
    );
}

function sumArray(arr) {
    return arr.reduce((acc, val) => acc + (Number(val) || 0), 0);
}

function countNonZero(arr) {
    return arr.filter(val => val !== "" && val !== null && val !== undefined).length;
}

// Modifies the addReports function to use new types
async function addReports(dataArray, reportOptions, recordItems, scope) {
    const newDataArray = dataArray.map(row => [...row]);

    for (const report of reportOptions) {
        const { type, aggregation, name, color, filters_list } = report;
        // report can contain filters
        let filterCallback = () => true;
        if (filters_list && filters_list.length > 0) {
            const filteredItems = await filterItems(recordItems, scope, filters_list);
            filterCallback = (cell) => filteredItems.some(filteredItem => filteredItem.item_id === cell.item_id);
        }

        if (type === reportSettingProperties.type.row) {
            newDataArray[0].push(createCell(cellTypes.REPORT_HEADER, name, { color }));

            for (let i = 1; i < dataArray.length; i++) {
                const values = dataArray[i].slice(1).filter(filterCallback).map(cell => cell.value);

                const result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(values)
                    : countNonZero(values);
                newDataArray[i].push(createCell(cellTypes.REPORT, result, { color: color + "80" }));
            }
        } else if (type === reportSettingProperties.type.column) {
            const newRow = [createCell(cellTypes.REPORT_HEADER, name, { color })];

            for (let col = 1; col < dataArray[0].length; col++) {
                const columnValues = dataArray.slice(1).filter(filterCallback).map(row => row[col].value);

                const result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(columnValues)
                    : countNonZero(columnValues);
                newRow.push(createCell(cellTypes.REPORT, result, { color: color + "80" }));
            }

            newDataArray.push(newRow);
        }
    };

    return newDataArray;
}
