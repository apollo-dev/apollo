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
	var SEGMENT_STATE = 'SegmentState';

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

	///////////////	IP ELEMENT VARS
	var imagePalette;

	///////////////	IP DEFINITIONS AND MODIFICATIONS
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

	///////////////	IP RENDER
	imagePalette.render(body);

	///////////////	IP BUTTON BINDINGS

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

	/////////////// CP ELEMENT VARS
	var channelPalette;

	/////////////// CP DEFINITIONS AND MODIFICATIONS
	channelPalette = new Element('channel-palette', BASIC_TEMPLATE);
	channelPalette.specificStyle = {
		'position':'fixed',
		'top':'141px',
		'left':'calc(100% - 50px)',
		'height':'calc(50% - 151px)',
		'width':'100%',
		'border':'1px solid #CCC',
	};

	/////////////// CP RENDER
	channelPalette.render(body);

	/////////////// CP BUTTON BINDINGS

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

	/////////////// TP ELEMENT VARS
	var trackPalette;

	/////////////// TP DEFINITIONS AND MODIFICATIONS
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

	/////////////// TP RENDER
	trackPalette.render(body);

	/////////////// TP BUTTON BINDINGS

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
	experimentSidebar.specificStyle = defaultState['css'];
	experimentSidebar.states[HOME_STATE] = defaultState;
	// experimentSidebar.states[HOME_STATE] = {
	// 	'css':{'left':'0px'}
	// };
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

	/////////////// ES RENDER
	experimentSidebar.render(body);
	experimentSidebar.renderChild(ESTopSpacer);
	experimentSidebar.renderChild(ESInProgressButton);
	experimentSidebar.renderChild(ESSettingsButton);
	experimentSidebar.renderChild(ESNewExperimentButton);
	experimentSidebar.renderChild(ESMiddleSpacer);
	experimentSidebar.renderChild(ESActiveExperimentsContentButton);
	experimentSidebar.renderChild(ESTrayContainer);

	///////////////	ES BUTTON BINDINGS
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
	newExperimentSidebar.render(body);
	newExperimentSidebar.renderChild(NESTopSpacer);
	newExperimentSidebar.renderChild(NESLifPathButton);
	newExperimentSidebar.renderChild(NESExperimentNameButton);
	newExperimentSidebar.renderChild(NESMiddleSpacer);
	newExperimentSidebar.renderChild(NESPreviewButton);
	newExperimentSidebar.renderChild(NESBottomSpacer);
	newExperimentSidebar.renderChild(NESExperimentCreatedContentButton);
	newExperimentSidebar.renderChild(NESExperimentNameContentButton);
	newExperimentSidebar.renderChild(NESTrayContainer);
	NESTrayContainer.renderChild(NESExtractingExperimentDetailsContentButton);
	NESTrayContainer.renderChild(NESDetailSpacer);

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
	var SSSeriesContentButton;
	var SSMiddleSpacer;
	var SSTrayContainer;
	var SSGeneratingPreviewContentButton;
	var SSSeriesPreviewTrayDictionary = {}; // stores elements with series names as keys
	var SSSeriesPreviewContentTrayDictionary = {};
	var SSSeriesPreviewButtonDictionary = {};

	///////////////	SS DEFINITIONS AND MODIFICATIONS
	// SS
	seriesSidebar = new Element('series-sidebar', SIDEBAR_TEMPLATE);
	seriesSidebar.specificStyle = defaultState['css'];
	seriesSidebar.states[HOME_STATE] = defaultState;
	seriesSidebar.states[NEW_EXPERIMENT_STATE] = {
		'css':{'left':'300px'},
		'time':defaultAnimationTime
	}
	seriesSidebar.states[PROGRESS_STATE] = defaultState;
	seriesSidebar.states[SETTINGS_STATE] = defaultState;

	// SS Top Spacer
	SSTopSpacer = new Element('ss-ts', SPACER_TEMPLATE);

	// SS Series Content Button
	SSSeriesContentButton = new Element('ss-series-content-button', BUTTON_TEMPLATE);

	// SS Middle Spacer
	SSMiddleSpacer = new Element('ss-ms', SPACER_TEMPLATE);

	// SS Tray Container
	SSTrayContainer = new Element('ss-tray-container', CONTAINER_TEMPLATE)

	// SS Preview Loading Button
	SSPreviewLoadingButton = new Element('ss-preview-loading-button', BUTTON_TEMPLATE);

	///////////////	SS RENDER
	seriesSidebar.render(body);
	seriesSidebar.renderChild(SSTopSpacer);
	seriesSidebar.renderChild(SSSeriesContentButton);
	seriesSidebar.renderChild(SSMiddleSpacer);
	seriesSidebar.renderChild(SSTrayContainer);
	seriesSidebar.renderChild(SSPreviewLoadingButton);

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
	infoSidebar.specificStyle = defaultState['css'];
	infoSidebar.states[HOME_STATE] = defaultState;
	infoSidebar.states[NEW_EXPERIMENT_STATE] = {
		'css':{'left':'550px'},
		'time':defaultAnimationTime
	}
	infoSidebar.states[PROGRESS_STATE] = defaultState;
	infoSidebar.states[SETTINGS_STATE] = defaultState;

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
	infoSidebar.render(body);
	infoSidebar.renderChild(INFSTopSpacer);
	infoSidebar.renderChild(INFSInfoContentButton);
	infoSidebar.renderChild(INFSTrayContainer);
	infoSidebar.renderChild(INFSInfoSpacer);
	infoSidebar.renderChild(INFSMiddleSpacer);
	infoSidebar.renderChild(INFSExtractButton);

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

	///////////////	CES ELEMENT VARS
	var currentExperimentSidebar;
	var CESTopSpacer;
	var CESExperimentNameContentButton;
	var CESExperimentDetailContainer;
	var CESLoadingExperimentDetailContentButton;
	var CESExperimentDetailSpacer;
	var CESMiddleSpacer;
	var CESUnextractedHighDimensionSeriesContentButton;
	var CESUnextractedHighDimensionSeriesContainer;

	///////////////	CES DEFINITIONS AND MODIFICATIONS
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

	///////////////	CES RENDER
	currentExperimentSidebar.render(body);
	currentExperimentSidebar.renderChild(CESTopSpacer);
	currentExperimentSidebar.renderChild(CESExperimentNameContentButton);
	currentExperimentSidebar.renderChild(CESExperimentDetailContainer);
	currentExperimentSidebar.renderChild(CESLoadingExperimentDetailContentButton);
	currentExperimentSidebar.renderChild(CESExperimentDetailSpacer);
	currentExperimentSidebar.renderChild(CESMiddleSpacer);
	currentExperimentSidebar.renderChild(CESUnextractedHighDimensionSeriesContentButton);
	currentExperimentSidebar.renderChild(CESUnextractedHighDimensionSeriesContainer);

	///////////////	CES BUTTON BINDINGS

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

	///////////////	CS ELEMENT VARS
	var compositeSidebar;
	var CSTopSpacer;
	var CSCompositeContentButton;
	var CSMiddleSpacer;
	var CSTrayContainer;
	var CSGeneratingPreviewContentButton;
	var CSSeriesPreviewTrayDictionary = {};
	var CSSeriesPreviewContentTrayDictionary = {};
	var CSSeriesPreviewButtonDictionary = {};

	///////////////	CS DEFINITIONS AND MODIFICATIONS
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

	///////////////	CS RENDER
	compositeSidebar.render(body);
	compositeSidebar.renderChild(CSTopSpacer);
	compositeSidebar.renderChild(CSCompositeContentButton);
	compositeSidebar.renderChild(CSMiddleSpacer);
	compositeSidebar.renderChild(CSTrayContainer);
	compositeSidebar.renderChild(CSPreviewLoadingButton);

	///////////////	CS BUTTON BINDINGS

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

	///////////////	CHS ELEMENT VARS
	var channelSidebar;
	var CHSTopSpacer;
	var CHSChannelContentButton;
	var CHSMiddleSpacer;
	var CHSTrayContainer;
	var CHSChannelDictionary = {};
	var CHSBottomSpacer;
	var CHSExtractButton;

	///////////////	CHS DEFINITIONS AND MODIFICATIONS
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

	///////////////	CHS RENDER
	channelSidebar.render(body);
	channelSidebar.renderChild(CHSTopSpacer);
	channelSidebar.renderChild(CHSChannelContentButton);
	channelSidebar.renderChild(CHSMiddleSpacer);
	channelSidebar.renderChild(CHSTrayContainer);
	channelSidebar.renderChild(CHSBottomSpacer);
	channelSidebar.renderChild(CHSExtractButton);

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

	///////////////	DEFINITIONS AND MODIFICATIONS
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

	///////////////	RENDER
	modSidebar.render(body);
	modSidebar.renderChild(MODSTopSpacer);
	modSidebar.renderChild(MODSModContentButton);
	modSidebar.renderChild(MODSMiddleSpacer);
	modSidebar.renderChild(MODSAvailableModsContentButton);
	modSidebar.renderChild(MODSAvailableModsContainer);
	modSidebar.renderChild(MODSBottomSpacer);
	modSidebar.renderChild(MODSExistingModsContentButton);
	modSidebar.renderChild(MODSExistingModsContainer);

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

	///////////////	PROGS ELEMENT VARS
	var progressSidebar;
	var PROGSTopSpacer;
	var PROGSInProgressContentButton;
	var PROGSMiddleSpacer;
	var PROGSInProgressContainer;
	var PROGSInProgressButtonDictionary = {};

	///////////////	PROGS DEFINITIONS AND MODIFICATIONS
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

	// PROGS In Progess Container
	PROGSInProgressContainer = new Element('progs-in-progress-container', CONTAINER_TEMPLATE);

	///////////////	PROGS RENDER
	progressSidebar.render(body);
	progressSidebar.renderChild(PROGSTopSpacer);
	progressSidebar.renderChild(PROGSInProgressContentButton);
	progressSidebar.renderChild(PROGSMiddleSpacer);
	progressSidebar.renderChild(PROGSInProgressContainer);

	///////////////	PROGS BUTTON BINDINGS

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

	///////////////	SETS ELEMENT VARS
	var settingsSidebar;
	var SETSTopSpacer;
	var SETSInProgressContentButton;
	var SETSMiddleSpacer;
	var SETSInProgressContainer;
	var SETSInProgressButtonDictionary = {};

	///////////////	SETS DEFINITIONS AND MODIFICATIONS
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

	///////////////	PROGS RENDER
	settingsSidebar.render(body);
	settingsSidebar.renderChild(SETSTopSpacer);
	settingsSidebar.renderChild(SETSInProgressContentButton);
	settingsSidebar.renderChild(SETSMiddleSpacer);
	settingsSidebar.renderChild(SETSInProgressContainer);

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

	///////////////	MS RENDER
	miniSidebar.render(body);
	miniSidebar.renderChild(MSTopSpacer);
	miniSidebar.renderChild(MSHomeButton);
	miniSidebar.renderChild(MSInProgressButton);
	miniSidebar.renderChild(MSSettingsButton);
	miniSidebar.renderChild(MSNewExperimentButton);

	///////////////	MS BUTTON BINDINGS
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

	/////////////// BMS ELEMENT VARS
	var backMiniSidebar;
	var BMSTopSpacer;
	var BMSBackButton;

	/////////////// BMS DEFINITIONS AND MODIFICATIONS
	// BMS
	backMiniSidebar = new Element('back-mini-sidebar', SIDEBAR_TEMPLATE);
	backMiniSidebar.classes = ['mini']

	// BMS Top Spacer
	BMSTopSpacer = new Element('bms-ts', SPACER_TEMPLATE);

	// BMS Back Button
	BMSBackButton = new Element('bms-back-button', BUTTON_TEMPLATE);
	BMSBackButton.html = '<span class="glyphicon glyphicon-chevron-left"></span>';

	/////////////// BMS RENDER
	backMiniSidebar.render(body);
	backMiniSidebar.renderChild(BMSTopSpacer);
	backMiniSidebar.renderChild(BMSBackButton);

	/////////////// BMS BUTTON BINDINGS

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

	/////////////// SMS ELEMENT VARS
	/////////////// SMS DEFINITIONS AND MODIFICATIONS
	/////////////// SMS RENDER
	/////////////// SMS BUTTON BINDINGS

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

	/////////////// SCON ELEMENT VARS
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

	/////////////// SCON DEFINITIONS AND MODIFICATIONS
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

	// SCON Marker Placement Button Q
	SCONMarkerPlacementButtonQ = new Element('scon-marker-placement-button-q', BUTTON_TEMPLATE);
	SCONMarkerPlacementButtonQ.specificStyle = {
		'left':'110px',
		'top':'0px',
		'width':'50px',
	};

	// SCON Multichannel Balloon Selection Button W
	SCONMultichannelBalloonSelectionButtonW = new Element('scon-multichannel-balloon-selection-button-w', BUTTON_TEMPLATE);
	SCONMultichannelBalloonSelectionButtonW.specificStyle = {
		'left':'170px',
		'top':'0px',
		'width':'50px',
	};

	// SCON Freehand Selection Button E
	SCONFreehandSelectionButtonE = new Element('scon-freehand-selection-button-e', BUTTON_TEMPLATE);
	SCONFreehandSelectionButtonE.specificStyle = {
		'left':'230px',
		'top':'0px',
		'width':'50px',
	};

	// SCON Slice Selection Button R
	SCONSliceSelectionButtonR = new Element('scon-slice-selection-button-r', BUTTON_TEMPLATE);
	SCONSliceSelectionButtonR.specificStyle = {
		'left':'290px',
		'top':'0px',
		'width':'50px',
	};

	// SCON Rectangle Selection Button T
	SCONRectangleSelectionButtonT = new Element('scon-rectangle-selection-button-t', BUTTON_TEMPLATE);
	SCONRectangleSelectionButtonT.specificStyle = {
		'left':'350px',
		'top':'0px',
		'width':'50px',
	};

	// SCON Timepoint First Button A
	SCONTimepointFirstButtonA = new Element('scon-timepoint-first-button-a', BUTTON_TEMPLATE);
	SCONTimepointFirstButtonA.specificStyle = {
		'left':'120px',
		'top':'60px',
		'width':'50px',
	};

	// SCON Timepoint Previous Button S
	SCONTimepointPreviousButtonS = new Element('scon-timepoint-previous-button-s', BUTTON_TEMPLATE);
	SCONTimepointPreviousButtonS.specificStyle = {
		'left':'180px',
		'top':'60px',
		'width':'50px',
	};

	// SCON Timepoint Next Button D
	SCONTimepointNextButtonD = new Element('scon-timepoint-next-button-d', BUTTON_TEMPLATE);
	SCONTimepointNextButtonD.specificStyle = {
		'left':'240px',
		'top':'60px',
		'width':'50px',
	};

	// SCON Timepoint Last Button F
	SCONTimepointLastButtonF = new Element('scon-timepoint-last-button-f', BUTTON_TEMPLATE);
	SCONTimepointLastButtonF.specificStyle = {
		'left':'300px',
		'top':'60px',
		'width':'50px',
	};

	/////////////// SCON RENDER
	segmentationConsole.render(body);
	segmentationConsole.renderChild(SCONMarkerTimepointLockButtonTab);
	segmentationConsole.renderChild(SCONMarkerPlacementButtonQ);
	segmentationConsole.renderChild(SCONMultichannelBalloonSelectionButtonW);
	segmentationConsole.renderChild(SCONFreehandSelectionButtonE);
	segmentationConsole.renderChild(SCONSliceSelectionButtonR);
	segmentationConsole.renderChild(SCONRectangleSelectionButtonT);
	segmentationConsole.renderChild(SCONTimepointFirstButtonA);
	segmentationConsole.renderChild(SCONTimepointPreviousButtonS);
	segmentationConsole.renderChild(SCONTimepointNextButtonD);
	segmentationConsole.renderChild(SCONTimepointLastButtonF);

	/////////////// SCON BUTTON BINDINGS

	///////////////////////////////////
	///////////////	SHORTCUT KEY BINDINGS
	///////////////

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
