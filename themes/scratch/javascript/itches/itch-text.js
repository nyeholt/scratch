;(function ($) {
	var type = 'itch';
	var typeClass = '.itch-type-' + type;
	
	var loaded = false;
	
	var render = function (itch) {
		// check if markdown is loaded yet
		var info = itch.data('itch');
		if (info.data && info.data.content && loaded) {
			var src = markdown.toHTML(info.data.content);
			itch.find('.itch-body').html(src);
		} else if (!loaded) {
			Scratch.loading(itch.find('.itch-body'));
			setTimeout(function () {
				render(itch);
			}, 1000);
		}
	};

	var renderOptions = function (itch) {
		// <textarea name="content" rows="10"></textarea>
		var elems = [
			{
				type: 'textarea',
				name: 'content',
				caption: 'Markdown content'
			},
			{
				type: 'submit',
				value: 'Update'
			}
		];
		Scratch.editForm(itch, elems);
	}
	
	$(document).on('itchCreated', typeClass, function () {
		$(this).removeClass('initialising');
		renderOptions($(this));
	})
	
	$(document).on('renderItch', typeClass, function () {
		render($(this));
	});
	
	$(document).on('click', typeClass + ' .itch-handle', function () {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});
	
	Scratch.loadScript("themes/scratch/javascript/markdown-0.6.1/markdown.js").done(function () {
		loaded = true;
	});
})(jQuery);