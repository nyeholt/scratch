;(function ($) {
	var type = 'importexport';
	var typeClass = '.itch-type-' + type;
	
	/**
	 * Restore an itch from an object
	 * 
	 * @param object restoredObject
	 * @returns 
	 */
	var restoreItch = function (restoredObject) {
		if (restoredObject.guid) {
			var existing = Scratch.getItch(restoredObject.guid);
			if (existing) {
				// don't change its position
				delete restoredObject.position;
				$.extend(existing, restoredObject);
				var itch = Scratch.$getItch(restoredObject.guid);
				itch.trigger('renderItch');
			} else {
				Scratch.addItch(restoredObject);
			}
		}
	};

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
				caption: "Item to load",
				class: 'itch-saver'
			},
			{
				type: 'button',
				class: 'load-button',
				html: 'Load'
			}
			]
		});
	};
	
	
	var renderOptions = function (itch) {
//		var elems = [
//			
//		];
//		
//		Scratch.editForm(itch, elems, null, function (event, itchData) {
//			createTimer(itchData);
//		});
	};


	$(document).on('click', '.load-button', function (e) {
		var data = $(this).siblings('textarea').val();
		if (data) {
			var restored = JSON.parse(Base64.decode(data));
			restoreItch(restored);
		}
	});
	

	$(document).on('prepareGeneralMenu', function (e, items) {
		items[type] = { name: "Import / Export" };
	});

	$(document).on('updateItemOptionMenu', function (e, items) {
		if (!items.export && $(typeClass).length > 0) {
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

	$(document).on('itchCreated', typeClass, function () {
		$(this).removeClass('initialising');
		if ($('.itch-type-Persister').length > 1) {
			alert("Only the first created importer will actually function!");
		}

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
})(jQuery);