;(function ($) {
	var type = 'systemconfig';
	var typeClass = '.itch-type-' + type;

	var loadedScripts = {};

	var render = function (itch) {
		// check if markdown is loaded yet
		var info = itch.data('itch');
		
		itch.find('.itch-body').html('Loading scripts + css');
		
		if (info.data && info.data.itches) {
			var toLoad = info.data.itches.split("\n");
			for (var i = 0, c = toLoad.length; i < c; i++) {
				var s = toLoad[i];
				if (!loadedScripts[s]) {
					loadedScripts[s] = true;
					Scratch.loadScript(s).done(function () {
						itch.find('.itch-body').prepend("<p>Loaded " + this.url + '</p>');
					});
				}
			}
		}

		if (info.data && info.data.syles) {
			var toLoad = info.data.syles.split("\n");
			for (var i = 0, c = toLoad.length; i < c; i++) {
				var s = toLoad[i];
				if (!loadedScripts[s]) {
					loadedScripts[s] = true;
					Scratch.loadCss(s);
					itch.find('.itch-body').prepend("<p>Loaded " + s + '</p>');
				}
			}
		}
		
		if (info.data.scratch_title) {
			$('title').text(info.data.scratch_title);
		}

		
	};
	
	var renderOptions = function (itch) {
		var elems = [
			{
				type: 'text',
				name: 'scratch_title',
				caption: 'Title of this scratch',
			},
			{
				type: 'textarea',
				name: 'itches',
				caption: 'Newline separated list of external itches to include',
				rows: 15
			},
			{
				type: 'textarea',
				name: 'syles',
				caption: 'Newline separated list of external stylesheets to include',
				rows: 15
			},
			{
				type: 'submit',
				value: 'Update'
			}
		];

		Scratch.editForm(itch, elems);
	}
	
	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: 'System Config'};
	});
	
	$(document).on('itchCreated', typeClass, function () {
		$(this).removeClass('initialising');
		renderOptions($(this));
	})

	$(document).on('itchRestored', typeClass, function () {
		$(this).removeClass('initialising');
		render($(this));
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

	Scratch.loadScript('themes/scratch/javascript/spectrum/spectrum.js');
	Scratch.loadCss('themes/scratch/javascript/spectrum/spectrum.css');
})(jQuery);
