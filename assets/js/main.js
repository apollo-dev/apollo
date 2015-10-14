$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog

	// Need to store application context so it can be recreated.

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	///////////////

	// the choose file dialog uses the remote connection to the node host to
	// open the window and select the file. This distinguishes between files and folders.
	$('#choose-file-menu-button').click(function () {
		dialog.showOpenDialog({properties:['openFile', 'openDirectory']}, function (filenames) {
			if (filenames.length === 1) {
				var filename = filenames[0].replace(/.*(\/|\\)/, '');
				if (filename.indexOf(".") === -1) { // is directory
					$('#choose-file-menu-button').html("Directory: " + filename + "/");
				} else {
					$('#choose-file-menu-button').html("File: " + filename);
				}
			}
		});
	});

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

});
