;(function ($) {
	
	var render = function (itch) {
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		body.empty();
		if (itchData.data.embedContent) {
			body.html(itchData.data.embedContent);

//			$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
//				if (data && data.response && data.response.Content) {
//					body.html(data.response.Content);
//				}
//			})
		} else {
			renderOptions(itch);
		}
	};

	var renderOptions = function (itch) {
		Scratch.editForm(itch, '#EmbedEditForm', null, function (form, itchData) {
			// after editing, we reset the embedContent
			itchData.data.embedContent = '';
			
			if (itchData.data.url) {
				Scratch.loading(itch.find('.itch-body'));
				// this happens async, which is why we load and save data again separately
				$.get('jsonservice/socialGraph/convertUrl', {remoteUrl: itchData.data.url}, function (data) {
					var saveInto = $(itch).data('itch');
					saveInto.data.embedContent = 'Please enter a URL';
					if (data && data.response && data.response.Content) {
						saveInto.data.embedContent = data.response.Content;
					}
					Scratch.save();
					render(itch);
				})
			}
			return false;
		});
	};

	$(document).on('prepareGeneralMenu', function (e, items) {
		items['embed'] = { name: "Embed" };
	});

	$(document).on('itchCreated', '.itch-type-Embed', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Embed', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Embed .itch-handle', function () {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});
})(jQuery);