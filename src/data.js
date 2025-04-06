import './2dTable.webcomponent.js';

export const valueTypes = {
	number: "Number",
	text: "Text",
	bool: "Boolean"
};

export const reportSettingProperties = {
	type: {
		row: "Row",
		column: "Column"
	},
	aggregation: {
		count: "Count",
		sum: "Sum"
	}
};

export default class Gh2dTable {
	/*------------------------------- FIELD TEMPLATE --------------------------------------*/

	getTemplate() {
		return {
			constructor: 'field',
			name: '2D Table',
			icon: 'text_icon',
            type: '2d_table',
			model: {
				field_id: 0,
				field_name: '2D Table',
				field_value: '',
				data_type: '2d_table',
				data_model: {
					records_app_id: null,
					row_item_reference_field_id: null,
					column_item_reference_field_id: null,
					record_value_field_id: null,
					row_app_id: null,
					row_title_field_id: null,
					column_app_id: null,
					column_title_field_id: null,
					reportOptions: [],
					value_type: null,
					interpretation: [
						{
							src: 'form',
							id: 'default',
							settings: {
								editable: 1,
								show_field_name: 1,
								show_field: 1
							},
							style: { position: 'beetwen' }
						},
						{
							src: 'table',
							id: 'read_only',
							settings: {
								editable: 0,
								show_field_name: 0,
								show_field: 1,
								maxSymbols: 256
							}
						}
					]
				}
			}
		};
	}

	/*------------------------------- INTERPRETATION --------------------------------------*/

	getInterpretation(gudhub, value, appId, itemId, field_model) {
		return [
			{
				id: 'default',
				name: 'Default',
				content: () =>
					'<gh-2d-table app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}"></gh-2d-table>'
			},
			{
				id: 'value',
				name: 'Value',
				content: () => value
			}
		];
	}

	/*--------------------------  SETTINGS --------------------------------*/

	getSettings(scope) {
		return [
			{
				title: 'Options',
				type: 'general_setting',
				icon: 'menu',
				columns_list: [
					[],
					[
						{
							title: 'Records Journal Settings',
							type: 'header'
						},
						{
							type: 'ghElement',
							property: 'data_model.records_app_id',
							data_model: function () {
								return {
									data_type: 'app',
									field_name: 'App',
									name_space: 'records_app_id',
									data_model: {
										current_app: false,
										interpretation: [
											{
												src: 'form',
												id: 'with_text',
												settings: {
													editable: 1,
													show_field_name: 1,
													show_field: 1
												}
											}
										]
									}
								};
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.row_item_reference_field_id',
							data_model: function (fieldModel) {
								return {
									data_type: 'field',
									field_name: 'Field Row',
									name_space: 'row_item_reference_field_id',
									data_model: {
										app_id: fieldModel.data_model
											.records_app_id
									}
								};
							},
							onInit: function (settingScope, fieldModel) {
								settingScope.$watch(
									function () {
										return fieldModel.data_model
											.records_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.column_item_reference_field_id',
							data_model: function (fieldModel) {
								return {
									data_type: 'field',
									field_name: 'Field Column',
									name_space: 'column_item_reference_field_id',
									data_model: {
										app_id: fieldModel.data_model
											.records_app_id
									}
								};
							},
							onInit: function (settingScope, fieldModel) {
								settingScope.$watch(
									function () {
										return fieldModel.data_model
											.records_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.record_value_field_id',
							data_model: function (fieldModel) {
								return {
									data_type: 'field',
									field_name: 'Point',
									name_space: 'record_value_field_id',
									data_model: {
										app_id: fieldModel.data_model
											.records_app_id
									}
								};
							},
							onInit: function (settingScope, fieldModel) {
								settingScope.$watch(
									function () {
										return fieldModel.data_model
											.records_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.value_type',
							data_model: function (fieldModel) {
								return {
									prop_name: 'Type',
									data_type: 'text_opt',
									name_space: 'value_type',
									field_name: "Point Type",
									data_model: {
										options: Object.values(valueTypes).map((type) => ({ name: type, value: type }))
									},
								}
							}
						},
					],
					[
						{
							title: 'Row Settings',
							type: 'header'
						},
						{
							type: 'ghElement',
							property: 'data_model.row_app_id',
							data_model: function () {
								return {
									data_type: 'app',
									field_name: 'Row App',
									name_space: 'row_app_id',
									data_model: {
										current_app: false,
										interpretation: [
											{
												src: 'form',
												id: 'with_text',
												settings: {
													editable: 1,
													show_field_name: 1,
													show_field: 1
												}
											}
										]
									}
								};
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.row_title_field_id',
							data_model: function (fieldModel) {
								return {
									data_type: 'field',
									field_name: 'Field Name',
									name_space: 'row_title_field_id',
									data_model: {
										app_id: fieldModel.data_model
											.row_app_id
									}
								};
							},
							onInit: function (settingScope, fieldModel) {
								settingScope.$watch(
									function () {
										return fieldModel.data_model
											.row_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							}
						}
						
					],
					[
						{
							title: 'Column Settings',
							type: 'header'
						},
						{
							type: 'ghElement',
							property: 'data_model.column_app_id',
							data_model: function () {
								return {
									data_type: 'app',
									field_name: 'Column App',
									name_space: 'column_app_id',
									data_model: {
										current_app: false,
										interpretation: [
											{
												src: 'form',
												id: 'with_text',
												settings: {
													editable: 1,
													show_field_name: 1,
													show_field: 1
												}
											}
										]
									}
								};
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.column_title_field_id',
							data_model: function (fieldModel) {
								return {
									data_type: 'field',
									field_name: 'Field Name',
									name_space: 'column_title_field_id',
									data_model: {
										app_id: fieldModel.data_model
											.column_app_id
									}
								};
							},
							onInit: function (settingScope, fieldModel) {
								settingScope.$watch(
									function () {
										return fieldModel.data_model
											.column_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							}
						}
						
					],
					[

						{
							title: 'Report Settings',
							type: 'header'
						},
						{
							type: 'html',
							data_model: function (fieldModel) {
								return {
									patterns: [
										{
											property: 'name',
											prop_name: 'Name',
											type: 'text',
											data_model:function(option){},
											display: true
										},
										{
											property: 'type', 
											prop_name: 'Type',
											type: 'text_opt',
											data_model: function(option) {
												return {
													options: Object.values(reportSettingProperties.type).map((type) => ({ name: type, value: type }))
												};
											},
											display: true
										},
										{
											property: 'aggregation', 
											prop_name: 'Aggregation',
											type: 'text_opt',
											data_model: function(option) {
												return {
													options: Object.values(reportSettingProperties.aggregation).map((aggregation) => ({ name: aggregation, value: aggregation }))
												};
											},
											display: true
										},
										{
											type: 'color',
											property: 'color',
											prop_name: 'Color',
											display: true,
											data_model:function(option){}
										}
									]
								};
							},
							control:
								'<gh-option-table items="fieldModel.data_model.reportOptions" pattern="field_model.patterns"></gh-option-table>',
						},
					]
				]
			},
			{
				title: 'Style',
				icon: 'eye',
				type: 'interpretation_setting',
				columns_list: [
					[
						{
							type: 'ghElement',
							property: 'interpreter.settings.maxSymbols',
							data_model: function () {
								return {
									data_type: 'number',
									field_name: 'Max Symbols',
									name_space: 'read_only_max_symbols',
								};
							}
						}
					]
				]
			}
		];
	}
}
