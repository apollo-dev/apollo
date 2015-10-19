function ajax (type, url, data, callback) {
	var ajax_params = {
		type: type,
		url:'http://localhost:' + settings['port'] + '/expt/commands/' + url + '',
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
	
	$.ajax(ajax_params);
};
