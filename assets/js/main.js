$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog

	///////////////////////////////////
	///////////////	UI ELEMENTS
	/////////////// classes, specificStyle, properties, html, states, stateSwitch, preRenderFunction, postRenderFunction

	///////////////////////////////////
	/////////////// STATES
	var NEW_EXPERIMENT_STATE = 'NewExperimentState';
	var NEW_EXPERIMENT_STATE_EXPERIMENT_CHOSEN = 'NewExperimentStateExperimentChosen';
	var NEW_EXPERIMENT_STATE_EXPERIMENT_REQUESTED = 'NewExperimentStateExperimentRequested';
	var NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED = 'NewExperimentStateExperimentReceived';
	var NEW_EXPERIMENT_STATE_GENERATE_PREVIEW = 'NewExperimentStateGeneratePreview';
	var NEW_EXPERIMENT_STATE_SERIES_INFO = 'NewExperimentStateSeriesInfo';
	var NEW_EXPERIMENT_STATE_SERIES_EXTRACTING = 'a';
	var EXPERIMENT_STATE = 'ExperimentState';
	var PROGRESS_STATE = 'ProgressState';
	var SETTINGS_STATE = 'SettingsState';
	var SEGMENT_STATE = 'SegmentState';

	///////////////////////////////////
	/////////////// ELEMENT VARS
	// TRACK CONTAINER
	var trackContainer;

	// IMAGE PALETTE
	var imagePalette;
	var IPImageContainer;
	var IPCanvasContainer;

	// CANVAS CONTAINER
	var paperMarkerCanvas;
	var paperRegionCanvas;
	var paperSliceCanvas;
	var paperLassoCanvas;

	// PAPER SCRIPTS
	var paperMarkerScript;
	var paperRegionScript;
	var paperSliceScript;
	var paperLassoScript;

	// CHANNEL PALETTE
	var channelPalette;

	// TRACK PALETTE
	var trackPalette;

	// EXPERIMENT SIDEBAR
	var experimentSidebar;
	var ESInProgressButton;
	var ESSettingsButton;
	var ESNewExperimentButton;
	var ESTopSpacer;
	var ESMiddleSpacer;
	var ESActiveExperimentsContentButton;
	var ESTrayContainer;
	var ESExperimentButtonDictionary = {}; // stores experiment buttons with experiment name as key

	// INFO SIDEBAR
	var infoSidebar;
	var INFSTopSpacer;
	var INFSInfoContentButton;
	var INFSTrayContainer;
	var INFSInfoSpacer;
	var INFSMiddleSpacer;
	var INFSExtractButton;

	// NEW EXPERIMENT SIDEBAR
	var newExperimentSidebar;
	var NESTopSpacer;
	var NESLifPathButton;
	var NESExperimentNameButton;
	var NESExperimentNameInput;
	var NESMiddleSpacer;
	var NESPreviewButton;
	var NESBottomSpacer;
	var NESExperimentCreatedContentButton;
	var NESExperimentNameContentButton;
	var NESPartialMetadataExtractionProgressButton;
	var NESMetadataExtractionProgressButton;
	var NESPreviewImagesExtractionProgressButton;
	var NESTrayContainer;
	var NESExtractingExperimentDetailsButton;
	var NESDetailSpacer;

	// SERIES SIDEBAR
	var seriesSidebar;
	var SSTopSpacer;
	var SSSeriesContentButton;
	var SSMiddleSpacer;
	var SSTrayContainer;
	var SSGeneratingPreviewContentButton;
	var SSSeriesPreviewContainerDictionary = {}; // stores elements with series names as keys
	var SSSeriesPreviewButtonDictionary = {};
	var SSSeriesPreviewSpacerDictionary = {};

	// CURRENT EXPERIMENT SIDEBAR
	var currentExperimentSidebar;
	var CESTopSpacer;
	var CESExperimentNameContentButton;
	var CESExperimentDetailContainer;
	var CESLoadingExperimentDetailContentButton;
	var CESExperimentDetailSpacer;
	var CESMiddleSpacer;
	var CESUnextractedHighDimensionSeriesContentButton;
	var CESUnextractedHighDimensionSeriesContainer;

	// COMPOSITE SIDEBAR
	var compositeSidebar;
	var CSTopSpacer;
	var CSCompositeContentButton;
	var CSMiddleSpacer;
	var CSTrayContainer;
	var CSGeneratingPreviewContentButton;
	var CSSeriesPreviewTrayDictionary = {};
	var CSSeriesPreviewContentTrayDictionary = {};
	var CSSeriesPreviewButtonDictionary = {};

	// CHANNEL SIDEBAR
	var channelSidebar;
	var CHSTopSpacer;
	var CHSChannelContentButton;
	var CHSMiddleSpacer;
	var CHSTrayContainer;
	var CHSChannelDictionary = {};
	var CHSBottomSpacer;
	var CHSExtractButton;

	// MOD SIDEBAR
	var modSidebar;
	var MODSTopSpacer;
	var MODSModContentButton;
	var MODSMiddleSpacer;
	var MODSAvailableModsContentButton;
	var MODSAvailableModsContainer;
	var MODSAvailableModsButtonDictionary = {};
	var MODSBottomSpacer;
	var MODSExistingModsContentButton;
	var MODSExistingModsContainer;
	var MODSExistingModsButtonDictionary = {};

	// PROGRESS DETAIL SIDEBAR
	var progressDetailSidebar;
	var PDSTopSpacer;
	var PDSProgressDetailContentButton;
	var PDSTestProgress;
	var PDSMiddleSpacer;
	var PDSProgressDetailButtonDictionary = {};

	// PROGRESS SIDEBAR
	var progressSidebar;
	var PROGSTopSpacer;
	var PROGSInProgressContentButton;
	var PROGSMiddleSpacer;
	var PROGSButtonDictionary;

	// SETTING SIDEBAR
	var settingsSidebar;
	var SETSTopSpacer;
	var SETSInProgressContentButton;
	var SETSMiddleSpacer;
	var SETSInProgressContainer;
	var SETSInProgressButtonDictionary = {};

	// MINI SIDEBAR
	var miniSidebar;
	var MSTopSpacer;
	var MSHomeButton;
	var MSInProgressButton;
	var MSSettingsButton;
	var MSNewExperimentButton;

	// BACK MINI SIDEBAR
	var backMiniSidebar;
	var BMSTopSpacer;
	var BMSBackButton;

	// SEGMENTATION CONSOLE
	var segmentationConsole;
	var SCONMarkerTimepointLockButtonTab;
	var SCONMarkerPlacementButtonQ;
	var SCONMultichannelBalloonSelectionButtonW;
	var SCONFreehandSelectionButtonE;
	var SCONSliceSelectionButtonR;
	var SCONRectangleSelectionButtonT;
	var SCONTimepointFirstButtonA;
	var SCONTimepointPreviousButtonS;
	var SCONTimepointNextButtonD;
	var SCONTimepointLastButtonF;

	///////////////////////////////////
	/////////////// TRACK CONTAINER
	// http://patorjk.com/software/taag/#p=display&f=Epic&t=Type%20Something%20
	//        _________       _______
	//        \__   __/      (  ____ \
	//           ) (         | (    \/
	//           | |         | |
	//           | |         | |
	//           | |         | |
	//           | |         | (____/\
	//           )_(         (_______/
	//

	// TC
	trackContainer = new Element('track-container', BASIC_TEMPLATE);

	///////////////////////////////////
	/////////////// IMAGE PALETTE
	// image palette has a defined size and no default placement of an image can extend beyond it without user action.
	// also bottom level element
	//        _________       _______
	//        \__   __/      (  ____ )
	//           ) (         | (    )|
	//           | |         | (____)|
	//           | |         |  _____)
	//           | |         | (
	//        ___) (___      | )
	//        \_______/      |/
	//
	// Multi touch: http://www.html5rocks.com/en/mobile/touch/

	// IP
	imagePalette = new Element('image-palette', BASIC_TEMPLATE);
	imagePalette.specificStyle = {
		'position':'fixed',
		'top':'141px',
		'left':'51px',
		'min-height':'256px',
		'min-width':'512px',
		'height':'calc(100% - 201px)',
		'width':'calc(100% - 111px)',
		'border':'1px solid #CCC',
	};

	// IP Image Container
	IPImageContainer = new Element('ip-image-container', BASIC_TEMPLATE);
	IPImageContainer.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	// IP Canvas Container
	IPCanvasContainer = new Element('ip-canvas-container', BASIC_TEMPLATE);
	IPCanvasContainer.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	///////////////////////////////////
	/////////////// CANVAS CONTAINER
	//         _______        _______
	//        (  ____ \      (  ____ \
	//        | (    \/      | (    \/
	//        | |            | |
	//        | |            | |
	//        | |            | |
	//        | (____/\      | (____/\
	//        (_______/      (_______/
	//

	// PMC
	paperMarkerCanvas = new Element(window.paperMarkerScope['canvas'], CANVAS_TEMPLATE);
	paperMarkerCanvas.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	// PRC
	paperRegionCanvas = new Element(window.paperRegionScope['canvas'], CANVAS_TEMPLATE);
	paperRegionCanvas.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	// PSC
	paperSliceCanvas = new Element(window.paperSliceScope['canvas'], CANVAS_TEMPLATE);
	paperSliceCanvas.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	// PLC
	paperLassoCanvas = new Element(window.paperLassoScope['canvas'], CANVAS_TEMPLATE);
	paperLassoCanvas.specificStyle = {'position':'absolute', 'height':'100%', 'width':'100%'};

	///////////////////////////////////
	/////////////// PAPER SCRIPTS
	//         _______        _______
	//        (  ____ )      (  ____ \
	//        | (    )|      | (    \/
	//        | (____)|      | (_____
	//        |  _____)      (_____  )
	//        | (                  ) |
	//        | )            /\____) |
	//        |/             \_______)
	//
	var paperDir = './assets/js/paper/{0}.js';

	// marker
	paperMarkerScript = new Element('paper-marker-script', PAPERSCRIPT_TEMPLATE);
	paperMarkerScript.properties['src'] = paperDir.format('marker');
	paperMarkerScript.properties['canvas'] = window.paperMarkerScope['canvas'];

	// region
	paperRegionScript = new Element('paper-region-script', PAPERSCRIPT_TEMPLATE);
	paperRegionScript.properties['src'] = paperDir.format('region');
	paperRegionScript.properties['canvas'] = window.paperRegionScope['canvas'];

	// slice
	paperSliceScript = new Element('paper-slice-script', PAPERSCRIPT_TEMPLATE);
	paperSliceScript.properties['src'] = paperDir.format('slice');
	paperSliceScript.properties['canvas'] = window.paperSliceScope['canvas'];

	// lasso
	paperLassoScript = new Element('paper-lasso-script', PAPERSCRIPT_TEMPLATE);
	paperLassoScript.properties['src'] = paperDir.format('lasso');
	paperLassoScript.properties['canvas'] = window.paperLassoScope['canvas'];

	///////////////////////////////////
	/////////////// CHANNEL PALETTE
	//         _______        _______
	//        (  ____ \      (  ____ )
	//        | (    \/      | (    )|
	//        | |            | (____)|
	//        | |            |  _____)
	//        | |            | (
	//        | (____/\      | )
	//        (_______/      |/
	//

	// CP
	channelPalette = new Element('channel-palette', BASIC_TEMPLATE);
	channelPalette.specificStyle = {
		'position':'fixed',
		'top':'141px',
		'left':'calc(100% - 50px)',
		'height':'200px',
		'width':'100%',
		'border':'1px solid #CCC',
	};

	///////////////////////////////////
	/////////////// TRACK PALETTE
	//        _________       _______
	//        \__   __/      (  ____ )
	//           ) (         | (    )|
	//           | |         | (____)|
	//           | |         |  _____)
	//           | |         | (
	//           | |         | )
	//           )_(         |/
	//

	// TP
	trackPalette = new Element('track-palette', BASIC_TEMPLATE);
	trackPalette.specificStyle = {
		'position':'fixed',
		'top':'calc(100% - 50px)',
		'left':'51px',
		'height':'100%',
		'min-width':'512px',
		'width':'calc(100% - 111px)',
		'border':'1px solid #CCC',
	};

	///////////////////////////////////
	/////////////// EXPERIMENT SIDEBAR
	// http://patorjk.com/software/taag/#p=display&f=Epic&t=Type%20Something%20
	//         _______        _______
	//        (  ____ \      (  ____ \
	//        | (    \/      | (    \/
	//        | (__          | (_____
	//        |  __)         (_____  )
	//        | (                  ) |
	//        | (____/\      /\____) |
	//        (_______/      \_______)
	//

	// ES
	experimentSidebar = new Element('experiment-sidebar', SIDEBAR_TEMPLATE);
	// experimentSidebar.specificStyle = defaultState['css'];
	// experimentSidebar.states[HOME_STATE] = defaultState;
	experimentSidebar.states[HOME_STATE] = {
		'css':{'left':'0px'},
	};
	experimentSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	experimentSidebar.states[EXPERIMENT_STATE] = defaultState;
	experimentSidebar.states[PROGRESS_STATE] = defaultState;
	experimentSidebar.states[SETTINGS_STATE] = defaultState;

	// ES Top Spacer
	ESTopSpacer = new Element('es-ts', SPACER_TEMPLATE);

	// ES In Progress Button
	ESInProgressButton = new Element('es-in-progress-button', BUTTON_TEMPLATE);
	ESInProgressButton.html = 'In progress';

	// ES Settings Button
	ESSettingsButton = new Element('es-settings-button', BUTTON_TEMPLATE);
	ESSettingsButton.html = 'settings';

	// ES New Experiment Button
	ESNewExperimentButton = new Element('es-new-experiment-button', BUTTON_TEMPLATE);
	ESNewExperimentButton.html = 'New experiment';

	// ES Middle Spacer
	ESMiddleSpacer = new Element('es-ms', SPACER_TEMPLATE);

	// ES Active Experiments Content Button
	ESActiveExperimentsContentButton = new Element('es-active-experiments-content-button', BUTTON_TEMPLATE);
	// ESActiveExperimentsContentButton.classes = ['notouch'];
	ESActiveExperimentsContentButton.html = 'Active experiments';

	// ES Tray Container
	ESTrayContainer = new Element('es-tray-container', CONTAINER_TEMPLATE);

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

	// NES
	newExperimentSidebar = new Element('new-experiment-sidebar', SIDEBAR_TEMPLATE);
	newExperimentSidebar.specificStyle = defaultState['css'];
	newExperimentSidebar.states[HOME_STATE] = defaultState;
	newExperimentSidebar.states[NEW_EXPERIMENT_STATE] = {
		'css':{'left':'50px'},
		'time':defaultAnimationTime
	}
	newExperimentSidebar.states[PROGRESS_STATE] = defaultState;
	newExperimentSidebar.states[SETTINGS_STATE] = defaultState;

	// NES Top Spacer
	NESTopSpacer = new Element('nes-ts', SPACER_TEMPLATE);

	// NES Lif Path Button
	NESLifPathButton = new Element('nes-lif-path-button', BUTTON_TEMPLATE);
	NESLifPathButton.html = 'Choose .lif path...';
	NESLifPathButton.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.html('Choose .lif path...');
		model.attr('path', '');
	}};

	// NES Experiment Name Button
	NESExperimentNameButton = new Element('nes-experiment-name-button', BUTTON_TEMPLATE);
	NESExperimentNameButton.classes = ['progress-inset'];

	// NES Experiment Name Input
	NESExperimentNameInput = new Element('nes-experiment-name-input', INPUT_TEMPLATE);
	NESExperimentNameInput.specificStyle = {'width':'125px', 'text-align':'center', 'background-color':'transparent'};
	NESExperimentNameInput.properties['defaultValue'] = 'Experiment name...';
	NESExperimentNameInput.properties['value'] = 'Experiment name...';
	NESExperimentNameInput.states[NEW_EXPERIMENT_STATE] = {'fn':function (model) {
		model.val(model.attr('defaultValue'));
	}};

	// NES Middle Spacer
	NESMiddleSpacer = new Element('nes-ms', SPACER_TEMPLATE);
	NESMiddleSpacer.specificStyle = {'display':'none'};
	NESMiddleSpacer.states[HOME_STATE] = invisibleState;
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':fadeOut};
	NESMiddleSpacer.states[NEW_EXPERIMENT_STATE_EXPERIMENT_CHOSEN] = {'fn':fadeIn};

	// NES Preview Button
	NESPreviewButton = new Element('nes-preview-button', BUTTON_TEMPLATE);
	NESPreviewButton.classes = ['btn-success'];
	NESPreviewButton.html = 'Generate preview...';
	NESPreviewButton.specificStyle = {'display':'none'};
	NESPreviewButton.states[HOME_STATE] = invisibleState;
	NESPreviewButton.states[NEW_EXPERIMENT_STATE] = {'fn':fadeOut};
	NESPreviewButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_CHOSEN] = {'fn':fadeIn};

	// NES Bottom Spacer
	NESBottomSpacer = new Element('nes-bs', SPACER_TEMPLATE);
	NESBottomSpacer.specificStyle = {'display':'none'};
	NESBottomSpacer.states[HOME_STATE] = invisibleState;
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESBottomSpacer.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};

	// NES Experiment Created Content Button
	NESExperimentCreatedContentButton = new Element('nes-experiment-created-content-button', BUTTON_TEMPLATE);
	NESExperimentCreatedContentButton.classes = ['notouch'];
	NESExperimentCreatedContentButton.specificStyle = {'display':'none'};
	NESExperimentCreatedContentButton.states[HOME_STATE] = invisibleState;
	NESExperimentCreatedContentButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESExperimentCreatedContentButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};

	// NES Experiment Name Content Button
	NESExperimentNameContentButton = new Element('nes-experiment-name-content-button', BUTTON_TEMPLATE);
	NESExperimentNameContentButton.classes = ['notouch'];
	NESExperimentNameContentButton.specificStyle = {'display':'none'};
	NESExperimentNameContentButton.states[HOME_STATE] = invisibleState;
	NESExperimentNameContentButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESExperimentNameContentButton.local(NEW_EXPERIMENT_STATE_EXPERIMENT_REQUESTED, NESPreviewButton, function (model, args) {
		// need to modify html of button with callback
		var experimentCreatedButton = NESExperimentCreatedContentButton.model();

		// ajax
		ajax('create_experiment', args, function (data) {
			experimentCreatedButton.html('Experiment: {0}'.format(data['status']));
			model.html(data['name']);

			changeState(model.attr('id'), NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED, args);
		});
	});
	NESExperimentNameContentButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};

	// NES Partial Metadata Extraction Progress Button
	NESPartialMetadataExtractionProgressButton = new Element('nes-partial-metadata-extraction-progress-button', BUTTON_TEMPLATE);
	NESPartialMetadataExtractionProgressButton.specificStyle = {'display':'none'};
	NESPartialMetadataExtractionProgressButton.states[HOME_STATE] = invisibleState;
	NESPartialMetadataExtractionProgressButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESPartialMetadataExtractionProgressButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};
	NESPartialMetadataExtractionProgressButton.html = '<div class="streamer"></div>';
	NESPartialMetadataExtractionProgressButton.local(NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED, NESExperimentNameContentButton, function (model, args) {
		var streamer = model.find('.streamer');

		// ajax
		ajax('extract_partial_metadata', args, function (data) {
			ajaxloop('experiment_monitor', args, function (data) {
				// repeat callback

			}, function (data) {
				// completion condition
				return data['partial_metadata_extraction_complete']

			}, function (data) {
				// completion callback
				streamer.animate({'left':'-0px'}, 500);
			});
		});
	});

	// NES Metadata Extraction Progress Button
	NESMetadataExtractionProgressButton = new Element('nes-metadata-extraction-progress-button', BUTTON_TEMPLATE);
	NESMetadataExtractionProgressButton.specificStyle = {'display':'none'};
	NESMetadataExtractionProgressButton.states[HOME_STATE] = invisibleState;
	NESMetadataExtractionProgressButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESMetadataExtractionProgressButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};
	NESMetadataExtractionProgressButton.html = '<div class="streamer"></div>';
	NESMetadataExtractionProgressButton.local(NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED, NESExperimentNameContentButton, function (model, args) {
		var streamer = model.find('.streamer');

		// ajax
		ajax('extract_metadata', args, function (data) {
			ajaxloop('experiment_monitor', args, function (data) {
				// repeat callback

			}, function (data) {
				// completion condition
				return data['metadata_extraction_complete']

			}, function (data) {
				// completion callback
				streamer.animate({'left':'-0px'}, 500);

			});
		});
	});

	// NES Preview Images Extraction Progress Button
	NESPreviewImagesExtractionProgressButton = new Element('nes-preview-images-extraction-progress-button', BUTTON_TEMPLATE);
	NESPreviewImagesExtractionProgressButton.specificStyle = {'display':'none'};
	NESPreviewImagesExtractionProgressButton.states[HOME_STATE] = invisibleState;
	NESPreviewImagesExtractionProgressButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESPreviewImagesExtractionProgressButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};
	NESPreviewImagesExtractionProgressButton.html = '<div class="streamer"></div>';
	NESPreviewImagesExtractionProgressButton.local(NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED, NESExperimentNameContentButton, function (model, args) {
		var streamer = model.find('.streamer');

		// ajax
		ajax('extract_preview_images', args, function (data) {
			ajaxloop('experiment_monitor', args, function (data) {
				// repeat callback
				var percentage = data['series_preview_images_extraction_percentage']; // returns an int
				var left = 200 - 2*percentage; // fit button
				streamer.animate({'left':'-{0}px'.format()}, 500);

			}, function (data) {
				// completion condition
				return data['series_preview_images_extraction_complete']

			}, function (data) {
				// completion callback
				streamer.animate({'left':'-0px'}, 500);

			});
		});
	});

	// NES Tray Container
	NESTrayContainer = new Element('nes-tray-container', CONTAINER_TEMPLATE);
	NESTrayContainer.specificStyle = {'display':'none'};
	NESTrayContainer.states[HOME_STATE] = invisibleState;
	NESTrayContainer.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESTrayContainer.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};
	NESTrayContainer.local(NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED, NESExperimentNameContentButton, function (model, args) {
		// other elements
		var detailButton = NESExtractingExperimentDetailsContentButton.model();
		var detailSpacer = NESDetailSpacer.model();

		// ajax
		ajaxloop('experiment_monitor', args, function (data) {
			// repeat callback
			// 1. set text of detail button to be "extracting metadata..."
			//

		}, function (data) {
			// completion condition
			// 1. data contains {metadata_extraction_complete: True}
			return data['metadata_extraction_complete']

		}, function (data) {
			// completion callback
			// 1. make another request for experiment metadata
			ajax('experiment_metadata', args, function (data) {
				// update detail spacer
				// detailSpacer.html('<p>Number of series: {0}</p>'.format(data['number_of_series']));

				// trigger generate preview
				// changeState(model.attr('id'), NEW_EXPERIMENT_STATE_GENERATE_PREVIEW, args);
			});
		});
	});

	// NES Extracting Experiment Details Button
	NESExtractingExperimentDetailsContentButton = new Element('nes-extracting-experiment-details-content-button', BUTTON_TEMPLATE);
	NESExtractingExperimentDetailsContentButton.classes = ['notouch'];
	NESExtractingExperimentDetailsContentButton.html = 'Extracting details..';
	NESExtractingExperimentDetailsContentButton.states[HOME_STATE] = invisibleState;
	NESExtractingExperimentDetailsContentButton.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESExtractingExperimentDetailsContentButton.states[NEW_EXPERIMENT_STATE_EXPERIMENT_RECEIVED] = {'fn':fadeIn};

	// NES Detail Spacer
	NESDetailSpacer = new Element('nes-detail-spacer', SPACER_TEMPLATE);
	NESDetailSpacer.classes = ['content'];
	NESDetailSpacer.specificStyle = {'display':'none'};
	NESDetailSpacer.states[HOME_STATE] = invisibleState;
	NESDetailSpacer.states[NEW_EXPERIMENT_STATE] = invisibleState;
	NESDetailSpacer.states[NEW_EXPERIMENT_STATE_GENERATE_PREVIEW] = {'fn':function (model) {
		var tray = NESTrayContainer.model().find('.tray');
		var button = NESExtractingExperimentDetailsContentButton.model();

		button.fadeOut(defaultAnimationTime, function () {
			tray.fadeOut(defaultAnimationTime, function () {
				model.fadeIn(defaultAnimationTime);
			})
		});
	}};

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

	// SS
	seriesSidebar = new Element('series-sidebar', SIDEBAR_TEMPLATE);
	seriesSidebar.specificStyle = defaultState['css'];
	seriesSidebar.states[HOME_STATE] = defaultState;
	seriesSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	seriesSidebar.states[NEW_EXPERIMENT_STATE_GENERATE_PREVIEW] = {
		'css':{'left':'300px'},
		'time':defaultAnimationTime,
		'fn':function (model) {
			model.find('.tray').fadeIn(defaultAnimationTime);

			// remove all previous series previews
			for (key in SSSeriesPreviewContainerDictionary) {
				var container = SSSeriesPreviewContainerDictionary[key];
				var button = SSSeriesPreviewButtonDictionary[key];
				var spacer = SSSeriesPreviewSpacerDictionary[key];

				container.model().remove();
				button.model().remove();
				spacer.model().remove();
			}

			// clear dictionaries
			SSSeriesPreviewContainerDictionary = {};
			SSSeriesPreviewButtonDictionary = {};
			SSSeriesPreviewSpacerDictionary = {};
		}
	}

	seriesSidebar.states[PROGRESS_STATE] = defaultState;
	seriesSidebar.states[SETTINGS_STATE] = defaultState;

	// SS Top Spacer
	SSTopSpacer = new Element('ss-ts', SPACER_TEMPLATE);

	// SS Series Content Button
	SSSeriesContentButton = new Element('ss-series-content-button', BUTTON_TEMPLATE);
	SSSeriesContentButton.classes = ['notouch'];
	SSSeriesContentButton.html = 'Available series';

	// SS Middle Spacer
	SSMiddleSpacer = new Element('ss-ms', SPACER_TEMPLATE);

	// SS Tray Container
	SSTrayContainer = new Element('ss-tray-container', CONTAINER_TEMPLATE);
	SSTrayContainer.states[NEW_EXPERIMENT_STATE_GENERATE_PREVIEW] = {
		'fn':function (model) {
			model.find('.tray').fadeIn(defaultAnimationTime);
		}
	}
	SSTrayContainer.local(NEW_EXPERIMENT_STATE_GENERATE_PREVIEW, NESTrayContainer, function (model, args) {
		var button = SSPreviewLoadingButton.model();
		var tray = model.find('.tray');
		var middleSpacer = SSMiddleSpacer.model();

		// make ajax request for series list
		ajax('list_series', args, function (data) {
			// fade tray
			button.fadeOut(defaultAnimationTime, function () {
				middleSpacer.animate({'opacity':'0'}, defaultAnimationTime);
				tray.fadeOut(defaultAnimationTime, function () {
					middleSpacer.animate({'opacity':'1'}, defaultAnimationTime);
					// create tray for each series
					for (s in data) {
						var seriesName = data[s]['name'];

						var seriesContainer = new Element('ss-series-preview-container-{0}'.format(seriesName), CONTAINER_TEMPLATE);
						seriesContainer.postRenderFunction = fadeIn;
						SSSeriesPreviewContainerDictionary[seriesName] = seriesContainer;
						var seriesButton = new Element('ss-series-preview-button-{0}'.format(seriesName), BUTTON_TEMPLATE);
						seriesButton.postRenderFunction = fadeIn;
						seriesButton.properties['experiment'] = args['experiment_name'];
						seriesButton.properties['series'] = seriesName;
						seriesButton.states[NEW_EXPERIMENT_STATE_SERIES_EXTRACTING] = {'fn':function (model, args) {
							ajaxloop('series_extraction_status', args, function (data) {
								// repeat
								// 1. update label and progress background
								var seriesName = data['series_name'];
								var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
								seriesButton.model().html('Series: {0} (E{1}%,P{2}%)'.format(data['series_name'], data['source_extraction_percentage'], data['processing_percentage']));
							}, function (data) {
								// completion condition
								// 2. is "complete" true in the data
								// states
								var notGPstate = currentState !== NEW_EXPERIMENT_STATE_GENERATE_PREVIEW;
								var notSIstate = currentState !== NEW_EXPERIMENT_STATE_SERIES_INFO;
								var notSEstate = currentState !== NEW_EXPERIMENT_STATE_SERIES_EXTRACTING;
								var notStates = notGPstate && notSIstate && notSEstate;

								return (data['new'] || (data['source_extracted'] && data['processing_complete']) || notStates)
							}, function (data) {
								// completion
								// 3. change text to "completed", or something
								var seriesName = data['series_name'];
								var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
								seriesButton.model().html('Series: {0} (extracted)'.format(seriesName));
							});
						}};
						SSSeriesPreviewButtonDictionary[seriesName] = seriesButton;

						// NEED TO CHECK HERE IF SERIES IS CURRENTLY EXTRACTING
						// GET PERCENTAGE
						ajaxloop('series_extraction_status', {'experiment_name':args['experiment_name'], 'series_name':seriesName}, function (data) {
							// repeat
							// 1. update label and progress background
							var seriesName = data['series_name'];
							var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
							seriesButton.model().html('Series: {0} (E{1}%,P{2}%)'.format(data['series_name'], data['source_extraction_percentage'], data['processing_percentage']));
						}, function (data) {
							// completion condition
							// 2. is "complete" true in the data
							// states
							var notGPstate = currentState !== NEW_EXPERIMENT_STATE_GENERATE_PREVIEW;
							var notSIstate = currentState !== NEW_EXPERIMENT_STATE_SERIES_INFO;
							var notSEstate = currentState !== NEW_EXPERIMENT_STATE_SERIES_EXTRACTING;
							var notStates = notGPstate && notSIstate && notSEstate;

							return (data['new'] || (data['source_extracted'] && data['processing_complete']) || notStates)
						}, function (data) {
							// completion
							// 3. change text to "completed", or something
							var seriesName = data['series_name'];
							var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
							if (data['new']) {
								seriesButton.model().html('Series: {0}'.format(seriesName));
							} else {
								seriesButton.model().html('Series: {0} (extracted)'.format(seriesName));
							}
						});

						var spacer = new Element('ss-ps-{0}'.format(seriesName), SPACER_TEMPLATE);
						spacer.postRenderFunction = fadeIn;
						SSSeriesPreviewSpacerDictionary[seriesName] = spacer;

						// render
						SSTrayContainer.renderChild(seriesContainer);
						SSTrayContainer.renderChild(seriesButton);
						SSTrayContainer.renderChild(spacer);

						// bind
						+function (args, seriesName) {
							seriesButton.click(function (model) {
								changeState(model.id, NEW_EXPERIMENT_STATE_SERIES_INFO, {'experiment_name':args['experiment_name'], 'series_name':seriesName})
							});
						}(args, seriesName);
					}

					// make ajax request for previews
					ajax('generate_series_preview', args, function (data) {

						// extract data
						var experimentName = data['experiment_name'];
						var seriesList = data['series_list'];
						var seriesPathDictionary = data['series_paths'];

						// loop through series
						for (s in seriesList) {
							// get series details
							var seriesName = seriesList[s];
							var seriesPath = seriesPathDictionary[seriesName]['path'];
							var imageHalfHeight = seriesPathDictionary[seriesName]['half'];

							// fade spinner
							+function (seriesName, seriesPath) {
								var seriesContainer = SSSeriesPreviewContainerDictionary[seriesName];

								seriesContainer.model().find('.tray').fadeOut(defaultAnimationTime, function () {
									seriesContainer.model().find('.spinner').fadeOut(0, function () {
										if (!imageHalfHeight) {
											seriesContainer.model().animate({'height':'100px'}, defaultAnimationTime);
										}
										var previewImage = new Element('ss-series-preview-image-{0}'.format(seriesName), '<img id="{id}" />');
										previewImage.properties['src'] = seriesPath;
										previewImage.specificStyle = {'position':'relative', 'width':'200px', 'left':'25px'};
										previewImage.postRenderFunction = function (model) {
											model.css({'opacity':'0'});
											model.animate({'opacity':'1'}, defaultAnimationTime);
										};
										seriesContainer.renderChild(previewImage);
									});
								});
							}(seriesName, seriesPath);
						}
					});
				});
			});
		});
	});

	// SS Preview Loading Button
	SSPreviewLoadingButton = new Element('ss-preview-loading-button', BUTTON_TEMPLATE);
	SSPreviewLoadingButton.classes = ['notouch'];
	SSPreviewLoadingButton.html = 'Loading previews...';

	///////////////////////////////////
	/////////////// INFO SIDEBAR
	//        _________ _        _______        _______
	//        \__   __/( (    /|(  ____ \      (  ____ \
	//           ) (   |  \  ( || (    \/      | (    \/
	//           | |   |   \ | || (__          | (_____
	//           | |   | (\ \) ||  __)         (_____  )
	//           | |   | | \   || (                  ) |
	//        ___) (___| )  \  || )            /\____) |
	//        \_______/|/    )_)|/             \_______)
	//

	// INFS
	infoSidebar = new Element('info-sidebar', SIDEBAR_TEMPLATE);
	infoSidebar.specificStyle = defaultState['css'];
	infoSidebar.states[HOME_STATE] = defaultState;
	infoSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	infoSidebar.states[NEW_EXPERIMENT_STATE_GENERATE_PREVIEW] = defaultState;
	infoSidebar.states[NEW_EXPERIMENT_STATE_SERIES_INFO] = {'css':{'left':'550px'}}
	infoSidebar.states[PROGRESS_STATE] = defaultState;
	infoSidebar.states[SETTINGS_STATE] = defaultState;

	// INFS Top Spacer
	INFSTopSpacer = new Element('infs-ts', SPACER_TEMPLATE);

	// INFS Info Content Button
	INFSInfoContentButton = new Element('infs-info-content-button', BUTTON_TEMPLATE);
	INFSInfoContentButton.classes = ['notouch'];
	INFSInfoContentButton.html = 'Series info';

	// INFS Tray Container
	INFSTrayContainer = new Element('infs-tray-container', CONTAINER_TEMPLATE);
	INFSTrayContainer.states[NEW_EXPERIMENT_STATE] = {'fn':fadeIn};

	// INFS Info Spacer
	INFSInfoSpacer = new Element('infs-info-spacer', SPACER_TEMPLATE);
	INFSInfoSpacer.classes = ['content'];
	INFSInfoSpacer.states[NEW_EXPERIMENT_STATE] = {'fn':fadeOut};
	INFSInfoSpacer.states[NEW_EXPERIMENT_STATE_SERIES_INFO] = {'fn':function (model, args) {
		ajax('series_details', args, function (data) {
			var keys = ['title','acquisition_date','rs','cs','zs','ts','rmop','cmop','zmop','tpf','channels'];
			var metadata = data['metadata'];
			var titles = {
				'title':'Series title:',
				'acquisition_date':'Aquisition date:',
				'rs':'Rows:',
				'cs':'Columns:',
				'zs':'Levels:',
				'ts':'Frames:',
				'rmop':'Row resolution:',
				'cmop':'Column resolution:',
				'zmop':'Level resolution:',
				'tpf':'Minutes per frame:',
				'channels':'Channels:'
			}

			INFSTrayContainer.model().fadeOut(defaultAnimationTime, function () {
				var html = '<p>{0} {1}</p>'.format('Series', args['series_name']);
				for (k in keys) {
					var key = keys[k];
					var item = metadata[key];
					var title = titles[key];

					html += '<p>{0} {1}</p>'.format(title, item);
				}

				model.html(html);
				model.fadeIn(defaultAnimationTime);
			});
		});
	}};

	// INFS Middle Spacer
	INFSMiddleSpacer = new Element('infs-middle-spacer', SPACER_TEMPLATE);

	// INFS Extract Button
	INFSExtractButton = new Element('infs-extract-button', BUTTON_TEMPLATE);
	INFSExtractButton.classes = ['btn-success'];
	INFSExtractButton.states[NEW_EXPERIMENT_STATE_SERIES_INFO] = {'fn':function (model, args) {
		model.attr('experiment', args['experiment_name']);
		model.attr('series', args['series_name']);

		// check if the series is currently extracting
		ajaxloop('series_extraction_status', args, function (data) {
			// repeat
			// 1. update label and progress background
			var seriesName = data['series_name'];
			INFSExtractButton.model().html('Series: {0} (E{1}%,P{2}%)'.format(data['series_name'], data['source_extraction_percentage'], data['processing_percentage']));
		}, function (data) {
			// completion condition
			// 2. is "complete" true in the data
			return (data['new'] || (data['source_extracted'] && data['processing_complete']) || currentState!==NEW_EXPERIMENT_STATE_SERIES_INFO)
		}, function (data) {
			// completion
			// 3. change text to "completed", or something
			var seriesName = data['series_name'];
			var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
			if (data['new']) {
				INFSExtractButton.model().html('Extract...');
			} else {
				INFSExtractButton.model().html('Series: {0} (extracted)'.format(seriesName));
			}
		});

	}};
	INFSExtractButton.states[NEW_EXPERIMENT_STATE_SERIES_EXTRACTING] = {'fn':function (model, args) {
		// check if the series is currently extracting
		ajaxloop('series_extraction_status', args, function (data) {
			// repeat
			// 1. update label and progress background
			var seriesName = data['series_name'];
			INFSExtractButton.model().html('Series: {0} (E{1}%,P{2}%)'.format(data['series_name'], data['source_extraction_percentage'], data['processing_percentage']));
		}, function (data) {
			// completion condition
			// 2. is "complete" true in the data
			return ((data['source_extracted'] && data['processing_complete']) || currentState!==NEW_EXPERIMENT_STATE_SERIES_EXTRACTING)
		}, function (data) {
			// completion
			// 3. change text to "completed", or something
			var seriesName = data['series_name'];
			var seriesButton = SSSeriesPreviewButtonDictionary[seriesName];
			INFSExtractButton.model().html('Series: {0} (extracted)'.format(seriesName));
		});
	}};

	///////////////////////////////////
	/////////////// CURRENT EXPERIMENT SIDEBAR
	//         _______        _______        _______
	//        (  ____ \      (  ____ \      (  ____ \
	//        | (    \/      | (    \/      | (    \/
	//        | |            | (__          | (_____
	//        | |            |  __)         (_____  )
	//        | |            | (                  ) |
	//        | (____/\      | (____/\      /\____) |
	//        (_______/      (_______/      \_______)
	//

	// CES
	currentExperimentSidebar = new Element('current-experiment-sidebar', SIDEBAR_TEMPLATE);
	currentExperimentSidebar.specificStyle = defaultState['css'];
	currentExperimentSidebar.states[HOME_STATE] = defaultState;
	currentExperimentSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	currentExperimentSidebar.states[EXPERIMENT_STATE] = {
		'css':{'left':'50px'}
	};
	currentExperimentSidebar.states[PROGRESS_STATE] = defaultState;
	currentExperimentSidebar.states[SETTINGS_STATE] = defaultState;

	// CES Top Spacer
	CESTopSpacer = new Element('ces-ts', SPACER_TEMPLATE);

	// CES Experiment Name Content Button
	CESExperimentNameContentButton = new Element('ces-experiment-name-content-button', BUTTON_TEMPLATE);

	// CES Experiment Detail Container
	CESExperimentDetailContainer = new Element('ces-experiment-detail-container', CONTAINER_TEMPLATE);

	// CES Loading Experiment Detail Content Button
	CESLoadingExperimentDetailContentButton = new Element('ces-loading-experiment-detail-content-button', BUTTON_TEMPLATE);

	// CES Experiment Detail Spacer
	CESExperimentDetailSpacer = new Element('ces-experiment-detail-spacer', SPACER_TEMPLATE);
	CESExperimentDetailSpacer.classes = ['content'];

	// CES Middle Spacer
	CESMiddleSpacer = new Element('ces-ms', SPACER_TEMPLATE);

	// CES Unextracted High Dimension Series Content Button
	CESUnextractedHighDimensionSeriesContentButton = new Element('ces-unextracted-high-dimension-series-content-button', BUTTON_TEMPLATE);

	// CES Unextracted High Dimension Series Container
	CESUnextractedHighDimensionSeriesContainer = new Element('ces-unextracted-high-dimension-series-container', CONTAINER_TEMPLATE);

	///////////////////////////////////
	/////////////// COMPOSITE SIDEBAR
	//         _______        _______
	//        (  ____ \      (  ____ \
	//        | (    \/      | (    \/
	//        | |            | (_____
	//        | |            (_____  )
	//        | |                  ) |
	//        | (____/\      /\____) |
	//        (_______/      \_______)
	//

	// CS
	compositeSidebar = new Element('composite-sidebar', SIDEBAR_TEMPLATE);
	compositeSidebar.specificStyle = defaultState['css'];
	compositeSidebar.states[HOME_STATE] = defaultState;
	compositeSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	compositeSidebar.states[EXPERIMENT_STATE] = {
		'css':{'left':'300px'}
	};
	compositeSidebar.states[PROGRESS_STATE] = defaultState;
	compositeSidebar.states[SETTINGS_STATE] = defaultState;

	// CS Top Spacer
	CSTopSpacer = new Element('cs-ts', SPACER_TEMPLATE);

	// CS Composite Content Button
	CSCompositeContentButton = new Element('cs-composite-content-button', BUTTON_TEMPLATE);

	// CS Middle Spacer
	CSMiddleSpacer = new Element('cs-middle-spacer', SPACER_TEMPLATE);

	// CS Tray Container
	CSTrayContainer = new Element('cs-tray-container', CONTAINER_TEMPLATE)

	// CS Preview Loading Button
	CSPreviewLoadingButton = new Element('cs-preview-loading-button', BUTTON_TEMPLATE);

	///////////////////////////////////
	/////////////// CHANNEL SIDEBAR
	//         _______                 _______
	//        (  ____ \  |\     /|    (  ____ \
	//        | (    \/  | )   ( |    | (    \/
	//        | |        | (___) |    | (_____
	//        | |        |  ___  |    (_____  )
	//        | |        | (   ) |          ) |
	//        | (____/\  | )   ( |    /\____) |
	//        (_______/  |/     \|    \_______)
	//

	// CHS
	channelSidebar = new Element('channel-sidebar', SIDEBAR_TEMPLATE);
	channelSidebar.specificStyle = defaultState['css'];
	channelSidebar.states[HOME_STATE] = defaultState;
	channelSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	channelSidebar.states[EXPERIMENT_STATE] = {
		'css':{'left':'550px'}
	};
	channelSidebar.states[PROGRESS_STATE] = defaultState;
	channelSidebar.states[SETTINGS_STATE] = defaultState;

	// CHS Top Spacer
	CHSTopSpacer = new Element('chs-ts', SPACER_TEMPLATE);

	// CHS Info Content Button
	CHSChannelContentButton = new Element('chs-channels-content-button', BUTTON_TEMPLATE);

	// CHS Middle Spacer
	CHSMiddleSpacer = new Element('chs-middle-spacer', SPACER_TEMPLATE);

	// CHS Tray Container
	CHSTrayContainer = new Element('chs-tray-container', CONTAINER_TEMPLATE);

	// CHS Bottom Spacer
	CHSBottomSpacer = new Element('chs-bs', SPACER_TEMPLATE);

	// CHS Extract Button
	CHSExtractButton = new Element('chs-extract-button', BUTTON_TEMPLATE);

	///////////////////////////////////
	/////////////// MOD SIDEBAR
	//         _______    _______    ______         _______
	//        (       )  (  ___  )  (  __  \       (  ____ \
	//        | () () |  | (   ) |  | (  \  )      | (    \/
	//        | || || |  | |   | |  | |   ) |      | (_____
	//        | |(_)| |  | |   | |  | |   | |      (_____  )
	//        | |   | |  | |   | |  | |   ) |            ) |
	//        | )   ( |  | (___) |  | (__/  )      /\____) |
	//        |/     \|  (_______)  (______/       \_______)
	//

	// MODS
	modSidebar = new Element('mod-sidebar', SIDEBAR_TEMPLATE);
	modSidebar.specificStyle = defaultState['css'];
	modSidebar.states[HOME_STATE] = defaultState;
	modSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	modSidebar.states[EXPERIMENT_STATE] = {
		'css':{'left':'800px'}
	};
	modSidebar.states[PROGRESS_STATE] = defaultState;
	modSidebar.states[SETTINGS_STATE] = defaultState;

	// MODS Top Spacer
	MODSTopSpacer = new Element('mods-ts', SPACER_TEMPLATE);

	// MODS Mod Content Button
	MODSModContentButton = new Element('mods-mod-content-button', BUTTON_TEMPLATE);

	// MODS Middle Spacer
	MODSMiddleSpacer = new Element('mods-ms', SPACER_TEMPLATE);

	// MODS Available Mods Content Button
	MODSAvailableModsContentButton = new Element('mods-available-mods-content-button', BUTTON_TEMPLATE);

	// MODS Available Mods Container
	MODSAvailableModsContainer = new Element('mods-available-mods-container', CONTAINER_TEMPLATE);

	// MODS Bottom Spacer
	MODSBottomSpacer = new Element('mods-bs', SPACER_TEMPLATE);

	// MODS Existing Mods Content Button
	MODSExistingModsContentButton = new Element('mods-existing-mods-content-button', BUTTON_TEMPLATE);

	// MODS Existing Mods Container
	MODSExistingModsContainer = new Element('mods-existing-mods-container', CONTAINER_TEMPLATE);

	///////////////////////////////////
	/////////////// PROGRESS DETAIL SIDEBAR
	//         _______        ______         _______
	//        (  ____ )      (  __  \       (  ____ \
	//        | (    )|      | (  \  )      | (    \/
	//        | (____)|      | |   ) |      | (_____
	//        |  _____)      | |   | |      (_____  )
	//        | (            | |   ) |            ) |
	//        | )            | (__/  )      /\____) |
	//        |/             (______/       \_______)
	//

	// PDS
	progressDetailSidebar = new Element('progress-detail-sidebar', SIDEBAR_TEMPLATE);
	progressDetailSidebar.specificStyle = defaultState['css'];
	progressDetailSidebar.states[HOME_STATE] = defaultState;
	progressDetailSidebar.states[PROGRESS_STATE] = {'css':{'left':'300px'}};;
	progressDetailSidebar.states[EXPERIMENT_STATE] = defaultState;
	progressDetailSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	progressDetailSidebar.states[SETTINGS_STATE] = defaultState;

	// PDS Top Spacer
	PDSTopSpacer = new Element('pds-ts', SPACER_TEMPLATE);

	// PDS Progress Detail Content Button
	PDSProgressDetailContentButton = new Element('pds-progress-detail-content-button', BUTTON_TEMPLATE);
	PDSProgressDetailContentButton.classes = ['progress-inset', 'notouch'];

	// PDS Middle Spacer
	PDSMiddleSpacer = new Element('pds-ms', SPACER_TEMPLATE);

	///////////////////////////////////
	/////////////// PROGRESS SIDEBAR
	//         _______    _______    _______    _______        _______
	//        (  ____ )  (  ____ )  (  ___  )  (  ____ \      (  ____ \
	//        | (    )|  | (    )|  | (   ) |  | (    \/      | (    \/
	//        | (____)|  | (____)|  | |   | |  | |            | (_____
	//        |  _____)  |     __)  | |   | |  | | ____       (_____  )
	//        | (        | (\ (     | |   | |  | | \_  )            ) |
	//        | )        | ) \ \__  | (___) |  | (___) |      /\____) |
	//        |/         |/   \__/  (_______)  (_______)      \_______)
	//

	// PROGS
	progressSidebar = new Element('progress-sidebar', SIDEBAR_TEMPLATE);
	progressSidebar.specificStyle = defaultState['css'];
	progressSidebar.states[HOME_STATE] = defaultState;
	progressSidebar.states[SETTINGS_STATE] = defaultState;
	progressSidebar.states[EXPERIMENT_STATE] = defaultState;
	progressSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	progressSidebar.states[PROGRESS_STATE] = {'css':{'left':'50px'}};

	// PROGS Top Spacer
	PROGSTopSpacer = new Element('progs-ts', SPACER_TEMPLATE);

	// PROGS In Progress Content Button
	PROGSInProgressContentButton = new Element('progs-in-progress-content-button', BUTTON_TEMPLATE);

	// PROGS Middle Spacer
	PROGSMiddleSpacer = new Element('progs-ms', SPACER_TEMPLATE);

	///////////////////////////////////
	/////////////// SETTINGS SIDEBAR
	//         _______    _______   _________       _______
	//        (  ____ \  (  ____ \  \__   __/      (  ____ \
	//        | (    \/  | (    \/     ) (         | (    \/
	//        | (_____   | (__         | |         | (_____
	//        (_____  )  |  __)        | |         (_____  )
	//              ) |  | (           | |               ) |
	//        /\____) |  | (____/\     | |         /\____) |
	//        \_______)  (_______/     )_(         \_______)
	//

	// SETS
	settingsSidebar = new Element('settings-sidebar', SIDEBAR_TEMPLATE);
	settingsSidebar.specificStyle = defaultState['css'];
	settingsSidebar.states[HOME_STATE] = defaultState;
	settingsSidebar.states[PROGRESS_STATE] = defaultState;
	settingsSidebar.states[EXPERIMENT_STATE] = defaultState;
	settingsSidebar.states[NEW_EXPERIMENT_STATE] = defaultState;
	settingsSidebar.states[SETTINGS_STATE] = {'css':{'left':'50px'}};

	// SETS Top Spacer
	SETSTopSpacer = new Element('sets-ts', SPACER_TEMPLATE);

	// SETS In Progress Content Button
	SETSInProgressContentButton = new Element('sets-in-progress-content-button', BUTTON_TEMPLATE);

	// SETS Middle Spacer
	SETSMiddleSpacer = new Element('sets-ms', SPACER_TEMPLATE);

	// SETS In Progess Container
	SETSInProgressContainer = new Element('sets-in-progress-container', CONTAINER_TEMPLATE);

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

	///////////////	MS DEFINITIONS AND MODIFICATIONS
	// MS
	miniSidebar = new Element('mini-sidebar', SIDEBAR_TEMPLATE);
	miniSidebar.classes = ['mini'];
	miniSidebar.specificStyle = defaultState['css'];
	miniSidebar.states[HOME_STATE] = defaultState;
	miniSidebar.states[NEW_EXPERIMENT_STATE] = {
		'css':{'left':'0px'},
	}
	miniSidebar.states[EXPERIMENT_STATE] = {
		'css':{'left':'0px'},
	}
	miniSidebar.states[PROGRESS_STATE] = {
		'css':{'left':'0px'},
	}
	miniSidebar.states[SETTINGS_STATE] = {
		'css':{'left':'0px'},
	}
	miniSidebar.states[SEGMENT_STATE] = {
		'css':{'left':'0px'},
	}

	// MS Top Spacer
	MSTopSpacer = new Element('ms-ts', SPACER_TEMPLATE);

	// MS Home Button
	MSHomeButton = new Element('ms-home-button', BUTTON_TEMPLATE);
	MSHomeButton.html = '<span class="glyphicon glyphicon-home"></span>';

	// MS In Progress Button
	MSInProgressButton = new Element('ms-in-progress-button', BUTTON_TEMPLATE);
	MSInProgressButton.html = '<span class="glyphicon glyphicon-refresh"></span>';

	// MS Settings Button
	MSSettingsButton = new Element('ms-settings-button', BUTTON_TEMPLATE);
	MSSettingsButton.html = '<span class="glyphicon glyphicon-cog"></span>';

	// MS New Experiment Button
	MSNewExperimentButton = new Element('ms-new-experiment-button', BUTTON_TEMPLATE);
	MSNewExperimentButton.html = '<span class="glyphicon glyphicon-plus"></span>';

	///////////////////////////////////
	/////////////// BACK MINI SIDEBAR
	//         ______         _______        _______
	//        (  ___ \       (       )      (  ____ \
	//        | (   ) )      | () () |      | (    \/
	//        | (__/ /       | || || |      | (_____
	//        |  __ (        | |(_)| |      (_____  )
	//        | (  \ \       | |   | |            ) |
	//        | )___) )      | )   ( |      /\____) |
	//        |/ \___/       |/     \|      \_______)
	//

	// BMS
	backMiniSidebar = new Element('back-mini-sidebar', SIDEBAR_TEMPLATE);
	backMiniSidebar.classes = ['mini']

	// BMS Top Spacer
	BMSTopSpacer = new Element('bms-ts', SPACER_TEMPLATE);

	// BMS Back Button
	BMSBackButton = new Element('bms-back-button', BUTTON_TEMPLATE);
	BMSBackButton.html = '<span class="glyphicon glyphicon-chevron-left"></span>';

	///////////////////////////////////
	/////////////// SEGMENTATION MINI SIDEBAR
	//         _______        _______        _______
	//        (  ____ \      (       )      (  ____ \
	//        | (    \/      | () () |      | (    \/
	//        | (_____       | || || |      | (_____
	//        (_____  )      | |(_)| |      (_____  )
	//              ) |      | |   | |            ) |
	//        /\____) |      | )   ( |      /\____) |
	//        \_______)      |/     \|      \_______)
	//

	///////////////////////////////////
	/////////////// SEGMENTATION CONSOLE (WASD)
	//         _______        _______    _______    _
	//        (  ____ \      (  ____ \  (  ___  )  ( (    /|
	//        | (    \/      | (    \/  | (   ) |  |  \  ( |
	//        | (_____       | |        | |   | |  |   \ | |
	//        (_____  )      | |        | |   | |  | (\ \) |
	//              ) |      | |        | |   | |  | | \   |
	//        /\____) |      | (____/\  | (___) |  | )  \  |
	//        \_______)      (_______/  (_______)  |/    )_)
	//

	// SCON
	segmentationConsole = new Element('segmentation-console', BASIC_TEMPLATE);
	segmentationConsole.classes = ['console'];
	segmentationConsole.specificStyle = {
		'position':'fixed',
		'left':'100px',
		'top':'21px',
	};

	// SCON Marker Timepoint Lock Button Tab
	SCONMarkerTimepointLockButtonTab = new Element('scon-marker-timepoint-lock-button-tab', BUTTON_TEMPLATE);
	SCONMarkerTimepointLockButtonTab.specificStyle = {
		'left':'0px',
		'top':'0px',
		'width':'100px',
	};
	SCONMarkerTimepointLockButtonTab.html = 'Tab';

	// SCON Marker Placement Button Q
	SCONMarkerPlacementButtonQ = new Element('scon-marker-placement-button-q', BUTTON_TEMPLATE);
	SCONMarkerPlacementButtonQ.specificStyle = {
		'left':'110px',
		'top':'0px',
		'width':'50px',
	};
	SCONMarkerPlacementButtonQ.html = 'Q';

	// SCON Multichannel Balloon Selection Button W
	SCONMultichannelBalloonSelectionButtonW = new Element('scon-multichannel-balloon-selection-button-w', BUTTON_TEMPLATE);
	SCONMultichannelBalloonSelectionButtonW.specificStyle = {
		'left':'170px',
		'top':'0px',
		'width':'50px',
	};
	SCONMultichannelBalloonSelectionButtonW.html = 'W';

	// SCON Freehand Selection Button E
	SCONFreehandSelectionButtonE = new Element('scon-freehand-selection-button-e', BUTTON_TEMPLATE);
	SCONFreehandSelectionButtonE.specificStyle = {
		'left':'230px',
		'top':'0px',
		'width':'50px',
	};
	SCONFreehandSelectionButtonE.html = 'E';

	// SCON Slice Selection Button R
	SCONSliceSelectionButtonR = new Element('scon-slice-selection-button-r', BUTTON_TEMPLATE);
	SCONSliceSelectionButtonR.specificStyle = {
		'left':'290px',
		'top':'0px',
		'width':'50px',
	};
	SCONSliceSelectionButtonR.html = 'R';

	// SCON Rectangle Selection Button T
	SCONRectangleSelectionButtonT = new Element('scon-rectangle-selection-button-t', BUTTON_TEMPLATE);
	SCONRectangleSelectionButtonT.specificStyle = {
		'left':'350px',
		'top':'0px',
		'width':'50px',
	};
	SCONRectangleSelectionButtonT.html = 'T';

	// SCON Timepoint First Button A
	SCONTimepointFirstButtonA = new Element('scon-timepoint-first-button-a', BUTTON_TEMPLATE);
	SCONTimepointFirstButtonA.specificStyle = {
		'left':'120px',
		'top':'60px',
		'width':'50px',
	};
	SCONTimepointFirstButtonA.html = 'A';

	// SCON Timepoint Previous Button S
	SCONTimepointPreviousButtonS = new Element('scon-timepoint-previous-button-s', BUTTON_TEMPLATE);
	SCONTimepointPreviousButtonS.specificStyle = {
		'left':'180px',
		'top':'60px',
		'width':'50px',
	};
	SCONTimepointPreviousButtonS.html = 'S';

	// SCON Timepoint Next Button D
	SCONTimepointNextButtonD = new Element('scon-timepoint-next-button-d', BUTTON_TEMPLATE);
	SCONTimepointNextButtonD.specificStyle = {
		'left':'240px',
		'top':'60px',
		'width':'50px',
	};
	SCONTimepointNextButtonD.html = 'D';

	// SCON Timepoint Last Button F
	SCONTimepointLastButtonF = new Element('scon-timepoint-last-button-f', BUTTON_TEMPLATE);
	SCONTimepointLastButtonF.specificStyle = {
		'left':'300px',
		'top':'60px',
		'width':'50px',
	};
	SCONTimepointLastButtonF.html = 'F';

	///////////////////////////////////
	/////////////// RENDER
	// TRACK CONTAINER

	// IMAGE PALETTE

	// CANVAS CONTAINER

	// PAPER SCRIPTS

	// CHANNEL PALETTE

	// TRACK PALETTE

	// EXPERIMENT SIDEBAR
	experimentSidebar.render(body);
	experimentSidebar.renderChild(ESTopSpacer);
	experimentSidebar.renderChild(ESInProgressButton);
	experimentSidebar.renderChild(ESSettingsButton);
	experimentSidebar.renderChild(ESNewExperimentButton);
	experimentSidebar.renderChild(ESMiddleSpacer);
	experimentSidebar.renderChild(ESActiveExperimentsContentButton);
	experimentSidebar.renderChild(ESTrayContainer);

	// INFO SIDEBAR
	infoSidebar.render(body);
	infoSidebar.renderChild(INFSTopSpacer);
	infoSidebar.renderChild(INFSInfoContentButton);
	infoSidebar.renderChild(INFSTrayContainer);
	infoSidebar.renderChild(INFSInfoSpacer);
	infoSidebar.renderChild(INFSMiddleSpacer);
	infoSidebar.renderChild(INFSExtractButton);

	// SERIES SIDEBAR
	seriesSidebar.render(body);
	seriesSidebar.renderChild(SSTopSpacer);
	seriesSidebar.renderChild(SSSeriesContentButton);
	seriesSidebar.renderChild(SSMiddleSpacer);
	seriesSidebar.renderChild(SSTrayContainer);
	seriesSidebar.renderChild(SSPreviewLoadingButton);

	// NEW EXPERIMENT SIDEBAR
	newExperimentSidebar.render(body);
	newExperimentSidebar.renderChild(NESTopSpacer);
	newExperimentSidebar.renderChild(NESLifPathButton);
	newExperimentSidebar.renderChild(NESExperimentNameButton);
	NESExperimentNameButton.renderChild(NESExperimentNameInput);
	newExperimentSidebar.renderChild(NESMiddleSpacer);
	newExperimentSidebar.renderChild(NESPreviewButton);
	newExperimentSidebar.renderChild(NESBottomSpacer);
	newExperimentSidebar.renderChild(NESExperimentCreatedContentButton);
	newExperimentSidebar.renderChild(NESExperimentNameContentButton);
	newExperimentSidebar.renderChild(NESPartialMetadataExtractionProgressButton);
	newExperimentSidebar.renderChild(NESMetadataExtractionProgressButton);
	newExperimentSidebar.renderChild(NESPreviewImagesExtractionProgressButton);
	newExperimentSidebar.renderChild(NESTrayContainer);
	NESTrayContainer.renderChild(NESExtractingExperimentDetailsContentButton);
	NESTrayContainer.renderChild(NESDetailSpacer);

	// CURRENT EXPERIMENT SIDEBAR
	currentExperimentSidebar.render(body);
	currentExperimentSidebar.renderChild(CESTopSpacer);
	currentExperimentSidebar.renderChild(CESExperimentNameContentButton);
	currentExperimentSidebar.renderChild(CESExperimentDetailContainer);
	currentExperimentSidebar.renderChild(CESLoadingExperimentDetailContentButton);
	currentExperimentSidebar.renderChild(CESExperimentDetailSpacer);
	currentExperimentSidebar.renderChild(CESMiddleSpacer);
	currentExperimentSidebar.renderChild(CESUnextractedHighDimensionSeriesContentButton);
	currentExperimentSidebar.renderChild(CESUnextractedHighDimensionSeriesContainer);

	// COMPOSITE SIDEBAR
	compositeSidebar.render(body);
	compositeSidebar.renderChild(CSTopSpacer);
	compositeSidebar.renderChild(CSCompositeContentButton);
	compositeSidebar.renderChild(CSMiddleSpacer);
	compositeSidebar.renderChild(CSTrayContainer);
	compositeSidebar.renderChild(CSPreviewLoadingButton);

	// CHANNEL SIDEBAR
	channelSidebar.render(body);
	channelSidebar.renderChild(CHSTopSpacer);
	channelSidebar.renderChild(CHSChannelContentButton);
	channelSidebar.renderChild(CHSMiddleSpacer);
	channelSidebar.renderChild(CHSTrayContainer);
	channelSidebar.renderChild(CHSBottomSpacer);
	channelSidebar.renderChild(CHSExtractButton);

	// MOD SIDEBAR
	modSidebar.render(body);
	modSidebar.renderChild(MODSTopSpacer);
	modSidebar.renderChild(MODSModContentButton);
	modSidebar.renderChild(MODSMiddleSpacer);
	modSidebar.renderChild(MODSAvailableModsContentButton);
	modSidebar.renderChild(MODSAvailableModsContainer);
	modSidebar.renderChild(MODSBottomSpacer);
	modSidebar.renderChild(MODSExistingModsContentButton);
	modSidebar.renderChild(MODSExistingModsContainer);

	// PROGRESS DETAIL SIDEBAR
	progressDetailSidebar.render(body);
	progressDetailSidebar.renderChild(PDSTopSpacer);
	// progressDetailSidebar.renderChild(PDSProgressDetailContentButton);
	// PDSProgressDetailContentButton.renderChild(PDSTestProgress);
	// progressDetailSidebar.renderChild(PDSMiddleSpacer);
	// progressDetailSidebar.renderChild(PDSProgressDetailContainer);

	// PROGRESS SIDEBAR
	progressSidebar.render(body);
	progressSidebar.renderChild(PROGSTopSpacer);
	progressSidebar.renderChild(PROGSInProgressContentButton);
	progressSidebar.renderChild(PROGSMiddleSpacer);
	// progressSidebar.renderChild(PROGSInProgressContainer);

	// SETTING SIDEBAR
	settingsSidebar.render(body);
	settingsSidebar.renderChild(SETSTopSpacer);
	settingsSidebar.renderChild(SETSInProgressContentButton);
	settingsSidebar.renderChild(SETSMiddleSpacer);
	settingsSidebar.renderChild(SETSInProgressContainer);

	// MINI SIDEBAR
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	// BACK MINI SIDEBAR
	// backMiniSidebar.render(body);
	// backMiniSidebar.renderChild(BMSTopSpacer);
	// backMiniSidebar.renderChild(BMSBackButton);

	// SEGMENTATION CONSOLE
	// segmentationConsole.render(body);
	// segmentationConsole.renderChild(SCONMarkerTimepointLockButtonTab);
	// segmentationConsole.renderChild(SCONMarkerPlacementButtonQ);
	// segmentationConsole.renderChild(SCONMultichannelBalloonSelectionButtonW);
	// segmentationConsole.renderChild(SCONFreehandSelectionButtonE);
	// segmentationConsole.renderChild(SCONSliceSelectionButtonR);
	// segmentationConsole.renderChild(SCONRectangleSelectionButtonT);
	// segmentationConsole.renderChild(SCONTimepointFirstButtonA);
	// segmentationConsole.renderChild(SCONTimepointPreviousButtonS);
	// segmentationConsole.renderChild(SCONTimepointNextButtonD);
	// segmentationConsole.renderChild(SCONTimepointLastButtonF);

	///////////////////////////////////
	/////////////// BINDINGS
	///////////////
	// TRACK CONTAINER

	// IMAGE PALETTE

	// CANVAS CONTAINER

	// PAPER SCRIPTS

	// CHANNEL PALETTE

	// TRACK PALETTE

	// EXPERIMENT SIDEBAR
	ESInProgressButton.click(function (model) {
		changeState(model.id, PROGRESS_STATE, {});
	}, {});

	ESSettingsButton.click(function (model) {
		changeState(model.id, SETTINGS_STATE, {});
	}, {});

	ESNewExperimentButton.click(function (model) {
		changeState(model.id, NEW_EXPERIMENT_STATE, {});
	}, {});

	ESActiveExperimentsContentButton.click(function (model) {
		changeState(model.id, EXPERIMENT_STATE, {});
	}, {});

	// INFO SIDEBAR
	INFSExtractButton.click(function (model) {
		// get details from button
		var experimentName = model.attr('experiment');
		var seriesName = model.attr('series');
		var args = {'experiment_name':experimentName, 'series_name':seriesName};

		// trigger extracting state
		changeState(model.id, NEW_EXPERIMENT_STATE_SERIES_EXTRACTING, args);

		// make ajax request starting extraction, should start loop
		ajax('extract_series', args, function (data) {

		});
	});

	// NEW EXPERIMENT SIDEBAR
	NESLifPathButton.click(function (model) {
		dialog.showOpenDialog({properties:['openFile']}, function (filenames) {
			if (typeof filenames !== 'undefined') {
				if (filenames.length === 1) {
					var path = filenames[0];
					var filename = path.replace(/.*(\/|\\)/, '');
					model.html("File: " + filename);
					model.attr('path', path);
					changeState(model.id, NEW_EXPERIMENT_STATE_EXPERIMENT_CHOSEN, {});
				}
			}
		})
	}, {});

	NESExperimentNameButton.click(function (model) {
		var input = NESExperimentNameInput.model();
		input.focus();
	});

	NESPreviewButton.click(function (model) {
		var nameButton = NESExperimentNameButton.model();
		var pathButton = NESLifPathButton.model();
		var input = NESExperimentNameInput.model();

		if (input.val() === input.attr('defaultValue')) {
			nameButton.addClass('btn-danger');
		} else {
			nameButton.removeClass('btn-danger');

			var experimentName = input.val();
			var experimentPath = pathButton.attr('path');
			changeState(model.attr('id'), NEW_EXPERIMENT_STATE_EXPERIMENT_REQUESTED, {'experiment_name':experimentName, 'lif_path':experimentPath});
		}
	});

	// SERIES SIDEBAR

	// CURRENT EXPERIMENT SIDEBAR

	// COMPOSITE SIDEBAR

	// CHANNEL SIDEBAR

	// MOD SIDEBAR

	// PROGRESS DETAIL SIDEBAR

	// PROGRESS SIDEBAR

	// SETTING SIDEBAR


	// MINI SIDEBAR
	MSHomeButton.click(function (model) {
		changeState(model.id, HOME_STATE, {});
	}, {});

	MSInProgressButton.click(function (model) {
		changeState(model.id, PROGRESS_STATE, {});
	}, {});

	MSSettingsButton.click(function (model) {
		changeState(model.id, SETTINGS_STATE, {});
	}, {});

	MSNewExperimentButton.click(function (model) {
		changeState(model.id, NEW_EXPERIMENT_STATE, {});
	}, {});

	// BACK MINI SIDEBAR

	// SEGMENTATION CONSOLE


	///////////////////////////////////
	///////////////	SHORTCUT KEY BINDINGS
	///////////////

	///////////////////////////////////
	///////////////	MAIN METHOD
	///////////////

	function loadMainContent () {
		ajax('list_experiments', {}, function (data) {
			changeState('', NEW_EXPERIMENT_STATE, {});
		});
	};

	// run main method
	loadMainContent();

	///////////////////////////////////
	///////////////	HELPER METHODS ONLOAD
	///////////////

	// for the on-click, this need to be wired to the body, not the buttons themselves.
	// This means that buttons added dynamically can still respond even though they haven't been explicitly bound
	// to this method.
	body.on('mouseup', '.btn', function () {
		$(this).blur();
	});

	// blur and focus input fields properly
	body.on('focus', 'input', function () {
		if ($(this).val() === $(this).attr('defaultValue')) {
			$(this).val('');
		}
	});

	body.on('blur', 'input', function () {
		if ($(this).val() === '') {
			$(this).val($(this).attr('defaultValue'));
		}
	});

});
