;(function ($) {
	
	var render = function (itch) {
		var info = itch.data('itch');
		if (info.data && info.data.content) {
			var src = markdown.toHTML(info.data.content);
			itch.find('.itch-body').html(src);
		}
	};
	
	var renderOptions = function (itch) {
		var form = $('#ItchEditForm').html();
		itch.find('.itch-body').html(form);

		var itchData = itch.data('itch');
		
		var submitter = itch.find('.itchEditForm');
		
		Scratch.bindToForm(itchData.data, submitter);


		submitter.submit(function (e) {
			e.preventDefault();
			Scratch.loadFromForm(itchData.data, submitter);
			Scratch.save();
			
			submitter.remove();
			delete submitter;

			$(itch).trigger('renderItch');

			return false;
		});
	}
	
	$(document).on('itchCreated', '.itch-type-Itch', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Itch', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Itch .itch-options', function () {
		var itch = $(this).parents('.itch');
		renderOptions(itch);
	});
})(jQuery);