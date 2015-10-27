$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog
	var settings = require("./settings.json"); // external settings

	///////////////////////////////////
	///////////////	UI ELEMENTS
	/////////////// classes, specificStyle, properties, html, states, stateSwitch, preRenderFunction, postRenderFunction

	///////////////////////////////////
	/////////////// STATES
	var NEW_EXPERIMENT_STATE = 'NewExperimentState';
	var EXPERIMENT_STATE = 'ExperimentState';
	var PROGRESS_STATE = 'ProgressState';
	var SETTINGS_STATE = 'SettingsState';

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

	///////////////	ES ELEMENT VARS
	var experimentSidebar;
	var ESInProgressButton;
	var ESSettingsButton;
	var ESNewExperimentButton;
	var ESTopSpacer;
	var ESMiddleSpacer;
	var ESActiveExperimentsContentButton;
	var ESTrayContainer;
	var ESExperimentButtonDictionary = {}; // stores experiment buttons with experiment name as key

	///////////////	ES DEFINITIONS AND MODIFICATIONS
	// ES
	experimentSidebar = new Element('experiment-sidebar', SIDEBAR_TEMPLATE);

	// ES Top Spacer
	ESTopSpacer = new Element('es-ts', SPACER_TEMPLATE);

	// ES In Progress Button
	ESInProgressButton = new Element('es-in-progress-button', BUTTON_TEMPLATE);

	// ES Settings Button
	ESSettingsButton = new Element('es-settings-button', BUTTON_TEMPLATE);

	// ES New Experiment Button
	ESNewExperimentButton = new Element('es-new-experiment-button', BUTTON_TEMPLATE);

	// ES Middle Spacer
	ESMiddleSpacer = new Element('es-ms', SPACER_TEMPLATE);

	// ES Active Experiments Content Button
	ESActiveExperimentsContentButton = new Element('es-active-experiments-content-button', BUTTON_TEMPLATE);

	// ES Tray Container
	ESTrayContainer = new Element('es-tray-container', CONTAINER_TEMPLATE);

	/////////////// ES RENDER
	// experimentSidebar.render(body);
	// experimentSidebar.renderChild(ESTopSpacer);
	// experimentSidebar.renderChild(ESInProgressButton);
	// experimentSidebar.renderChild(ESSettingsButton);
	// experimentSidebar.renderChild(ESNewExperimentButton);
	// experimentSidebar.renderChild(ESMiddleSpacer);
	// experimentSidebar.renderChild(ESActiveExperimentsContentButton);
	// experimentSidebar.renderChild(ESTrayContainer);

	///////////////	ES BUTTON BINDINGS

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

	///////////////	NES ELEMENT VARS
	var newExperimentSidebar;
	var NESTopSpacer;
	var NESLifPathButton;
	var NESExperimentNameButton;
	var NESMiddleSpacer;
	var NESPreviewButton;
	var NESBottomSpacer;
	var NESExperimentCreatedContentButton;
	var NESExperimentNameContentButton;
	var NESTrayContainer;
	var NESExtractingExperimentDetailsButton;
	var NESDetailSpacer;

	///////////////	NES DEFINITIONS AND MODIFICATIONS
	// NES
	newExperimentSidebar = new Element('new-experiment-sidebar', SIDEBAR_TEMPLATE);
	newExperimentSidebar.specificStyle = {'left':'50px'};

	// NES Top Spacer
	NESTopSpacer = new Element('nes-ts', SPACER_TEMPLATE);

	// NES Lif Path Button
	NESLifPathButton = new Element('nes-lif-path-button', BUTTON_TEMPLATE);

	// NES Experiment Name Button
	NESExperimentNameButton = new Element('nes-experiment-name-button', BUTTON_TEMPLATE);

	// NES Middle Spacer
	NESMiddleSpacer = new Element('nes-ms', SPACER_TEMPLATE);

	// NES Preview Button
	NESPreviewButton = new Element('nes-preview-button', BUTTON_TEMPLATE);

	// NES Bottom Spacer
	NESBottomSpacer = new Element('nes-bs', SPACER_TEMPLATE);

	// NES Experiment Created Content Button
	NESExperimentCreatedContentButton = new Element('nes-experiment-created-content-button', BUTTON_TEMPLATE);

	// NES Experiment Name Content Button
	NESExperimentNameContentButton = new Element('nes-experiment-name-content-button', BUTTON_TEMPLATE);

	// NES Tray Container
	NESTrayContainer = new Element('nes-tray-container', CONTAINER_TEMPLATE);

	// NES Extracting Experiment Details Button
	NESExtractingExperimentDetailsContentButton = new Element('nes-extracting-experiment-details-content-button', BUTTON_TEMPLATE);

	// NES Detail Spacer
	NESDetailSpacer = new Element('nes-detail-spacer', SPACER_TEMPLATE);
	NESDetailSpacer.classes = ['content'];

	///////////////	NES RENDER
	// newExperimentSidebar.render(body);
	// newExperimentSidebar.renderChild(NESTopSpacer);
	// newExperimentSidebar.renderChild(NESLifPathButton);
	// newExperimentSidebar.renderChild(NESExperimentNameButton);
	// newExperimentSidebar.renderChild(NESMiddleSpacer);
	// newExperimentSidebar.renderChild(NESPreviewButton);
	// newExperimentSidebar.renderChild(NESBottomSpacer);
	// newExperimentSidebar.renderChild(NESExperimentCreatedContentButton);
	// newExperimentSidebar.renderChild(NESExperimentNameContentButton);
	// newExperimentSidebar.renderChild(NESTrayContainer);
	// NESTrayContainer.renderChild(NESExtractingExperimentDetailsContentButton);
	// NESTrayContainer.renderChild(NESDetailSpacer);

	///////////////	NES BUTTON BINDINGS

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

	///////////////	SS ELEMENT VARS
	var seriesSidebar;
	var SSTopSpacer;
	var SSTrayContainer;
	var SSGeneratingPreviewContentButton;
	var SSSeriesPreviewTrayDictionary = {}; // stores elements with series names as keys
	var SSSeriesPreviewContentTrayDictionary = {};
	var SSSeriesPreviewButtonDictionary = {};

	///////////////	SS DEFINITIONS AND MODIFICATIONS
	// SS
	seriesSidebar = new Element('series-sidebar', SIDEBAR_TEMPLATE);
	seriesSidebar.specificStyle = {'left':'300px'};

	// SS Top Spacer
	SSTopSpacer = new Element('ss-ts', SPACER_TEMPLATE);

	// SS Tray Container
	SSTrayContainer = new Element('ss-tray-container', CONTAINER_TEMPLATE)

	// SS Preview Loading Button
	SSPreviewLoadingButton = new Element('ss-preview-loading-button', BUTTON_TEMPLATE);

	///////////////	SS RENDER
	// seriesSidebar.render(body);
	// seriesSidebar.renderChild(SSTopSpacer);
	// seriesSidebar.renderChild(SSTrayContainer);
	// seriesSidebar.renderChild(SSPreviewLoadingButton);

	///////////////	SS BUTTON BINDINGS

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

	///////////////	INFS ELEMENT VARS
	var infoSidebar;
	var INFSTopSpacer;
	var INFSInfoContentButton;
	var INFSTrayContainer;
	var INFSInfoSpacer;
	var INFSMiddleSpacer;
	var INFSExtractButton;

	///////////////	INFS DEFINITIONS AND MODIFICATIONS
	// INFS
	infoSidebar = new Element('info-sidebar', SIDEBAR_TEMPLATE);
	infoSidebar.specificStyle = {'left':'550px'};

	// INFS Top Spacer
	INFSTopSpacer = new Element('infs-ts', SPACER_TEMPLATE);

	// INFS Info Content Button
	INFSInfoContentButton = new Element('infs-info-content-button', BUTTON_TEMPLATE);

	// INFS Tray Container
	INFSTrayContainer = new Element('infs-tray-container', CONTAINER_TEMPLATE);

	// INFS Info Spacer
	INFSInfoSpacer = new Element('infs-info-spacer', SPACER_TEMPLATE);
	INFSInfoSpacer.classes = ['content'];

	// INFS Middle Spacer
	INFSMiddleSpacer = new Element('infs-middle-spacer', SPACER_TEMPLATE);

	// INFS Extract Button
	INFSExtractButton = new Element('infs-extract-button', BUTTON_TEMPLATE);

	///////////////	INFS RENDER
	// infoSidebar.render(body);
	// infoSidebar.renderChild(INFSTopSpacer);
	// infoSidebar.renderChild(INFSInfoContentButton);
	// infoSidebar.renderChild(INFSTrayContainer);
	// infoSidebar.renderChild(INFSInfoSpacer);
	// infoSidebar.renderChild(INFSMiddleSpacer);
	// infoSidebar.renderChild(INFSExtractButton);

	///////////////	INFS BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	var currentExperimentSidebar;
	var CESTopSpacer;
	var CESExperimentNameContentButton;
	var CESExperimentDetailContainer;
	var CESLoadingExperimentDetailContentButton;
	var CESExperimentDetailSpacer;
	var CESMiddleSpacer;
	var CESUnextractedHighDimensionSeriesContentButton;
	var CESUnextractedHighDimensionSeriesContainer;

	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	ELEMENT VARS
	///////////////	DEFINITIONS AND MODIFICATIONS
	///////////////	RENDER
	///////////////	BUTTON BINDINGS

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

	///////////////	MS ELEMENT VARS
	var miniSidebar;
	var MSTopSpacer;
	var MSHomeButton;
	var MSInProgressButton;
	var MSSettingsButton;
	var MSNewExperimentButton;

	///////////////	MS DEFINITIONS AND MODIFICATIONS
	// MS
	miniSidebar = new Element('mini-sidebar', SIDEBAR_TEMPLATE);
	miniSidebar.classes = ['mini'];

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

	///////////////	MS RENDER
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	///////////////	MS BUTTON BINDINGS

	///////////////////////////////////
	///////////////	MAIN METHOD
	///////////////

	function loadMainContent () {
		ajax('get', 'list_experiments', {}, function (data) {

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

});
