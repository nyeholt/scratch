;(function ($) {
	
	var render = function (itch) {
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		body.empty();
		if (itchData.data.url) {
			$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
				if (data && data.response && data.response.Content) {
					body.html(data.response.Content);
				}
			})
		}
	};

	var renderOptions = function (itch) {
		Scratch.editForm(itch, '#EmbedEditForm');
	};
	
	$(document).on('itchCreated', '.itch-type-Embed', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Embed', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Embed .itch-handle', function () {
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});
})(jQuery);