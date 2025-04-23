import GhHtmlElement from '@gudhub/gh-html-element';
import html from './assessment_journual.html';
import './style.scss';
import create2dDataArray, { cellTypes } from './dataPrepatation.js';
import { downloadAsCSV } from './downloadAsCSV.js';

class GhAssessmentJournual extends GhHtmlElement {
	constructor() {
		super();
	}

	// onInit() is called after parent gh-element scope is ready
	onInit() {
		this.cellTypes = cellTypes;
		this.renderComponent();
		this.subscribeToUpdates();
	}

	// disconnectedCallback() is called after the component is destroyed 
	disconnectedCallback() {
		// Add any cleanup logic if necessary
	}

	subscribeToUpdates() {
		const journalAppId = this.scope.field_model.data_model.records_app_id;
		if (journalAppId) {
			gudhub.on(
				'gh_items_update',
				{ journal_app_id: journalAppId },
				() => this.renderComponent()
			);
		}
	}

	async renderComponent() {
		const settings = this.scope.field_model.data_model;
		
		this.data = await create2dDataArray(settings);

		super.render(html);

		this.attachListeners();
	}

	onCellClick(cell) {
		const itemId = cell.dataset.itemId;
		if (itemId) {
			console.log('Item ID:', itemId);
			
			// Cache the cell content
			const cellContent = cell.querySelector('.cell');
			const originalContent = cellContent.innerHTML;
			
			// Create input element
			const input = document.createElement('input');
			input.type = 'text';
			input.value = cellContent.textContent;
			input.style.display = 'block';

			// Replace content with input
			cellContent.innerHTML = '';
			cellContent.appendChild(input);
			input.focus();

			// Handle blur event
			input.addEventListener('blur', () => {
				const newValue = input.value;
				cellContent.innerHTML = newValue;
			});

			// Handle Enter key
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					input.blur();
				}
			});
		}
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
