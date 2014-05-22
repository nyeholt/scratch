;(function ($) {
	var type = 'itch';
	var typeClass = '.itch-type-' + type;
	
	var loaded = false;
	
	var handlers = {
		render: function (itch) {
			// check if markdown is loaded yet
			var info = itch.data('itch');
			if (info.data && info.data.content && typeof markdown != 'undefined') {
				var src = markdown.toHTML(info.data.content);
				itch.find('.itch-body').html(src);
			} else if (typeof markdown == 'undefined') {
				Scratch.loading(itch.find('.itch-body'));
				setTimeout(function () {
					handlers.render(itch);
				}, 1000);
			} else {
				itch.find('.itch-body').empty();
			}
		},
		renderEdit: function (itch) {
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
	};

	Scratch.prepareItchType('itch', handlers);

	Scratch.loadScript("themes/scratch/javascript/markdown-0.6.1/markdown.js").done(function () {
		loaded = true;
	});
})(jQuery);
