$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog
	var settings = require("./settings.json"); // external settings

	///////////////////////////////////
	///////////////	UI ELEMENTS
	/////////////// classes, specificStyle, properties, html, states, stateSwitch, preRenderFunction, postRenderFunction

	// SIDEBARS

	// experiment sidebar
	var experimentSidebar = new Element('experiment-sidebar', SIDEBAR_TEMPLATE);
	experimentSidebar.states[HOME_STATE] = {'css':{'left':'0px'}};
	experimentSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;

	// new experiment sidebar
	var newExperimentSidebar = new Element('new-experiment-sidebar', SIDEBAR_TEMPLATE);
	newExperimentSidebar.classes = ['maxi'];
	newExperimentSidebar.specificStyle = defaultState['css'];
	newExperimentSidebar.states[HOME_STATE] = defaultState;
	newExperimentSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'51px'}};

	// mini sidebar
	var miniSidebar = new Element('mini-sidebar', SIDEBAR_TEMPLATE);
	miniSidebar.classes = ['mini'];
	miniSidebar.specificStyle = defaultState['css'];
	miniSidebar.states[HOME_STATE] = defaultState;
	miniSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'0px'}};

	// series sidebar
	var seriesSidebar = new Element('series-sidebar', SIDEBAR_TEMPLATE);
	seriesSidebar.classes = ['maxi'];
	seriesSidebar.specificStyle = {'left':'-500px','z-index':'-1'};
	seriesSidebar.states[HOME_STATE] = defaultState;
	seriesSidebar.states[NEW_EXPERIMENT_STATE_CREATED] = {'css':{'left':'301px'}, 'fn':function () {
		// as soon as the series sidebar appears (which can only happen if ou make a new experiment),
		// 
	}};

	// BUTTONS
	// ES In Progress Button
	var ESInProgressButton = new Element('es-in-progress-button', BUTTON_TEMPLATE);
	ESInProgressButton.html = 'In progress';
	ESInProgressButton.stateSwitch[HOME_STATE] = IN_PROGRESS_STATE;

	// ES Settings Button
	var ESSettingsButton = new Element('es-settings-button', BUTTON_TEMPLATE);
	ESSettingsButton.html = 'Settings';

	// ES New Experiment Button
	var ESNewExperimentButton = new Element('es-new-experiment-button', BUTTON_TEMPLATE);
	ESNewExperimentButton.html = 'New experiment';
	ESNewExperimentButton.stateSwitch[HOME_STATE] = NEW_EXPERIMENT_STATE;

	// NES Choose Path Button
	var NESChoosePathButton = new Element('nes-choose-path-button', BUTTON_TEMPLATE);
	NESChoosePathButton.html = 'Choose file...';
	NESChoosePathButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.html('Choose file...');
		model.attr('path', '');
	}};

	// NES Name Experiment Button
	var NESNameExperimentButton = new Element('nes-name-experiment-button', BUTTON_TEMPLATE);
	NESNameExperimentButton.html = '<span>Name experiment...</span><img id="nes-name-experiment-cursor" src="./assets/img/cursor.gif" /><input id="nes-name-experiment-input" defaultvalue="Name experiment..." type="text" />'
	NESNameExperimentButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		var input = model.find('input');
		var content = model.find('span');
		content.html(input.attr('defaultvalue'));
	}};

	// NES Choose Lif Path Button
	var NESChooseInfoPathButton = new Element('nes-choose-lif-path-button', BUTTON_TEMPLATE);
	NESChooseInfoPathButton.specificStyle = {'display':'none'};
	NESChooseInfoPathButton.html = 'Choose info file...';
	NESChooseInfoPathButton.states[NEW_EXPERIMENT_STATE_INFO] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}};
	NESChooseInfoPathButton.states[NEW_EXPERIMENT_STATE_NORMAL] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
		model.html('Choose info file...');
		model.attr('path', '');
	}};

	// NES Preview Button
	var NESPreviewButton = new Element('nes-preview-button', BUTTON_TEMPLATE);
	NESPreviewButton.classes = ['btn-success'];
	NESPreviewButton.specificStyle = {'display':'none'};
	NESPreviewButton.html = 'Run preview...';
	NESPreviewButton.states[NEW_EXPERIMENT_STATE_PREVIEW] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}};
	NESPreviewButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}};

	// NES Experiment Created Button
	var NESExperimentCreatedButton = new Element('nes-experiment-created-button', BUTTON_TEMPLATE);
	NESExperimentCreatedButton.classes = ['notouch'];
	NESExperimentCreatedButton.specificStyle = {'display':'none'};
	NESExperimentCreatedButton.html = 'Experiment created:';
	NESExperimentCreatedButton.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESExperimentCreatedButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
		model.html('');
	}}

	// NES Experiment Name Button
	var NESExperimentNameButton = new Element('nes-experiment-name-button', BUTTON_TEMPLATE);
	NESExperimentNameButton.classes = ['notouch'];
	NESExperimentNameButton.specificStyle = {'display':'none'};
	NESExperimentNameButton.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESExperimentNameButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
		model.html('');
	}}

	// MS Home Button
	var MSHomeButton = new Element('ms-home-button', BUTTON_TEMPLATE);
	MSHomeButton.html = '<span class="glyphicon glyphicon-home"></span>';
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE] = HOME_STATE;
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE_INFO] = HOME_STATE;
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE_PREVIEW] = HOME_STATE;

	// MS In Progress Button
	var MSInProgressButton = new Element('ms-in-progress-button', BUTTON_TEMPLATE);
	MSInProgressButton.html = '<span class="glyphicon glyphicon-refresh"></span>';

	// MS Settings Button
	var MSSettingsButton = new Element('ms-settings-button', BUTTON_TEMPLATE);
	MSSettingsButton.html = '<span class="glyphicon glyphicon-cog"></span>';

	// MS New Experiment Button
	var MSNewExperimentButton = new Element('ms-new-experiment-button', BUTTON_TEMPLATE);
	MSNewExperimentButton.html = '<span class="glyphicon glyphicon-plus"></span>';

	// SS Preview Loading Button
	var SSPreviewLoadingButton = new Element('ss-preview-loading-button', BUTTON_TEMPLATE);
	SSPreviewLoadingButton.classes = ['notouch'];

	// OTHER ELEMENTS
	var ESTopSpacer = new Element('es-ts', SPACER_TEMPLATE);
	var ESMiddleSpacer = new Element('es-ms', SPACER_TEMPLATE);
	var ESTraySpacer = new Element('es-tray', SPACER_TEMPLATE);
	ESTraySpacer.specificStyle = {'height':'200px'};
	var ESTrayContainer = new Element('es-tray-container', '<div id={id}></div>')
	var ESTraySpinner = new Element('es-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')
	var NESTopSpacer = new Element('nes-ts', SPACER_TEMPLATE);
	NESTopSpacer.classes = ['top'];
	var NESMiddleSpacer = new Element('nes-ms', SPACER_TEMPLATE);
	NESMiddleSpacer.specificStyle = {'display':'none'};
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE_PREVIEW] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}

	var NESBottomSpacer = new Element('nes-bs', SPACER_TEMPLATE);
	NESBottomSpacer.specificStyle = {'display':'none'};
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}

	var MSTopSpacer = new Element('ms-ts', SPACER_TEMPLATE);
	var SSTopSpacer = new Element('ss-ts', SPACER_TEMPLATE);
	SSTopSpacer.classes = ['top'];
	var SSTraySpacer = new Element('ss-tray', SPACER_TEMPLATE);
	SSTraySpacer.specificStyle = {'height':'200px'};
	var SSTrayContainer = new Element('ss-tray-container', '<div id={id}></div>')
	var SSTraySpinner = new Element('ss-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')

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
	newExperimentSidebar.renderChild(NESNameExperimentButton);
	newExperimentSidebar.renderChild(NESChooseInfoPathButton);
	newExperimentSidebar.renderChild(NESMiddleSpacer);
	newExperimentSidebar.renderChild(NESPreviewButton);
	newExperimentSidebar.renderChild(NESBottomSpacer);
	newExperimentSidebar.renderChild(NESExperimentCreatedButton);
	newExperimentSidebar.renderChild(NESExperimentNameButton);

	// mini sidebar
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	// series sidebar
	seriesSidebar.render(body);
	seriesSidebar.renderChild(SSTopSpacer);
	seriesSidebar.renderChild(SSTrayContainer);
	SSTrayContainer.renderChild(SSTraySpacer);
	SSTraySpacer.renderChild(SSTraySpinner);

	// Need to store application context so it can be recreated.

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	/////////////// must be done after render

	ESInProgressButton.click(function (model) {});
	ESNewExperimentButton.click(function (model) {});

	NESChoosePathButton.click(function (model) {
		dialog.showOpenDialog({properties:['openFile','openDirectory']}, function (filenames) {
			if (typeof filenames !== 'undefined') {
				if (filenames.length === 1) {
					var path = filenames[0];
					var filename = path.replace(/.*(\/|\\)/, '');
					if (filename.indexOf(".") === -1) { // is directory
						model.html("Directory: " + filename + "/");
						model.attr('filetype','D');
						changeState(NEW_EXPERIMENT_STATE_INFO);
					} else {
						model.html("File: " + filename);
						model.attr('filetype','F');
						changeState(NEW_EXPERIMENT_STATE_NORMAL);
						changeState(NEW_EXPERIMENT_STATE_PREVIEW);
					}
					model.attr('path', path);
				}
			}
		});
	});

	NESNameExperimentButton.click(function (model) {
		var input = model.find('input');
		var cursor = model.find('img');
		var	content = model.find('span');

		model.css({'padding-top':'6px', 'padding-left':'18px'});
		input.focus();
		model.blur();
		if (content.html() === input.attr('defaultValue')) {
			content.html('');
			input.val('');
		} else {
			input.val(content.html());
		}

		cursor.fadeIn(0);
	});

	NESNameExperimentButton.once(function (model) {
		var input = model.find('input');
		var cursor = model.find('img');
		var	content = model.find('span');

		input.on('keyup', function () {
			content.html(input.val());
		});
		input.on('blur', function () {
			model.css({'padding-top':'6px', 'padding-left':'12px'});
			cursor.fadeOut(0);
			if (content.html() === '') {
				content.html(input.attr('defaultValue'));
			}
		});
	});

	NESChooseInfoPathButton.click(function (model) {
		dialog.showOpenDialog({properties:['openFile']}, function (filenames) {
			if (typeof filenames !== 'undefined') {
				if (filenames.length === 1) {
					var path = filenames[0];
					var filename = path.replace(/.*(\/|\\)/, '');
					model.html("File: " + filename);
					model.attr('path', path);
					changeState(NEW_EXPERIMENT_STATE_PREVIEW);
				}
			}
		});
	});

	NESPreviewButton.click(function (model) {
		var data = {};
		var error = false;

		data['experiment_name'] = NESNameExperimentButton.model().find('span').html();
		if (NESNameExperimentButton.model().find('span').html() === NESNameExperimentButton.model().find('input').attr('defaultValue')) {
			// highlight button until resolved
			NESNameExperimentButton.model().addClass('btn-danger');
			error = true;
		} else {
			// remove red name button if it is set
			NESNameExperimentButton.model().removeClass('btn-danger');
			error = false;

			data['experiment_path'] = NESChoosePathButton.model().attr('path');
			data['experiment_file_type'] = NESChoosePathButton.model().attr('filetype');

			if (NESChoosePathButton.model().attr('filetype') === 'D') {
				data['experiment_inf_path'] = NESChooseInfoPathButton.model().attr('path');
			} else {
				data['experiment_inf_path'] = '';
			}
		}

		if (!(error)) {
			// send data
			ajax('post', 'create_experiment/', data, function (data) {
				var experimentName = data['name'];
				var status = data['status'];
				console.log(data);

				// update html of buttons
				NESExperimentCreatedButton.model().html('Experiment {0}'.format(status));
				NESExperimentNameButton.model().html(experimentName);

				// go to NEW_EXPERIMENT_STATE_CREATED state
				changeState(NEW_EXPERIMENT_STATE_CREATED);

			});
		}
	});

	MSHomeButton.click(function (model) {});

	///////////////////////////////////
	///////////////	MAIN METHOD
	///////////////

	function attemptToLoadMainContent () {
		ajax('get', 'list_experiments', {}, function (data) {
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
