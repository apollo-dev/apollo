// App structure

// 0. App - contains everything
var App = React.createClass({
	render: function() {

		// RENDER PANELS
		var panels = this.props.structure.panels.map(function (panelPrototype) {
			return (
				<Panel id={panelPrototype.id} key={panelPrototype.key} />
			);
		});

		// RENDER SIDEBARS
		var sidebars = this.props.structure.sidebars.map(function (sidebarPrototype) {
			return (
				<Sidebar id={sidebarPrototype.id} elements={sidebarPrototype.elements} key={sidebarPrototype.key} />
			)
		});

		return (
			<div>
				{panels}
				{sidebars}
			</div>
		);
	}
});

// 1. Panels - contain stuff
var Panel = React.createClass({
	render: function() {
		return (
			<div id={this.props.id} className='panel'>
			</div>
		);
	}
});

// 2. Sidebars - menus and info
var Sidebar = React.createClass({
	render: function() {
		// RENDER ELEMENTS
		var elements = this.props.elements.map(function (elementPrototype) {
			return (
				<SidebarElement id={elementPrototype.id} className={elementPrototype.className} content={elementPrototype.content} key={elementPrototype.key} />
			)
		});

		return (
			<div id={this.props.id} className='sidebar'>
				{elements}
			</div>
		);
	}
});

var SidebarElement = React.createClass({
	render: function() {
		return (
			<div id={this.props.id} className={this.props.className}>
				{this.props.content}
			</div>
		);
	}
});

// 3. Menu buttons - click them
// 4. Loading trays - information will appear in them

// Interface structure
var structure = {
	panels:[
		{
			key:0,
			id:'img-panel',
		},
	],
	sidebars:[
		{
			key:0,
			id:'experiment-sidebar',
			elements:[
				{
					key:0,
					className:'spacer',
					id:'es-ts',
				},
				{
					key:1,
					className:'btn btn-default',
					id:'es-in-progress-button',
					content:'In Progress',
				},
				{
					key:2,
					className:'btn btn-default',
					id:'es-new-experiment-button',
					content:'New experiment',
				},
			],
		}
	],
};

// Add interface elements
ReactDOM.render(
	<App structure={structure} />,
	document.getElementById('root')
);
