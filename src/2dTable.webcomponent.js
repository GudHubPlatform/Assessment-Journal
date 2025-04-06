import GhHtmlElement from '@gudhub/gh-html-element';
import html from './2d-table.html';
import './style.scss';
import create2dDataArray from './dataPrepatation.js';

class Gh2dTable extends GhHtmlElement {
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

		this.applyStyles();
	}

	applyStyles() {
		console.log(this);
	}
}

// Register web component only if it is not registered yet
if (!window.customElements.get('gh-2d-table')) {
	window.customElements.define('gh-2d-table', Gh2dTable);
}
