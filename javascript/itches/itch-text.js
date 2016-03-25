;(function ($) {
	var type = 'itch';
	
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
			Scratch.editForm(itch, elems, function () {
				if ($.fn.autogrow) {
					itch.find('textarea').autogrow();
				}
			});
		}
	};

	Scratch.prepareItchType('itch', handlers);

	Scratch.loadScript("javascript/markdown-0.6.1/markdown.js");
	
	Scratch.loadScript("javascript/jquery/jquery.autogrow-textarea.js").done(function () {});
	
	Scratch.loadCss('javascript/jquery/prism.css');
	Scratch.loadScript('javascript/jquery/prism.js');
	
})(jQuery);
