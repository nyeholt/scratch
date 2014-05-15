;(function ($) {
	
	var render = function (itch) {
		var itchData = itch.data('itch');
		if (itchData.data.url) {
			$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
				if (data && data.response && data.response.Content) {
					itch.find('.itch-body').html(data.response.Content);
				}
			})
		}
	};
	
	var renderOptions = function (itch) {
		var form = $('#EmbedEditForm').html();
		itch.find('.itch-body').html(form);

		var itchData = itch.data('itch');
		
		Scratch.editingModel.itchData = itchData.data;

		var submitter = itch.find('.embedEditForm');

		submitter.submit(function (e) {
			e.preventDefault();
			Scratch.save();
			submitter.remove();
			delete submitter;

			$(itch).trigger('renderItch');

			return false;
		});
	};
	
	$(document).on('itchCreated', '.itch-type-Embed', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Embed', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Embed .itch-options', function () {
		var itch = $(this).parents('.itch');
		renderOptions(itch);
	});
})(jQuery);