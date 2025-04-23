import { reportSettingProperties, valueTypes } from "./data.js";

export default async function create2dDataArray(settings) {
    // Отримуємо всі необхідні налаштування з конфігурації
    const {
        records_app_id,          // ID апки з записами оцінок
        row_item_reference_field_id,    // ID поля посилання на рядок
        column_item_reference_field_id, // ID поля посилання на колонку
        record_value_field_id,   // ID поля зі значенням оцінки
        row_app_id,              // ID апки з рядками
        row_title_field_id,      // ID поля з назвою рядка
        column_app_id,           // ID апки з колонками
        column_title_field_id,   // ID поля з назвою колонки
        reportOptions,           // Налаштування звітів
        value_type              // Тип значення (число, текст, булеве)
    } = settings;

    // Отримуємо всі дані з GudHub
    const rowItems = await gudhub.getItems(row_app_id, false);        // Отримуємо всі рядки
    const columnItems = await gudhub.getItems(column_app_id, false);  // Отримуємо всі колонки
    const records = await gudhub.getItems(records_app_id, false);     // Отримуємо всі записи оцінок
    
    // Створюємо мапи для швидкого пошуку назв по ID
    const rowMap = createMap(rowItems, row_title_field_id);           // Мапа: ID рядка -> назва рядка
    const columnMap = createMap(columnItems, column_title_field_id);  // Мапа: ID колонки -> назва колонки

    // Створюємо перший рядок таблиці (заголовки)
    // Перший елемент - порожній (для кутової клітинки)
    // Далі йдуть назви колонок в тому ж порядку, що й columnItems
    const dataArray = [[""].concat(columnItems.map(item => columnMap[item.item_id]))];

    // Проходимо по всіх рядках
    rowItems.forEach(rowItem => {
        // Створюємо новий ряд, перший елемент - назва рядка
        const row = [rowMap[rowItem.item_id]];
        
        // Проходимо по всіх колонках в тому ж порядку, що й в заголовках
        columnItems.forEach(columnItem => {
            // Шукаємо запис оцінки для поточної комірки
            const record = findRecord(
                records,
                row_app_id,
                row_item_reference_field_id,
                rowItem.item_id,
                column_app_id,
                column_item_reference_field_id,
                columnItem.item_id
            );

            // Отримуємо значення оцінки з запису
            const rawValue = record
                ? record.fields.find(f => f.field_id == record_value_field_id)?.field_value || ""
                : "";

            // Форматуємо значення відповідно до типу
            const formattedValue = formatValue(rawValue, value_type);
            
            // Додаємо значення до рядка
            row.push(formattedValue);
        });
        
        // Додаємо готовий ряд до масиву даних
        dataArray.push(row);
    });

    // Додаємо звіти (підсумки) до таблиці
    const dataArrayWithReports = addReports(dataArray, reportOptions, value_type);

    return dataArrayWithReports;
}

// Створює мапу: ID -> назва
function createMap(items, title_field_id) {
    return Object.fromEntries(
        items.map(item => [
            item.item_id,
            item.fields.find(f => f.field_id == title_field_id)?.field_value
        ])
    );
}

// Шукає запис оцінки для конкретної комірки
function findRecord(records, row_app_id, row_item_reference_field_id, row_item_id, column_app_id, column_item_reference_field_id, column_item_id) {
    if (row_item_id == "4475268" && column_item_id == "4529354") debugger
    
    const record = records.find(record =>
        // Перевіряємо посилання на рядок
        record.fields.some(
            f => f.field_id == row_item_reference_field_id && f.field_value == `${row_app_id}.${row_item_id}`
        ) &&
        // Перевіряємо посилання на колонку
        record.fields.some(
            f => f.field_id == column_item_reference_field_id && f.field_value == `${column_app_id}.${column_item_id}`
        )
    );

    return record;
}

// Форматує значення відповідно до типу
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
