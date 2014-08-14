;(function ($) {
	var type = 'dpaster';
	
	var handlers = {
		render: function (itch) {
			var itchData = itch.data('itch');
			// each itch gets its own <style> block
			var body = itch.find('.itch-body');
			body.empty();
			
			
			body.dform({
			type: 'div',
				html: [
				{
					type: 'text',
					caption: "Enter a dpaste ID to load",
					name: 'loadUrl'
				},
				{
					type: 'div',
					caption: "Last saved",
					html: '<a href="' + itchData.data.lastPaste + '" target="_blank">' + itchData.data.lastPaste + '</a>'
				},
				{
					type: 'button',
					class: 'load-button',
					html: 'Load'
				},
				{
					type: 'button',
					class: 'save-button',
					html: 'Save Selected'
				}
				]
			});
			
			if (itchData.data.lastPaste) {
				body.append('<div></div>');
			} 
			
			var trigger = body.find('.save-button');
			
			trigger.click(function () {
				var itches = $('.selected-itch');
				if (itches.length > 0) {
					var exportSet = {};
					itches.each(function () {
						var selectedData = $(this).data('itch');
						exportSet[selectedData.guid] = selectedData;
					});
					
					$.post('javascript/itches/dpaste.php', {'action': 'create', content: JSON.stringify(exportSet)}).error(function (response) {
						alert("Something went wrong");
					}).done(function (data) {
						if (data.headers.Location) {
							itchData.data.lastPaste = data.headers.Location;
							Scratch.save();
							handlers.render(itch);
						}
					})
				}
			});
			
			body.find('.load-button').click(function (e) {
				var toLoad = body.find('[name=loadUrl]').val();
				
				$.get('javascript/itches/dpaste.php', {action: 'load', paste: toLoad}, function (data) {
					if (data && data.body) {
						for (var guid in data.body) {
							var loadedData = data.body[guid];
							if (loadedData.guid && loadedData.type) {
								Scratch.loadItch(loadedData);
							}
						}
					}
				});
			});
		},
		renderEdit: function (itch) {
			// <textarea name="content" rows="10"></textarea>
			handlers.render(itch);
		}
	};
	
	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "DPaste export"};
	});

	Scratch.prepareItchType(type, handlers);
})(jQuery);
