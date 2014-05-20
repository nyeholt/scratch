;(function ($) {
	var type = 'systemconfig';
	var typeClass = '.itch-type-' + type;

	var loadedScripts = {};

	var render = function (itch) {
		// check if markdown is loaded yet
		var info = itch.data('itch');
		if (info.data && info.data.itches) {
			var toLoad = info.data.itches.split("\n");
			for (var i = 0, c = toLoad.length; i < c; i++) {
				var s = toLoad[i];
				if (!loadedScripts[s]) {
					loadedScripts[s] = true;
					Scratch.loadScript(s).done(function () {
						itch.find('.itch-body').prepend("<p>Loaded " + s + '</p>');
					});
				}
			}
		}

		itch.find('.itch-body').html('Scripts loaded');
	};
	
	var renderOptions = function (itch) {
		var elems = [
			{
				type: 'textarea',
				name: 'itches',
				caption: 'Newline separated list of external itches to include',
				rows: 15
			},
			{
				type: 'submit',
				value: 'Update'
			}
		];

		Scratch.editForm(itch, elems);
	}
	
	$(document).on('prepareGeneralMenu', function(e, items) {
		items[type] = {name: 'System Config'};
	});
	
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
})(jQuery);
