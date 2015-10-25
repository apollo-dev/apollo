$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog
	var settings = require("./settings.json"); // external settings

	///////////////////////////////////
	///////////////	UI ELEMENTS
	/////////////// classes, specificStyle, properties, html, states, stateSwitch, preRenderFunction, postRenderFunction

	// States
	var NEW_EXPERIMENT_STATE = 'NES';
	var NEW_EXPERIMENT_STATE_INFO = 'NES-I';
	var NEW_EXPERIMENT_STATE_NORMAL = 'NES-N';
	var NEW_EXPERIMENT_STATE_PREVIEW = 'NES-P';
	var NEW_EXPERIMENT_STATE_PREVIEW_START = 'NES-PS';
	var NEW_EXPERIMENT_STATE_CREATED = 'NES-C';
	var IN_PROGRESS_STATE = 'IPS';

	///////////////////////////////////
	/////////////// EXPERIMENT SIDEBAR
	// http://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20
	//         _______        _______
	//        (  ____ \      (  ____ \
	//        | (    \/      | (    \/
	//        | (__          | (_____
	//        |  __)         (_____  )
	//        | (                  ) |
	//        | (____/\      /\____) |
	//        (_______/      \_______)
	//

	// vars
	var experimentSidebar;
	var ESInProgressButton;
	var ESSettingsButton;
	var ESNewExperimentButton;
	var ESTopSpacer;
	var ESMiddleSpacer;
	var ESTraySpacer;
	var ESTrayContainer;
	var ESTraySpinner;
	var ESExperimentButtonDictionary = {}; // stores experiment buttons with experiment name as key

	experimentSidebar = new Element('experiment-sidebar', SIDEBAR_TEMPLATE);
	experimentSidebar.classes = ['maxi'];
	experimentSidebar.states[HOME_STATE] = {'css':{'left':'0px'}};
	experimentSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;

	// ES In Progress Button
	ESInProgressButton = new Element('es-in-progress-button', BUTTON_TEMPLATE);
	ESInProgressButton.html = 'In progress';
	ESInProgressButton.stateSwitch[HOME_STATE] = IN_PROGRESS_STATE;

	// ES Settings Button
	ESSettingsButton = new Element('es-settings-button', BUTTON_TEMPLATE);
	ESSettingsButton.html = 'Settings';

	// ES New Experiment Button
	ESNewExperimentButton = new Element('es-new-experiment-button', BUTTON_TEMPLATE);
	ESNewExperimentButton.html = 'New experiment';
	ESNewExperimentButton.stateSwitch[HOME_STATE] = NEW_EXPERIMENT_STATE;

	// ES Spacers
	ESTopSpacer = new Element('es-ts', SPACER_TEMPLATE);
	ESMiddleSpacer = new Element('es-ms', SPACER_TEMPLATE);
	ESTraySpacer = new Element('es-tray', SPACER_TEMPLATE);
	ESTraySpacer.classes = ['tray']
	ESTraySpacer.specificStyle = {'height':'200px'};

	// ES Other elements
	ESTrayContainer = new Element('es-tray-container', '<div id={id}></div>')
	ESTraySpinner = new Element('es-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')

	// ES RENDER
	experimentSidebar.render(body); // order is top to bottom
	experimentSidebar.renderChild(ESTopSpacer);
	experimentSidebar.renderChild(ESInProgressButton);
	experimentSidebar.renderChild(ESSettingsButton);
	experimentSidebar.renderChild(ESNewExperimentButton);
	experimentSidebar.renderChild(ESMiddleSpacer);
	experimentSidebar.renderChild(ESTrayContainer);
	ESTrayContainer.renderChild(ESTraySpacer);
	ESTraySpacer.renderChild(ESTraySpinner);

	///////////////////////////////////
	/////////////// NEW EXPERIMENT SIDEBAR
	//         _              _______        _______
	//        ( (    /|      (  ____ \      (  ____ \
	//        |  \  ( |      | (    \/      | (    \/
	//        |   \ | |      | (__          | (_____
	//        | (\ \) |      |  __)         (_____  )
	//        | | \   |      | (                  ) |
	//        | )  \  |      | (____/\      /\____) |
	//        |/    )_)      (_______/      \_______)
	//

	// vars
	var newExperimentSidebar;
	var NESChoosePathButton;
	var NESNameExperimentButton;
	var NESPreviewButton;
	var NESExperimentCreatedButton;
	var NESExperimentNameButton;
	var NESExtractingExperimentDetailsButton;
	var NESTopSpacer;
	var NESMiddleSpacer;
	var NESBottomSpacer;
	var NESTraySpacer;
	var NESTrayContainer;
	var NESTraySpinner;
	var NESDetailSpacer;

	newExperimentSidebar = new Element('new-experiment-sidebar', SIDEBAR_TEMPLATE);
	newExperimentSidebar.classes = ['maxi'];
	newExperimentSidebar.specificStyle = defaultState['css'];
	newExperimentSidebar.states[HOME_STATE] = defaultState;
	newExperimentSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'51px'}};

	// NES Choose Path Button
	NESChoosePathButton = new Element('nes-choose-path-button', BUTTON_TEMPLATE);
	NESChoosePathButton.html = 'Choose file...';
	NESChoosePathButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.html('Choose file...');
		model.attr('path', '');
	}};

	// NES Name Experiment Button
	NESNameExperimentButton = new Element('nes-name-experiment-button', BUTTON_TEMPLATE);
	NESNameExperimentButton.html = '<span>Name experiment...</span><img id="nes-name-experiment-cursor" src="./assets/img/cursor.gif" /><input id="nes-name-experiment-input" defaultvalue="Name experiment..." type="text" />'
	NESNameExperimentButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		var input = model.find('input');
		var content = model.find('span');
		content.html(input.attr('defaultvalue'));
	}};

	// NES Preview Button
	NESPreviewButton = new Element('nes-preview-button', BUTTON_TEMPLATE);
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
	NESExperimentCreatedButton = new Element('nes-experiment-created-button', BUTTON_TEMPLATE);
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
	NESExperimentNameButton = new Element('nes-experiment-name-button', BUTTON_TEMPLATE);
	NESExperimentNameButton.classes = ['notouch'];
	NESExperimentNameButton.specificStyle = {'display':'none'};
	NESExperimentNameButton.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESExperimentNameButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
		model.html('');
	}}

	// NES Extracting Experiment Details Button
	NESExtractingExperimentDetailsButton = new Element('nes-extracting-experiment-details-button', BUTTON_TEMPLATE);
	NESExtractingExperimentDetailsButton.classes = ['notouch'];
	NESExtractingExperimentDetailsButton.html = 'Extracting details...';
	NESExtractingExperimentDetailsButton.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESExtractingExperimentDetailsButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}

	// NES Spacers
	NESTopSpacer = new Element('nes-ts', SPACER_TEMPLATE);
	NESTopSpacer.classes = ['top'];
	NESMiddleSpacer = new Element('nes-ms', SPACER_TEMPLATE);
	NESMiddleSpacer.specificStyle = {'display':'none'};
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE_PREVIEW] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}
	NESBottomSpacer = new Element('nes-bs', SPACER_TEMPLATE);
	NESBottomSpacer.specificStyle = {'display':'none'};
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}
	NESTraySpacer = new Element('nes-tray-spacer', SPACER_TEMPLATE);
	NESTraySpacer.classes = ['tray'];
	NESTraySpacer.specificStyle = {'height':'200px'};
	NESTraySpacer.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeIn(defaultAnimationTime);
	}}
	NESTraySpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}}
	NESDetailSpacer = new Element('nes-detail-spacer', SPACER_TEMPLATE);
	NESDetailSpacer.classes = ['content', 'tray'];
	NESDetailSpacer.specificStyle = {'display':'none'};
	NESDetailSpacer.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}};
	NESDetailSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}};
	NESDetailSpacer.states[NEW_EXPERIMENT_STATE_PREVIEW] = {'fn':function (model) {
		model.fadeOut(defaultAnimationTime);
	}};

	// NES Other elements
	NESTrayContainer = new Element('nes-tray-container', '<div id={id}></div>');
	NESTrayContainer.states[NEW_EXPERIMENT_STATE_CREATED] = {'fn':function (model) {
		// when moving into the NE state, a call must be made to extract_experiment_details
		// the result of this call is piped into
		var experimentName = NESNameExperimentButton.model().find('span').html()

		ajax('get', 'extract_experiment_details/{0}'.format(experimentName), {}, function (data) {
			// expecting back: total_time (float), number_of_series (int), image_size ([])
			var number_of_series = data['number_of_series'];

			// set html of detail spacer using data
			NESDetailSpacer.model().html('<p>{0} Series</p>'.format(number_of_series));

			// remove loading icon and notouch button
			NESExtractingExperimentDetailsButton.model().fadeOut(1000);
			NESTraySpacer.model().fadeOut(1000, function () {
				// fade in detail spacer
				NESDetailSpacer.model().fadeIn(1000);
			});
			// change state to NEW_EXPERIMENT_STATE_PREVIEW to trigger series sidebar
			changeState(NEW_EXPERIMENT_STATE_PREVIEW_START);
		});

	}};

	NESTraySpinner = new Element('nes-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')

	// NES RENDER
	newExperimentSidebar.render(body);
	newExperimentSidebar.renderChild(NESTopSpacer);
	newExperimentSidebar.renderChild(NESChoosePathButton);
	newExperimentSidebar.renderChild(NESNameExperimentButton);
	newExperimentSidebar.renderChild(NESMiddleSpacer);
	newExperimentSidebar.renderChild(NESPreviewButton);
	newExperimentSidebar.renderChild(NESBottomSpacer);
	newExperimentSidebar.renderChild(NESExperimentCreatedButton);
	newExperimentSidebar.renderChild(NESExperimentNameButton);
	newExperimentSidebar.renderChild(NESTrayContainer);
	NESTrayContainer.renderChild(NESTraySpacer);
	NESTraySpacer.renderChild(NESTraySpinner);
	NESTrayContainer.renderChild(NESExtractingExperimentDetailsButton);
	NESTrayContainer.renderChild(NESDetailSpacer);

	///////////////////////////////////
	/////////////// MINI SIDEBAR
	//         _______        _______
	//        (       )      (  ____ \
	//        | () () |      | (    \/
	//        | || || |      | (_____
	//        | |(_)| |      (_____  )
	//        | |   | |            ) |
	//        | )   ( |      /\____) |
	//        |/     \|      \_______)
	//

	// vars
	var miniSidebar;
	var MSHomeButton;
	var MSInProgressButton;
	var MSSettingsButton;
	var MSNewExperimentButton;
	var MSTopSpacer;

	miniSidebar = new Element('mini-sidebar', SIDEBAR_TEMPLATE);
	miniSidebar.classes = ['mini'];
	miniSidebar.specificStyle = defaultState['css'];
	miniSidebar.states[HOME_STATE] = defaultState;
	miniSidebar.states[NEW_EXPERIMENT_STATE] = {'css':{'left':'0px'}};

	// MS Home Button
	MSHomeButton = new Element('ms-home-button', BUTTON_TEMPLATE);
	MSHomeButton.html = '<span class="glyphicon glyphicon-home"></span>';
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE] = HOME_STATE;
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE_INFO] = HOME_STATE;
	MSHomeButton.stateSwitch[NEW_EXPERIMENT_STATE_PREVIEW] = HOME_STATE;

	// MS In Progress Button
	MSInProgressButton = new Element('ms-in-progress-button', BUTTON_TEMPLATE);
	MSInProgressButton.html = '<span class="glyphicon glyphicon-refresh"></span>';

	// MS Settings Button
	MSSettingsButton = new Element('ms-settings-button', BUTTON_TEMPLATE);
	MSSettingsButton.html = '<span class="glyphicon glyphicon-cog"></span>';

	// MS New Experiment Button
	MSNewExperimentButton = new Element('ms-new-experiment-button', BUTTON_TEMPLATE);
	MSNewExperimentButton.html = '<span class="glyphicon glyphicon-plus"></span>';

	// MS Spacers
	MSTopSpacer = new Element('ms-ts', SPACER_TEMPLATE);

	// MS RENDER
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	///////////////////////////////////
	/////////////// SERIES SIDEBAR
	//         _______        _______
	//        (  ____ \      (  ____ \
	//        | (    \/      | (    \/
	//        | (_____       | (_____
	//        (_____  )      (_____  )
	//              ) |            ) |
	//        /\____) |      /\____) |
	//        \_______)      \_______)
	//

	// vars
	var seriesSidebar;
	var SSTopSpacer;
	var SSTrayContainer;
	var SSTraySpacer;
	var SSTraySpinner;
	var SSPreviewLoadingButton;
	var SSSeriesPreviewTrayDictionary = {}; // stores elements with series names as keys
	var SSSeriesPreviewContentTrayDictionary = {};
	var SSSeriesPreviewButtonDictionary = {};

	seriesSidebar = new Element('series-sidebar', SIDEBAR_TEMPLATE);
	seriesSidebar.classes = ['maxi'];
	seriesSidebar.specificStyle = {'left':'-500px','z-index':'-1'};
	seriesSidebar.states[HOME_STATE] = defaultState;
	seriesSidebar.states[NEW_EXPERIMENT_STATE_PREVIEW_START] = {'css':{'left':'301px'}, 'fn':function (model) {
		// as soon as the series sidebar appears (which can only happen if you make a new experiment),
		// a request needs to be sent for the list of series
		var experimentName = NESNameExperimentButton.model().find('span').html();

		ajax('get', 'list_series/{0}'.format(experimentName), {}, function (data) {
			// remove placeholding interface elements
			SSTraySpacer.model().fadeOut(defaultAnimationTime);
			SSPreviewLoadingButton.model().fadeOut(defaultAnimationTime);

			// replace interface elements with temporary placeholders
			for (s in data) {
				var seriesName = data[s];
				// define trays and spinners and be sure to add the states for fading out when the previews have loaded.
				// post render should fade them in
				var seriesPreviewTray = new Element('ss-preview-tray-{0}'.format(seriesName), SPACER_TEMPLATE);
				seriesPreviewTray.classes = ['tray']
				seriesPreviewTray.specificStyle = {'height':'200px'};
				seriesPreviewTray.postRenderFunction = function (model) {
					model.css({'opacity':'0'});
					model.delay(1000).animate({'opacity':'1'}, 1000);
				}
				SSSeriesPreviewTrayDictionary[seriesName] = seriesPreviewTray;
				seriesSidebar.renderChild(seriesPreviewTray);

				var seriesPreviewSpinner = new Element('ss-preview-spinner-{0}'.format(seriesName), '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />');
				seriesPreviewTray.renderChild(seriesPreviewSpinner);

				var seriesPreviewButton = new Element('ss-preview-button-{0}'.format(seriesName), BUTTON_TEMPLATE);
				seriesPreviewButton.html = 'Series {0}'.format(seriesName);
				seriesPreviewButton.postRenderFunction = function (model) {
					model.css({'opacity':'0'});
					model.delay(1000).animate({'opacity':'1'}, 1000);
				}

				seriesSidebar.renderChild(seriesPreviewButton);

				if (s !== data.length-1) {
					// insert spacer as well
					var seriesPreviewSpacer = new Element('ss-preview-spacer-{0}'.format(seriesName), SPACER_TEMPLATE);
					seriesPreviewSpacer.postRenderFunction = function (model) {
						model.css({'opacity':'0'});
						model.delay(1000).animate({'opacity':'1'}, 1000);
					}
					seriesSidebar.renderChild(seriesPreviewSpacer);
				}
			}

			// Make a series preview loader for each series in the list
			// data is list of series names
			

			// var firstSeriesName = data[0];
			// var insertPreview = function (data) {
			// 	var imgPath = data['img_path'];
			// 	var experimentName = data['experiment_name'];
			// 	var seriesName = data['series_name'];
			//
			// 	// fade spinner
			// 	var tray = SSSeriesPreviewTrayDictionary[seriesName];
			// 	tray.model().find('.spinner').fadeOut(defaultAnimationTime, function () {
			// 		var previewImage = new Element('ss-preview-image-{0}'.format(seriesName), '<img id={id} style="width:100%;" />');
			// 		previewImage.properties['src'] = imgPath;
			// 		previewImage.postRenderFunction = function (model) {
			// 			model.css({'opacity':'0'});
			// 			model.delay(1000).animate({'opacity':'1'}, 1000);
			// 		};
			//
			// 		tray.renderChild(previewImage);
			// 		tray.model().removeAttr('height');
			// 	});
			// };
			//
			// ajax('get', 'generate_series_preview/{0}/{1}'.format(experimentName, firstSeriesName), {}, insertPreview).then(function () {
			// 	for (s in data) {
			// 		if (s !== 0) {
			// 			seriesName = data[s];
			// 			ajax('get', 'generate_series_preview/{0}/{1}'.format(experimentName, seriesName), {}, insertPreview);
			// 		}
			// 	}
			// });
		});
	}};

	// SS Preview Loading Button
	SSPreviewLoadingButton = new Element('ss-preview-loading-button', BUTTON_TEMPLATE);
	SSPreviewLoadingButton.classes = ['notouch'];
	SSPreviewLoadingButton.html = 'Generating series previews..';

	// SS Spacers
	SSTopSpacer = new Element('ss-ts', SPACER_TEMPLATE);
	SSTopSpacer.classes = ['top'];
	SSTraySpacer = new Element('ss-tray', SPACER_TEMPLATE);
	SSTraySpacer.classes = ['tray'];
	SSTraySpacer.specificStyle = {'height':'200px'};

	// SS Other elements
	SSTrayContainer = new Element('ss-tray-container', '<div id={id}></div>')
	SSTraySpinner = new Element('ss-tray-spinner', '<img id={id} class="spinner" src="./assets/img/colour-loader.gif" />')

	// SS RENDER
	seriesSidebar.render(body);
	seriesSidebar.renderChild(SSTopSpacer);
	seriesSidebar.renderChild(SSTrayContainer);
	SSTrayContainer.renderChild(SSTraySpacer);
	SSTraySpacer.renderChild(SSTraySpinner);
	seriesSidebar.renderChild(SSPreviewLoadingButton);

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	/////////////// must be done after render

	ESInProgressButton.click(function (model) {});
	ESNewExperimentButton.click(function (model) {});

	NESChoosePathButton.click(function (model) {
		dialog.showOpenDialog({properties:['openFile']}, function (filenames) {
			if (typeof filenames !== 'undefined') {
				if (filenames.length === 1) {
					var path = filenames[0];
					var filename = path.replace(/.*(\/|\\)/, '');
					model.html("File: " + filename);
					model.attr('filetype','F');
					changeState(NEW_EXPERIMENT_STATE_PREVIEW);
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

			data['lif_path'] = NESChoosePathButton.model().attr('path');
		}

		if (!(error)) {
			// send data
			ajax('post', 'create_experiment', data, function (data) {
				var experimentName = data['name'];
				var status = data['status'];

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
			ESMiddleSpacer.model().fadeOut(1000);

			// for every experiment in data, make a new button
			if (data.length !== 0) {
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
					ESExperimentButtonDictionary[experimentName] = experimentButton;
					ESTrayContainer.renderChild(experimentButton);
				}
			} else {
				var nonExperimentButton = new Element('es-non-experiment-button', BUTTON_TEMPLATE);
				nonExperimentButton.classes = ['notouch']
				nonExperimentButton.html = 'No experiments';
				nonExperimentButton.postRenderFunction = function (model) {
					model.css({'opacity':'0'});
					model.delay(1000).animate({'opacity':'1'}, 1000);
				}
				ESExperimentButtonDictionary[experimentName] = experimentButton;
				ESTrayContainer.renderChild(nonExperimentButton);
			}

			ESMiddleSpacer.model().fadeIn(1000);
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
