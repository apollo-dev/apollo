$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog
	var settings = require("./settings.json"); // external settings

	///////////////////////////////////
	///////////////	UI ELEMENTS
	/////////////// classes, specificStyle, properties, html, states, stateChanger, preRenderFunction, postRenderFunction

	// SIDEBARS
	// experiment sidebar
	var experimentSidebar = new Element('experiment-sidebar', SIDEBAR_TEMPLATE);
	experimentSidebar.states[HOME_STATE] = {'css':{'left':'0px'}, 'time':300};
	experimentSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;

	// new experiment sidebar
	var newExperimentSidebar = new Element('new-experiment-sidebar', SIDEBAR_TEMPLATE);
	newExperimentSidebar.classes = ['maxi'];
	newExperimentSidebar.specificStyle = defaultState['css'];
	newExperimentSidebar.states[HOME_STATE] = defaultState;
	newExperimentSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'51px'}, 'time':300};

	// mini sidebar
	var miniSidebar = new Element('mini-sidebar', SIDEBAR_TEMPLATE);
	miniSidebar.classes = ['mini'];
	miniSidebar.specificStyle = defaultState['css'];
	miniSidebar.states[HOME_STATE] = defaultState;
	miniSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'0px'}, 'time':300};

	// BUTTONS
	// ES In Progress Button
	var ESInProgressButton = new Element('es-in-progress-button', BUTTON_TEMPLATE);
	ESInProgressButton.html = 'In progress';
	ESInProgressButton.stateChanger[HOME_STATE] = IN_PROGRESS_STATE;

	// ES Settings Button
	var ESSettingsButton = new Element('es-settings-button', BUTTON_TEMPLATE);
	ESSettingsButton.html = 'Settings';

	// ES New Experiment Button
	var ESNewExperimentButton = new Element('es-new-experiment-button', BUTTON_TEMPLATE);
	ESNewExperimentButton.html = 'New experiment';
	ESNewExperimentButton.stateChanger[HOME_STATE] = NEW_EXPERIMENT_STATE;

	// NES Choose Path Button
	var NESChoosePathButton = new Element('nes-choose-path-button', BUTTON_TEMPLATE);
	NESChoosePathButton.html = 'Choose file...';

	// MS Home Button
	var MSHomeButton = new Element('ms-home-button', BUTTON_TEMPLATE);
	MSHomeButton.html = '<span class="glyphicon glyphicon-home"></span>';
	MSHomeButton.stateChanger[NEW_EXPERIMENT_STATE] = HOME_STATE;

	// MS In Progress Button
	var MSInProgressButton = new Element('ms-in-progress-button', BUTTON_TEMPLATE);
	MSInProgressButton.html = '<span class="glyphicon glyphicon-refresh"></span>';

	// MS Settings Button
	var MSSettingsButton = new Element('ms-settings-button', BUTTON_TEMPLATE);
	MSSettingsButton.html = '<span class="glyphicon glyphicon-cog"></span>';

	// MS New Experiment Button
	var MSNewExperimentButton = new Element('ms-new-experiment-button', BUTTON_TEMPLATE);
	MSNewExperimentButton.html = '<span class="glyphicon glyphicon-plus"></span>';

	// OTHER ELEMENTS
	var ESTopSpacer = new Element('es-ts', SPACER_TEMPLATE);
	var ESMiddleSpacer = new Element('es-ms', SPACER_TEMPLATE);
	var ESTraySpacer = new Element('es-tray', SPACER_TEMPLATE);
	ESTraySpacer.specificStyle = {'height':'200px'};
	var ESTrayContainer = new Element('es-tray-container', '<div id={id}></div>')
	var ESTraySpinner = new Element('es-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')
	var NESTopSpacer = new Element('nes-ts', SPACER_TEMPLATE);
	var MSTopSpacer = new Element('ms-ts', SPACER_TEMPLATE);

	// RENDER
	// experiment sidebar
	experimentSidebar.render(body); // order is top to bottom
	experimentSidebar.renderChild(ESTopSpacer);
	experimentSidebar.renderChild(ESInProgressButton);
	experimentSidebar.renderChild(ESSettingsButton);
	experimentSidebar.renderChild(ESNewExperimentButton);
	experimentSidebar.renderChild(ESMiddleSpacer);
	experimentSidebar.renderChild(ESTrayContainer);
	ESTrayContainer.renderChild(ESTraySpacer);
	ESTraySpacer.renderChild(ESTraySpinner);

	// new experiment sidebar
	newExperimentSidebar.render(body);
	newExperimentSidebar.renderChild(NESTopSpacer);
	newExperimentSidebar.renderChild(NESChoosePathButton);

	// mini sidebar
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	// Need to store application context so it can be recreated.

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	/////////////// must be done after render

	ESInProgressButton.click(function (model) {});
	ESNewExperimentButton.click(function (model) {});
	MSHomeButton.click(function (model) {});

	// The text input field relies on an out of view input field that can be copied. It's quite a hack.
	$('#name-file-menu-button').click(function () {
		$('#new-experiment-name-input').focus();
		$('#name-file-menu-button img').fadeIn(100);
		if ($('#name-file-menu-button span').html() === $('#new-experiment-name-input').attr('defaultValue')) {
			$('#name-file-menu-button span').html('');
		}
		$('#name-file-menu-button').css({'padding-top':'12px', 'padding-left':'7px'});
	});

	$('#new-experiment-name-input').keyup(function () {
		$('#name-file-menu-button span').html($(this).val());
	});

	$('#new-experiment-name-input').on('blur', function () {
		$('#name-file-menu-button img').fadeOut(0);
		if ($('#name-file-menu-button span').html() === '') {
			$('#name-file-menu-button span').html($(this).attr('defaultValue'));
		}
		$('#name-file-menu-button').css({'padding-top':'15px', 'padding-left':'0px'});
	});

	///////////////////////////////////
	///////////////	MAIN METHOD
	///////////////

	function attemptToLoadMainContent () {
		ajax('get', 'list_experiments', function (data) {
			// fade ESTraySpacer
			ESTraySpacer.model().fadeOut(1000);

			// for every experiment in data, make a new button
			for (i in data) {
				var experimentName = data[i];
				var experimentButton = new Element('es-experiment-button-{0}'.format(experimentName), BUTTON_TEMPLATE);
				experimentButton.classes = ['btn-experiment'];
				experimentButton.properties['experiment'] = experimentName;
				experimentButton.html = 'Experiment: {0}'.format(experimentName)
				experimentButton.postRenderFunction = function (model) {
					model.css({'opacity':'0'});
					model.delay(1000).animate({'opacity':'1'}, 1000);
				}
				ESTrayContainer.renderChild(experimentButton);
			}
		});
	};

	// run main method
	attemptToLoadMainContent();

	///////////////////////////////////
	///////////////	HELPER METHODS ONLOAD
	///////////////

	// for the on-click, this need to be wired to the body, not the buttons themselves.
	// This means that buttons added dynamically can still respond even though they haven't been explicitly bound
	// to this method.
	body.on('mouseup', '.btn', function () {
		$(this).blur();
	});

});
