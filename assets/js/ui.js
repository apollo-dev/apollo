// Templates
var PANEL_TEMPLATE = '<div id="{id}" class="panel"></div>';
var SIDEBAR_TEMPLATE = '<div id="{id}" class="sidebar"></div>';
var BUTTON_TEMPLATE = '<button id="{id}" class="btn btn-default">{html}</button>';
var SPACER_TEMPLATE = '<div id="{id}" class="spacer"></div>';

// States
var HOME_STATE = 'HS';

// global
var body = $('body');
var elements = [];
var defaultAnimationTime = 400;
var defaultState = {'css': {'left':'-1000px'}};

// Definitions
// var Button = new Element('button-id', BUTTON_TEMPLATE);
// Button.classes = [css classes];
// Button.specificStyle = {css};
// Button.properties = {none-style properties};
// Button.html = 'Home';
// Button.states[HOME_STATE] = {animatable css};
// Button.stateSwitch[HOME_STATE] = NEW_EXPERIMENT_STATE;
// Button.stateSwitch[NEW_EXPERIMENT_STATE] = HOME_STATE;
// Button.preRenderFunction = function () {};
// Button.postRenderFunction = function () {};

// Element
function Element (id, template) {

	// basic properties
	this.id = id;
	this.template = template.format(this); // a text version of the html
	this.classes = [];
	this.specificStyle = {}; // contains any other styling that is specific to an object
	this.properties = {}; // contains non-style element properties
	this.html = '';

	// state properties
	this.state = HOME_STATE;
	this.states = {};
	this.stateSwitch = {};

	// link to DOM
	this.model = function () {
		return $('#' + this.id);
	}

	// render functions
	this.preRenderFunction = function (parent) {};
	this.postRenderFunction = function (model) {};

	// states
	this.changeState = function (stateName) {
		this.state = stateName;
		var newState = this.states[this.state];
		if (!($.isEmptyObject(newState))) {
			var time, fn;
			if (newState.hasOwnProperty('css')) {
				if (newState.hasOwnProperty('time')) {
					time = newState['time'];
				} else {
					time = defaultAnimationTime;
				}

				this.model().animate(newState['css'], time);
			}

			if (newState.hasOwnProperty('fn')) {
				fn = newState['fn'];
				fn(this.model());
			}
		}

	}

	// render to a chosen parent element
	this.render = function (parent) {
		// pre-render
		this.preRenderFunction(parent);

		// 1. add element to the DOM
		if (parent.children().length > 0) {
			parent.children().last().after(this.template); // place as last child
		} else {
			parent.html(this.template); // simply place inside
		}

		// 2. set specific css
		this.model().css(this.specificStyle);

		// 3. set classes
		for (c in this.classes) {
			this.model().addClass(this.classes[c]);
		}

		// 4. set properties
		for (property in this.properties) {
			this.model().attr(property, this.properties[property]);
		}

		// 5. set inner html
		this.model().html(this.html);

		// post render function
		this.postRenderFunction(this.model());
	}

	// add child to this model()
	this.renderChild = function (child) {
		child.render(this.model());
	}

	/////// INTERFACE METHODS
	this.click = function (fn) {
		var element = this;

		this.model().on('click', function (e) {
			// impose global changes
			changeState(element.stateSwitch[element.state]);

			// more specific actions
			fn(element.model());
		});
	};

	this.once = function (fn) {
		fn(this.model());
	};

	// add to array
	elements.push(this);
}

function changeState (stateName) {
	if (typeof stateName !== 'undefined') { // not-stateless thing is clicked
		for (lm in elements) {
			var element = elements[lm];
			element.changeState(stateName);
		}
	}
}
