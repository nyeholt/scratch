;(function ($) {
	
	var render = function (itch) {
		var itchData = itch.data('itch');
		var body = itch.find('.itch-body');
		body.empty();
		
		body.dform({
			type: 'div',
			html: [
			{
				type: 'textarea',
				rows: 10,
				caption: "Item to save/load",
				class: 'itch-saver'
			},
			{
				type: 'button',
				class: 'load-button',
				html: 'Load'
			}
			]
		});

		if (itchData.data.saveUrl) {
//			body.append('Saving to ' + itchData.data.saveUrl);
		}
	};

	var renderOptions = function (itch) {
		var elems = [{
			"name" : "saveUrl",
			"caption" : "URL for saving data to",
            "type" : "url"
		}];
		Scratch.editForm(itch, elems);
	};
	
	$(document).on('click', '.load-button', function (e) {
		var data = $(this).siblings('textarea').val();
		if (data) {
			var restored = JSON.parse(Base64.decode(data));
			if (restored.guid) {
				var existing = Scratch.getItch(restored.guid);
				if (existing) {
					// don't change its position
					delete restored.position;
					$.extend(existing, restored);
					var itch = Scratch.$getItch(restored.guid);
					itch.trigger('renderItch');
				} else {
					Scratch.addItch(restored);
				}
			}
		}
	});

	$(document).on('prepareGeneralMenu', function (e, items) {
		items['saver'] = { name: "Persister" };
	});
	
	$(document).on('prepareOptionsMenu', function (e, items) {
		if (!items.export) {
			items.export = {
				name: "Export",
				execute: function(o) {
					var itch = $(this).data('itch');
					var clone = JSON.stringify(itch);
					clone = JSON.parse(clone);
					delete clone['id'];

					var encoded = Base64.encode(JSON.stringify(clone));

					var saveTo = $('.itch-saver').first();
					saveTo.val(encoded);
				}
			};
		}
	})

	$(document).on('itchCreated', '.itch-type-Persister', function () {
		renderOptions($(this));
	})
	
	$(document).on('renderItch', '.itch-type-Persister', function () {
		render($(this));
	});
	
	$(document).on('click', '.itch-type-Persister .itch-handle', function () {
		var itch = $(this).parents('.itch');
		if (itch.find('.itchForm').length > 0) {
			render(itch);
		} else {
			renderOptions(itch);
		}
	});
})(jQuery);