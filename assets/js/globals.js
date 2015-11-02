$(document).ready(function() {
	// require stuff
	window.settings = require("./settings.json"); // external settings

	// define window globals for paper to latch on to
	window.paperMarkerScope = {canvas:'paper-marker-canvas'};
	window.paperRegionScope = {canvas:'paper-region-canvas'};
	window.paperSliceScope = {canvas:'paper-slice-canvas'};
	window.paperLassoScope = {canvas:'paper-lasso-canvas'};

	// metrics
	window.imageHeight = 512;
	window.imageWidth = 1024;

});
