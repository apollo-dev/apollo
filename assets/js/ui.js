
// Templates
var PANEL_TEMPLATE = '<div id="{id}" class="panel"></div>';
// var SIDEBAR_TEMPLATE = '<div id="{id}" class="sidebar"><div id={id}-first-child></div></div>';
var SIDEBAR_TEMPLATE = '<div id="{id}" class="sidebar"></div>';
var BUTTON_TEMPLATE = '<div id="{id}" class="button"></div>';
var SPACER_TEMPLATE = '<div id="{id}" class="spacer"></div>';

// Element
function Element (id, template) {

	// basic properties
	this.id = id;
	this.classes = [];
	this.specificStyle = {}; // contains any other styling that is specific to an object
	this.properties = {}; // contains non-style element properties
	this.template = template.format(this); // a text version of the html
	this.model; // contains a link to the DOM element

	// render functions
	this.preRenderFunction = function () {};
	this.postRenderFunction = function () {};

	// states
	this.homeState = function () {};

	// render to a chosen parent element
	this.render = function (parent) {
		// pre-render
		this.preRenderFunction(parent);

		// 1. add element to the DOM
		if (parent.children().length > 0) {
			parent.children().first().before(this.template); // place as first child
		} else {
			parent.html(this.template); // simply place inside
		}
		this.model = this.getModel(parent);
		console.log(this.model);

		// 2. set specific css
		this.model.css(this.specificStyle);

		// 3. set classes
		for (c in this.classes) {
			this.model.addClass(c);
		}

		// 4. set properties
		for (property in this.properties) {
			this.model.attr(property, this.properties[property]);
		}

		// post render function
		this.postRenderFunction(this.model);
	}

	// add child to this model
	this.renderChild = function (child) {
		child.render(this.model);
	}

	this.getModel = function (parent) {
		return $(parent.selector + ' #' + this.id);
	}

	/////// INTERFACE METHODS


}
