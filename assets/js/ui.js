
// Panel
function Panel (id, classes) {
	this.base_style = {
		'display':'block',
		'position': 'absolute',
		'top': '0px',
		'right': '0px',
		'width':'80%',
		'min-width':'600px',
		'height':'100%',
	};

	this.classes = classes;
	this.id = id;
	this.element_style = {}; // this contains any other styling that is specific to an object
	this.model = ''; // this will contain the final html

	this.template = '<div id="{0}" class="{1} panel"></div>'.format(this.id, this.classes.join(' '));

	this.render = function (parent) {
		parent.children().first().before(this.template); // place as first child
		model = parent.find('#' + this.id);
		model.css(this.base_style);
		model.css(this.element_style);
		return model;
	}

}
