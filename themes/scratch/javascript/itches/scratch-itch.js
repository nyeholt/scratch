;(function ($) {
	
	var render = function (itch) {
		var info = itch.data('itch');
		if (info.data && info.data.content) {
			var src = markdown.toHTML(info.data.content);
			itch.find('.itch-body').html(src);
		}
	};
	
	var renderOptions = function (itch) {
		Scratch.editForm(itch, '#ItchEditForm');
	}
	
	$(document).on('itchCreated', '.itch-type-Itch', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Itch', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Itch .itch-handle', function () {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
		
	});
})(jQuery);