$(document).ready(function() {

	var remote = require('remote'); // access the main node process
	var dialog = remote.require('dialog'); // access open file dialog
	var settings = require("./settings.json"); // external settings

	// Need to store application context so it can be recreated.

	///////////////////////////////////
	///////////////	BUTTON BINDINGS
	///////////////

	// Experiment sidebar
	$('#new-experiment-menu-button').click(function () {
		// slide out experiment sidebar
		$('#experiment-sidebar').animate({'left':'-500px'}, 200);

		// slide in mini sidebar
		$('#mini-sidebar').animate({'left':'0px'}, 300);

		// slide in new experiment sidebar with a delay
		$('#new-sidebar').delay(0).animate({'left':'51px'}, 300);

	});

	// Mini sidebar
	$('#home-menu-button-mini').click(function () {
		// slide out new experiment sidebar
		$('#new-sidebar').delay(0).animate({'left':'-500px'}, 200);

		// clear new experiment fields
		resetFileInput();

		// slide out mini sidebar
		$('#mini-sidebar').animate({'left':'-500px'}, 200);

		// slide in experiment sidebar
		$('#experiment-sidebar').animate({'left':'0px'}, 300);

		// slide out series sidebar
		$('#series-sidebar').animate({'left':'-500px'}, 300);
	});

	$('#new-experiment-menu-button-mini').click(function () {
		// slide out series sidebar
		$('#series-sidebar').animate({'left':'-500px'}, 300);

		// slide out new experiment sidebar
		$('#new-sidebar').delay(0).animate({'left':'-500px'}, 200, function () {
			// slide in new experiment sidebar
			$('#new-sidebar').delay(0).animate({'left':'51px'}, 300);

			// clear new experiment fields
			resetFileInput();
		});
	});

	// the choose file dialog uses the remote connection to the node host to
	// open the window and select the file. This distinguishes between files and folders.
	$('#choose-file-menu-button').click(function () {
		dialog.showOpenDialog({properties:['openFile', 'openDirectory']}, function (filenames) {
			if (filenames.length === 1) {
				var path = filenames[0];
				var filename = path.replace(/.*(\/|\\)/, '');

				if (filename.indexOf(".") === -1) { // is directory
					//set display and filetype
					$('#choose-file-menu-button').html('Directory: ' + filename + '/');
					$('#choose-file-menu-button').attr('filetype', 'D');

					// bring in inf file button
					betterFadeIn($('#choose-inf-file-menu-button'), 1000);

				} else {
					//set display and filetype
					$('#choose-file-menu-button').html('File: ' + filename);
					$('#choose-file-menu-button').attr('filetype', 'F');

					// inf file button not needed
					betterFadeOut($('#choose-inf-file-menu-button'), 1000);

					// bring in extraction-menu-button
					$('#extraction-menu-button').fadeIn(1000);
				}

				// set path to be sent to server whether file or directory
				$('#choose-file-menu-button').attr('path', path);
			}
		});
	});

	$('#choose-inf-file-menu-button').click(function () {
		dialog.showOpenDialog({properties:['openFile']}, function (filenames) {
			if (filenames.length === 1) {
				var path = filenames[0];
				var filename = path.replace(/.*(\/|\\)/, '');

				// set display and path
				$('#choose-inf-file-menu-button').html('File: ' + filename);
				$('#choose-inf-file-menu-button').attr('path', path);

				// bring in extraction-menu-button
				$('#extraction-menu-button').fadeIn(1000);
			}
		});
	});

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

	// Extraction
	// gather values from three buttons and send them to the server
	$('#extraction-menu-button').click(function () {
		var experimentPath = $('#choose-file-menu-button').attr('path');
		var experimentFileType = $('#choose-file-menu-button').attr('filetype');
		var experimentInfPath = '';
		if (experimentFileType === 'D') {
			experimentInfPath = $('#choose-inf-file-menu-button').attr('path');
		}
		var experimentName = $('#name-file-menu-button span').html();

		// handle errors
		if (experimentName === $('#new-experiment-name-input').attr('defaultValue')) {
			$('#name-file-menu-button').addClass('red');
		} else {
			$('#name-file-menu-button').removeClass('red');

			// send details to server
			createExperiment(experimentName, experimentPath, experimentFileType, experimentInfPath, function (data) {
				// slide out series sidebar
				var newSidebarLeft = $('#new-sidebar').css('left');
				var newSidebarWidth = $('#new-sidebar').css('width');
				var seriesSidebarLeft = parseInt(newSidebarLeft) + parseInt(newSidebarWidth) + 'px'
				$('#series-sidebar').animate({'left':seriesSidebarLeft}, 300);

				// add new experiment button to list
				addNewExperimentButton(experimentName);

				// make experiment-created-menu-button visible
				if (data === 'exists') {
					$('#experiment-created-menu-button').html('Experiment exists:');
				} else {
					$('#experiment-created-menu-button').html('Experiment created:');
				}

				$('#experiment-created-menu-button-title').html(experimentName);
				$('#experiment-created-menu-button').fadeIn(1000);
				$('#experiment-created-menu-button-title').fadeIn(1000);

				// run extraction
				runPreview(experimentName, data);
			});
		}
	});
});

var resetFileInput = function () {
	$('#choose-file-menu-button').html('Choose file...');
	$('#name-file-menu-button span').html('Name experiment');
	$('#name-file-menu-button').removeClass('red');
	$('#choose-inf-file-menu-button').html('Choose inf file...');
	$('#choose-inf-file-menu-button').fadeOut(100);
	$('#extraction-menu-button').fadeOut(100);
	$('#new-experiment-name-input').val('');
	$('#experiment-created-menu-button-title').html('');
	$('#experiment-created-menu-button-title').fadeOut(100);
	$('#experiment-created-menu-button').html('');
	$('#experiment-created-menu-button').fadeOut(100);
}

var createExperiment = function (experimentName, experimentPath, experimentFileType, experimentInfPath, success_function) {
	var experiment_data = {
		'experiment_name':experimentName,
		'experiment_path':experimentPath,
		'experiment_file_type':experimentFileType,
		'experiment_inf_path':experimentInfPath,
	}

	$.ajax({
		type: "post",
		timeout: 1000,
		url:"http://localhost:" + settings["port"] + '/expt/commands/create_experiment/',
		data:experiment_data,
		success: function (data, textStatus, XMLHttpRequest) {
			success_function(data);
		},
		error:function (xhr, ajaxOptions, thrownError) {
			if (xhr.status === 404 || xhr.status === 0) {
				createExperiment(experimentName, experimentPath, experimentFileType, experimentInfPath);
			}
		}
	});
}

var runPreview = function (experimentName, data) {

}

var addNewExperimentButton = function (experimentName) {
	var template = function (experimentName) {
		return '<div class="menu-button experiment-button" experiment="' + experimentName + '">Experiment: ' + experimentName + '</div>';
	}

	var nullExperimentButton = $('#experiment-container').find('[experiment="none"]')
	if (nullExperimentButton) {
		nullExperimentButton.remove();
		$('#experiment-container .tray').after(template(experimentName));
	} else {
		$('#experiment-container').children().last().after(template(experimentName));
	}
}
