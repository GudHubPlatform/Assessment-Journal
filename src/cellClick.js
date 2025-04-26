export async function cellClick(cell, scope) {
	const {
		records_app_id,
		record_edit_view_id,
		row_item_reference_field_id,
		column_item_reference_field_id,
		row_app_id,
		column_app_id
	} = scope.field_model.data_model;

	const {
		itemId: item_id,
		rowItemId: row_item_id,
		columnItemId: column_item_id
	} = cell.dataset;

	const item = await gudhub.getItem(records_app_id, item_id);

	const fieldsForNewItem = {
		[row_item_reference_field_id]: `${row_app_id}.${row_item_id}`,
		[column_item_reference_field_id]: `${column_app_id}.${column_item_id}`
	};

	const fieldsObject = item ? getFieldsObject(item.fields) : fieldsForNewItem;

	const fieldModel = {
		appId: records_app_id,
		itemId: item_id,
		viewId: record_edit_view_id,
		fields: fieldsObject
	};

	showGhDialog(scope, fieldModel);
}

function getFieldsObject(fields) {
	const fieldsObject = {};
	fields.forEach(({ element_id, field_value }) => {
		fieldsObject[element_id] = field_value;
	});
	return fieldsObject;
}

function onApplyFunction(item) {
	const { appId } = this.fieldModel;

	const newFields = [];

	for (const [element_id, value] of Object.entries(item.fields)) {
		newFields.push({ field_id: element_id, field_value: value });
	}

	const itemData = {
		fields: newFields
	};

	if (item.itemId) {
		itemData.item_id = item.itemId;
		gudhub.updateItems(appId, [itemData]);
	} else {
		gudhub.addNewItems(appId, [itemData]);
	}

	this.cancel();
}

function showGhDialog(parentScope, fieldModel) {
	const filledFields = fieldModel.fields;
	const GhDialog = gudhub.ghconstructor.angularInjector.get('GhDialog');

	GhDialog.show({
		position: 'center',
		toolbar: false,
		template: {
			toolbar: '',
			content: `
            <div class="update_container">
                <div class="cancel-container">
                    <span gh-icon="cross 0893d2 25px normal" ng-click="cancel()"></span>
                </div>
                <div class="update_container_view_block">
                    <gh-view class="ghViewNew" app-id="{{fieldModel.appId}}" view-id="{{fieldModel.viewId}}" fields="fieldModel.fields"></gh-view>
                </div>
                <div class="update_container_btn">
                    <button ng-click="onApplyFunction(fieldModel)" type="button" class="btn btn-grean">Apply</button>
                    <button ng-click="cancel()" type="button" class="btn btn-blue-reverse">Cancel</button>
                </div>
            </div>`
		},
		locals: {
			fieldModel
		},
		controller: [
			'$scope',
			'fieldModel',
			function ($scope, fieldModel) {
				$scope.fieldModel = angular.copy(fieldModel);
				$scope.parentScope = parentScope;
				$scope.filledFields = filledFields;
				$scope.onApplyFunction = onApplyFunction.bind($scope);
			}
		]
	});
}