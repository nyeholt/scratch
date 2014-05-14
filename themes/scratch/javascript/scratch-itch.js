;(function ($) {
	
	var render = function (itchData) {

	};
	
	$(document).on('itchCreated', '.itch-type-Itch', function () {
		
	})
	
	$(document).on('renderItch', '.itch-type-Itch', function () {
		render($(this).data('itch'));
	});
	
	$(document).on('click', '.itch-type-Itch .itch-body', function () {
		if ($(this).html() == '') {
			$(this).html('Edit me');
		}
		$(this).attr('contenteditable', 'true').focus();
	});
})(jQuery);