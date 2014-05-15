;(function ($) {
	
	var render = function (itch) {
		var info = itch.data('itch');
		var src = markdown.toHTML(info.data.content);
		itch.find('.itch-body').html(src);
	};
	
	$(document).on('itchCreated', '.itch-type-Itch', function () {
		
	})
	
	$(document).on('renderItch', '.itch-type-Itch', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Itch .itch-options', function () {
		var itch = $(this).parents('.itch');

		var form = $('#ItchEditForm').html();
		itch.find('.itch-body').html(form);

		var itchData = itch.data('itch');
		
		GDB({itchData: itchData.data})

		var submitter = itch.find('.itchEditForm');

		submitter.submit(function (e) {
			e.preventDefault();
			Scratch.save();
			submitter.remove();
			delete submitter;

			$(itch).trigger('renderItch');

			return false;
		});
	});
})(jQuery);