// all purpose ajax
function ajax (type, url, data, callback) {
	var dataString = '';
	if (type === 'get') {
		for (arg in data) {
			dataString = dataString + data[arg];
		}
		dataString = dataString + '/';
	}

	var ajax_params = {
		type: type,
		url:'http://localhost:{0}/expt/commands/{1}/{2}'.format(settings['port'], url, dataString),
		success: function (data, textStatus, XMLHttpRequest) {
			callback(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status === 404 || xhr.status === 0) {
				ajax(type, url, data, callback);
			}
		}
	};

	if (type === 'post') { // allow for no data to be sent with a GET request for example.
		ajax_params['data'] = data;
	}

	return $.ajax(ajax_params);
};

// state transition functions
function postRenderFadeIn (model) {

}
