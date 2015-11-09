// all purpose ajax
function ajax (url, data, callback) {

	var ajax_params = {
		type: 'post',
		data: data,
		url:'http://localhost:{0}/expt/commands/{1}/'.format(settings['port'], url),
		success: function (data, textStatus, XMLHttpRequest) {
			callback(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			if (xhr.status === 404 || xhr.status === 0) {
				ajax(url, data, callback);
			}
		}
	};

	return $.ajax(ajax_params);
};

function ajaxloop (url, data, repeatCallback, completionCondition, completionCallback) {

}

// state transition functions
function postRenderFadeIn (model) {

}
