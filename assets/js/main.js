$(document).ready(function() {
	// Need to store application context so it can be recreated.

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	///////////////
	$('#new-experiment-menu-button').click(function () {
		$('#new-experiment-dialog').animate({'left':'0px'}, 500);
	});

});
