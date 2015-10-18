function ajax (type, url, callback) {
	$.ajax({
		type: type,
		url:"http://localhost:" + settings["port"] + '/expt/commands/' + url + '',
		success: function (data, textStatus, XMLHttpRequest) {
			callback(data);
		},
		error:function (xhr, ajaxOptions, thrownError) {
			if (xhr.status === 404 || xhr.status === 0) {
				ajax(type, url, callback);
			}
		}
	});
};
