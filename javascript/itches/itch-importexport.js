;(function ($) {
	var type = 'importexport';
	var typeClass = '.itch-type-' + type;

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
			},
			{
				type: 'button',
				class: 'save-button',
				html: 'Export all'
			}
			]
		});
		
		body.find('save-button').click(exportItchData);
		body.find('load-button').click(loadItchData);
	};
	
	var renderEdit = function (itch) {
		var elems = [
			
		];
		
		Scratch.editForm(itch, elems);
	};

	var exportItchData = function () {
		var text = JSON.stringify(Scratch.forExport());
		text = Base64.encode(text);
		var pom = $('<a>');
		var url = 'data:application/json;charset=utf-8;base64,' + (text) + '';
		window.open(url);
	};

	var loadItchData = function (e) {
		var data = $(this).siblings('textarea').val();
		if (data) {
			var restored = JSON.parse(Base64.decode(data));
			Scratch.loadItch(restored);
		}
	};

	$(document).on('updateGeneralMenu', function (e, items) {
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
	});

	Scratch.prepareItchType(type, {render: render, renderEdit: renderEdit});
})(jQuery);