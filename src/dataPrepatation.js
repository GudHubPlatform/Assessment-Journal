import { reportSettingProperties, valueTypes } from "./data.js";

// Cell types
export const cellTypes = {
    HEADER: 'header',
    REPORT: 'report',
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

export default async function create2dDataArray(settings) {
    // Get all required settings from configuration
    const {
        records_app_id,          // ID of the app containing assessment records
        row_item_reference_field_id,    // ID of the field referencing row
        column_item_reference_field_id, // ID of the field referencing column
        record_value_field_id,   // ID of the field containing assessment value
        row_app_id,              // ID of the app containing rows
        row_title_field_id,      // ID of the field containing row title
        column_app_id,           // ID of the app containing columns
        column_title_field_id,   // ID of the field containing column title
        reportOptions,           // Report settings
        value_type              // Value type (number, text, boolean)
    } = settings;

    // Get all data from GudHub
    const rowItems = await gudhub.getItems(row_app_id, false);        // Get all rows
    const columnItems = await gudhub.getItems(column_app_id, false);  // Get all columns
    const records = await gudhub.getItems(records_app_id, false);     // Get all assessment records
    
    // Create maps for quick title lookup by ID
    const rowMap = createMap(rowItems, row_title_field_id);           // Map: row ID -> row title
    const columnMap = createMap(columnItems, column_title_field_id);  // Map: column ID -> column title

    // Create first row of the table (headers)
    // First element - empty cell (for corner)
    // Then column titles
    const dataArray = [[createCell(cellTypes.EMPTY)].concat(
        columnItems.map(item => createCell(cellTypes.HEADER, columnMap[item.item_id]))
    )];

    // Process all rows
    rowItems.forEach((rowItem, rowIndex) => {
        // Create new row, first element - row header
        const row = [createCell(cellTypes.HEADER, rowMap[rowItem.item_id], { index: rowIndex + 1 })];
        
        // Process all columns
        columnItems.forEach(columnItem => {
            const record = findRecord(
                records,
                row_app_id,
                row_item_reference_field_id,
                rowItem.item_id,
                column_app_id,
                column_item_reference_field_id,
                columnItem.item_id
            );

            const rawValue = record
                ? record.fields.find(f => f.field_id == record_value_field_id)?.field_value || ""
                : "";

            const formattedValue = formatValue(rawValue, value_type);
            
            // Add value to row with record item_id
            row.push(createCell(cellTypes.VALUE, formattedValue, { 
                item_id: record ? record.item_id : null 
            }));
        });
        
        dataArray.push(row);
    });

    // Add reports (summaries) to the table
    const dataArrayWithReports = addReports(dataArray, reportOptions, value_type);

    return dataArrayWithReports;
}

// Create a map: ID -> title
function createMap(items, title_field_id) {
    return Object.fromEntries(
        items.map(item => [
            item.item_id,
            item.fields.find(f => f.field_id == title_field_id)?.field_value
        ])
    );
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

// Format value according to type
function formatValue(value, type) {
    if (type === valueTypes.bool) {
        if (value === "1" || value === 1 || value === true) {
            return "✅";
        } else if (value === "0" || value === 0 || value === false) {
            return "◯";
        } else {
            return "";
        }
    }
    return value;
}

// reports
function getAggregationRules() {
    return {
        [reportSettingProperties.aggregation.sum]: [valueTypes.number],
        [reportSettingProperties.aggregation.count]: [valueTypes.text, valueTypes.bool, valueTypes.number]
    };
}

function sumArray(arr) {
    return arr.reduce((acc, val) => acc + (Number(val) || 0), 0);
}

function countNonZero(arr) {
    return arr.filter(val => val !== "" && val !== null && val !== undefined).length;
}

// Modifies the addReports function to use new types
function addReports(dataArray, reportOptions, valueType) {
    const aggregationRules = getAggregationRules();
    let newDataArray = dataArray.map(row => [...row]);
    
    reportOptions.forEach(({ type, aggregation, name, color }) => {
        if (!aggregationRules[aggregation].includes(valueType)) {
            return;
        }

        if (type === reportSettingProperties.type.row) {
            newDataArray[0].push(createCell(cellTypes.REPORT, name, { color }));
            
            for (let i = 1; i < dataArray.length; i++) {
                let values = dataArray[i].slice(1).map(cell => cell.value);
                let result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(values)
                    : countNonZero(values);
                newDataArray[i].push(createCell(cellTypes.REPORT, result, { color: color + "80" }));
            }
        } else if (type === reportSettingProperties.type.column) {
            let newRow = [createCell(cellTypes.REPORT, name, { color })];
            
            for (let col = 1; col < dataArray[0].length; col++) {
                let columnValues = dataArray.slice(1).map(row => row[col].value);
                let result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(columnValues)
                    : countNonZero(columnValues);
                newRow.push(createCell(cellTypes.REPORT, result, { color: color + "80" }));
            }

            newDataArray.push(newRow);
        }
    });
    
    return newDataArray;
}
