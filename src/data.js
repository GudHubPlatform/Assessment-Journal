import './assessment_journual.webcomponent.js';

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

export default class GhAssessmentJournual {
	/*------------------------------- FIELD TEMPLATE --------------------------------------*/

	getTemplate() {
		return {
			constructor: 'field',
			name: 'Assessment Journual',
			icon: 'text_icon',
            type: 'assessment_journual',
			model: {
				field_id: 0,
				field_name: 'Assessment Journual',
				field_value: '',
				data_type: 'assessment_journual',
				data_model: {
					records_app_id: null,
					isEditEnabled: 0,
					record_edit_view_id: null,
					row_item_reference_field_id: null,
					column_item_reference_field_id: null,
					record_value_field_id: null,
					row_app_id: null,
					row_title_field_id: null,
					row_filters_list: [],
					column_app_id: null,
					column_title_field_id: null,
					column_filters_list: [],
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
					'<gh-assessment-journual app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}"></gh-assessment-journual>'
			},
			{
				id: 'value',
				name: 'Value',
				content: () => value
			}
		];
	}

// TODO remove point type (need to solve the problem with defining the value type)

	/*--------------------------  SETTINGS --------------------------------*/

	getSettings(scope) {
		return [
			{
				title: 'Options',
				type: 'general_setting',
				icon: 'menu',
				columns_list: [
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
							property: 'data_model.isEditEnabled',
							data_model() {
								return {
									field_name: 'Edit Enabled',
									name_space: 'edit_enabled',
									data_type: 'boolean',
									data_model: {}
								};
							}
						},
						{
							type: 'ghElement',
							property: 'data_model.record_edit_view_id',
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
							},
							data_model: function (fieldModel) {
								return {
									data_model: {
										app_id: fieldModel.data_model
											.records_app_id
									},
									field_name: 'View name',
									name_space: 'view_name',
									data_type: 'view_list'
								};
							}
						}
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
						},
						{
							type: 'html',
							onInit: function (settingScope) {
								settingScope.$watch(
									function () {
										return settingScope.fieldModel
											.data_model.row_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							},
							data_model: function (fieldModel) {
								return {
									recipient: {
										app_id: fieldModel.data_model
											.row_app_id
									}
								};
							},
							control:
								'<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.row_filters_list" gh-mode="variable"></gh-filter>'
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
						},
						{
							type: 'html',
							onInit: function (settingScope) {
								settingScope.$watch(
									function () {
										return settingScope.fieldModel
											.data_model.column_app_id;
									},
									function (newValue) {
										settingScope.field_model.data_model.app_id =
											newValue;
									}
								);
							},
							data_model: function (fieldModel) {
								return {
									recipient: {
										app_id: fieldModel.data_model
											.column_app_id
									}
								};
							},
							control:
								'<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.column_filters_list" gh-mode="variable"></gh-filter>'
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
