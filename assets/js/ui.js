// Templates
var PANEL_TEMPLATE = '<div id="{id}" class="panel"></div>';
var SIDEBAR_TEMPLATE = '<div id="{id}" class="sidebar"></div>';
var TOPBAR_TEMPLATE = '<div id="{id}" class="topbar"></div>';
var BUTTON_TEMPLATE = '<button id="{id}" class="btn btn-default"></button>';
var SPACER_TEMPLATE = '<div id="{id}" class="spacer"></div>';
var CONTAINER_TEMPLATE = '<div id={id}><div id="{id}-spacer-tray" class="spacer tray"><img id="{id}-spinner" class="spinner" src="./assets/img/colour-loader.gif" /></div></div>';
var BASIC_TEMPLATE = '<div id={id}></div>';

// Default states
var HOME_STATE = 'HS';
var NULL_STATE = 'NS';

// global
var body = $('body');
var elements = [];
var currentState = '';
var defaultAnimationTime = 400;
var defaultState = {'css': {'left':'-1000px'}};

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
	this.state = '';
	this.states = {};
	this.stateSwitch = {};

	// a state might look like:
	// state = {'css':{}, 'time':'300', 'fn':function, 'local':{'element-id-1':function1, 'element-id-2':function2}};

	// link to DOM
	this.model = function () {
		return $('#' + this.id);
	}

	// render functions
	this.preRenderFunction = function (parent) {};
	this.postRenderFunction = function (model) {};

	// states
	this.changeState = function (triggerId, stateName, args) {

		// get the actions
		var newState = this.states[stateName];
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
				fn(this.model(), args);
			}

			if (newState.hasOwnProperty('local')) {
				var localStates = newState['local'];

				if (localStates.hasOwnProperty(triggerId)) {
					localFn = localStates[triggerId];
					localFn(this.model(), args);
				}
			}
		}

		// finally set the new state
		if (stateName !== NULL_STATE) {
			this.state = stateName;
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

		// 5. html
		if (this.html !== '') {
			this.model().html(this.html);
		}

		// post render function
		this.postRenderFunction(this.model());
	}

	// add child to this model()
	this.renderChild = function (child) {
		child.render(this.model());
	}

	this.remove = function () {
		this.model().remove();
	}

	/////// INTERFACE METHODS
	this.click = function (fn, args) {
		var element = this;

		this.model().on('click', function (e) {
			// impose global changes
			changeState(this.id, element.stateSwitch[element.state], args);

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

function changeState (triggerId, stateName, args) {
	if (typeof stateName !== 'undefined' && stateName !== currentState) { // not-stateless thing is clicked
		for (lm in elements) {
			var element = elements[lm];
			element.changeState(triggerId, stateName, args);
		}
	}
}
