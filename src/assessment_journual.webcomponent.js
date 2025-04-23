import GhHtmlElement from '@gudhub/gh-html-element';
import html from './assessment_journual.html';
import './style.scss';
import create2dDataArray, { cellTypes, getEmojiByValue, getValueByEmoji } from './dataPrepatation.js';
import { downloadAsCSV } from './downloadAsCSV.js';
import { valueTypes } from './data.js';

class GhAssessmentJournual extends GhHtmlElement {
	constructor() {
		super();
	}

	// debounce utility
	debounce(fn, ms) {
		let timer = null;
		return (...args) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, args), ms);
		};
	}

	// create input element based on value type
	createCellInput(cellContent, onBlur) {
		const settings = this.scope.field_model.data_model;
		const type = settings.value_type;

		let input;

		if (type === valueTypes.bool) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = getValueByEmoji(cellContent);
		} else if (type === valueTypes.number) {
			input = document.createElement('input');
			input.type = 'number';
			input.value = cellContent;

			document.addEventListener('click', (e) => {
				if (e.target === input) {
					console.log(1);
				} else {
					console.log(2);
				}
			});
		} else {
			input = document.createElement('input');
			input.type = 'text';
			input.value = cellContent;
		}

		// Handle blur event
		input.addEventListener('blur', () => {
			let newContent;

			if (type === valueTypes.bool) {
				newContent = getEmojiByValue(input.checked ? '1' : '0');
			} else {
				newContent = input.value;
			}

			onBlur(newContent);
		});

		// Handle Enter key
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				input.blur();
			}
		});

		input.style.display = 'block';

		return input;
	}

	// onInit() is called after parent gh-element scope is ready
	onInit() {
		this.cellInEditMode = null;
		this.journalAppId = this.scope.field_model.data_model.records_app_id;

		this.cellTypes = cellTypes;
		this.renderComponent();
		this.subscribeToUpdates();
	}

	// disconnectedCallback() is called after the component is destroyed
	disconnectedCallback() {
		// Destroy subscription to avoid memory leaks
			gudhub.destroy(
				'gh_items_update',
				{ app_id: this.journalAppId },
				this.updateCallback
			);
	}

	subscribeToUpdates() {
		// Debounce updates to avoid rapid re-renders
		this.updateCallback = this.debounce(
			() => this.renderComponent(),
			500
		);
		gudhub.on(
			'gh_items_update',
			{ app_id: this.journalAppId },
			this.updateCallback
		);
	}

	async renderComponent() {
		const settings = this.scope.field_model.data_model;
		
		this.data = await create2dDataArray(settings);

		super.render(html);

		this.attachListeners();
	}

	onCellClick(cell) {
		if (this.cellInEditMode === cell || cell.getAttribute('data-item-id') === '') {
			return;
		}

		const innerCell = cell.querySelector('.cell');
		const content = innerCell.innerHTML;

		const onBlur = (newContent) => {
			if (content !== newContent) {
				console.log('content', content);
				console.log('newContent', newContent);
			}

			innerCell.innerHTML = newContent;
			cell.replaceChildren(innerCell);

			this.cellInEditMode = null;
		};

		const input = this.createCellInput(content, onBlur);

		cell.innerHTML = '';
		cell.appendChild(input);
		input.focus();

		this.cellInEditMode = cell;
	}

	attachListeners() {
		const exportButton = this.querySelector('.export-button');
		exportButton.addEventListener('click', () => downloadAsCSV(this.data));

		// Add handlers for editable cells
		const editableCells = this.querySelectorAll('.editable-cell');
		editableCells.forEach(cell => {
			cell.addEventListener('click', (e) => this.onCellClick(cell));
		});
	}
}

// Register web component only if it is not registered yet
if (!window.customElements.get('gh-assessment-journual')) {
	window.customElements.define('gh-assessment-journual', GhAssessmentJournual);
}
