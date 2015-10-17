
// Templates
var PANEL_TEMPLATE = '<div id="{id}" class="panel"></div>';
var SIDEBAR_TEMPLATE = '<div id="{id}" class="sidebar"></div>';
var MENU_BUTTON_TEMPLATE = '<div id="{id}" class="button"></div>';

// Element
function Element (id, template) {

	// basic properties
	this.id = id;
	this.classes = [];
	this.specific_style = {}; // contains any other styling that is specific to an object
	this.properties = {}; // contains non-style element properties
	this.template = template.format(this); // a text version of the html
	this.model; // contains a link to the DOM element

	// render functions
	this.pre_render_function = function () {};
	this.post_render_function = function () {};

	// states
	this.home_state = function () {};

	// render to a chosen parent element
	this.render = function (parent) {
		// pre-render
		this.pre_render_function(parent);

		// 1. add element to the DOM
		parent.children().first().before(this.template); // place as first child
		this.model = parent.find('#' + this.id);

		// 2. set specific css
		this.model.css(this.specific_style);

		// 3. set classes
		for (c in this.classes) {
			this.model.addClass(c);
		}

		// 4. set properties
		for (property in this.properties) {
			this.model.attr(property, this.properties[property]);
		}

		// post render function
		this.post_render_function(this.model);
	}

	// add child to this model
	this.render_child = function (child) {
		child.render(this.model);
	}

	/////// INTERFACE METHODS


}
