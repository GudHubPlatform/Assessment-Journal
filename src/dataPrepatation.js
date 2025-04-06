import { reportSettingProperties, valueTypes } from "./data.js";

export default async function create2dDataArray(settings) {
    const {
        records_app_id,
        row_item_reference_field_id,
        column_item_reference_field_id,
        record_value_field_id,
        row_app_id,
        row_title_field_id,
        column_app_id,
        column_title_field_id,
        reportOptions,
        value_type
    } = settings;

    const rowItems = await gudhub.getItems(row_app_id, false);
    const columnItems = await gudhub.getItems(column_app_id, false);
    const records = await gudhub.getItems(records_app_id, false);
    
    const rowMap = createMap(rowItems, row_title_field_id);
    const columnMap = createMap(columnItems, column_title_field_id);

    const dataArray = [[""].concat(Object.values(columnMap))];

    rowItems.forEach(rowItem => {
        const row = [rowMap[rowItem.item_id]];
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
            row.push(formattedValue);
        });
        dataArray.push(row);
    });

    const dataArrayWithReports = addReports(dataArray, reportOptions, value_type);

    return dataArrayWithReports;
}

function createMap(items, title_field_id) {
    return Object.fromEntries(
        items.map(item => [
            item.item_id,
            item.fields.find(f => f.field_id == title_field_id)?.field_value
        ])
    );
}

function findRecord(records, row_app_id, row_item_reference_field_id, row_item_id, column_app_id, column_item_reference_field_id, column_item_id) {
    return records.find(record =>
        record.fields.some(
            f => f.field_id == row_item_reference_field_id && f.field_value == `${row_app_id}.${row_item_id}`
        ) &&
        record.fields.some(
            f => f.field_id == column_item_reference_field_id && f.field_value == `${column_app_id}.${column_item_id}`
        )
    );
}

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

function addReports(dataArray, reportOptions, valueType) {
    const aggregationRules = getAggregationRules();
    let newDataArray = dataArray.map(row => [...row]);
    reportOptions.forEach(({ type, aggregation, name, color }) => {
        if (!aggregationRules[aggregation].includes(valueType)) {
            return;
        }

        if (type === reportSettingProperties.type.row) {
            newDataArray[0].push({ value: name, color });
            
            for (let i = 1; i < dataArray.length; i++) {
                let values = dataArray[i].slice(1);
                let result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(values)
                    : countNonZero(values);
                newDataArray[i].push({ value: result, color: color + "80" });
            }
        } else if (type === reportSettingProperties.type.column) {
            let newRow = [{ value: name, color }];
            
            for (let col = 1; col < dataArray[0].length; col++) {
                let columnValues = dataArray.slice(1).map(row => row[col]);
                let result = aggregation === reportSettingProperties.aggregation.sum
                    ? sumArray(columnValues)
                    : countNonZero(columnValues);
                newRow.push({ value: result, color: color + "80" });
            }

            newDataArray.push(newRow);
        }
    });
    
    return newDataArray;
}
