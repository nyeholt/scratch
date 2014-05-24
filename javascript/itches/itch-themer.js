;(function ($) {
	var type = 'themer';
	
	var handlers = {
		render: function (itch) {
			var itchData = itch.data('itch');
			// each itch gets its own <style> block
			var cssId = itch.attr('data-id') + '-css';
			
			var elem = $('#' + cssId);
			if (!elem.length) {
				elem = $('<style type="text/css">');
				elem.attr('id', cssId);
				$('body').append(elem);
			}
			
			elem.html(itchData.data.custom_css);
			$(itch).find('.itch-body').html('<pre><code class="language-css">' + itchData.data.custom_css + '</code></pre>');
			
		},
		renderEdit: function (itch) {
			// <textarea name="content" rows="10"></textarea>
			var elems = [
				{
					type: 'textarea',
					name: 'custom_css',
					caption: 'CSS rules'
				},
				{
					type: 'submit',
					value: 'Update'
				}
			];
			Scratch.editForm(itch, elems);
		}
	};
	
	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Theme"};
	});

	Scratch.prepareItchType(type, handlers);
})(jQuery);
