// all purpose ajax
function ajax (type, url, data, callback) {
	var ajax_params = {
		type: type,
		url:'http://localhost:{0}/expt/commands/{1}/'.format(settings['port'], url),
		success: function (data, textStatus, XMLHttpRequest) {
			callback(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status === 404 || xhr.status === 0) {
				ajax(type, url, data, callback);
			}
		}
	};

	if (!($.isEmptyObject(data))) { // allow for no data to be sent with a GET request for example.
		ajax_params['data'] = data;
	}

	return $.ajax(ajax_params);
};

// state transition functions
function postRenderFadeIn (model) {
	
}
