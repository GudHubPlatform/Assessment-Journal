import GhHtmlElement from '@gudhub/gh-html-element';
import html from './assessment_journual.html';
import './style.scss';
import create2dDataArray from './dataPrepatation.js';
import { downloadAsCSV } from './downloadAsCSV.js';

class GhAssessmentJournual extends GhHtmlElement {
	constructor() {
		super();
	}

	// onInit() is called after parent gh-element scope is ready
	onInit() {
		this.renderComponent();
	}

	// disconnectedCallback() is called after the component is destroyed 
	disconnectedCallback() {
		// Add any cleanup logic if necessary
	}

	async renderComponent() {
		const settings = this.scope.field_model.data_model;
		
		this.data = await create2dDataArray(settings);

		super.render(html);

		this.attachListeners();
	}

	attachListeners() {
		const exportButton = this.querySelector('.export-button');
		exportButton.addEventListener('click', () => downloadAsCSV(this.data));
	}
}

// Register web component only if it is not registered yet
if (!window.customElements.get('gh-assessment-journual')) {
	window.customElements.define('gh-assessment-journual', GhAssessmentJournual);
}
