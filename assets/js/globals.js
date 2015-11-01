$(document).ready(function() {
	// require stuff
	var settings = require("./settings.json"); // external settings

	// define window globals for paper to latch on to
	window.paperMarkerScope = {canvas:'markerCanvas'};
	window.paperRegionScope = {canvas:'regionCanvas'};
	window.paperSliceScope = {canvas:'sliceCanvas'};
	window.paperLassoScope = {canvas:'lassoCanvas'};

});
