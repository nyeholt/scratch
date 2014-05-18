;(function ($) {
	
	var api = {
		'save': '/jsonservice/scratch/save',
		'load': '/jsonservice/scratch/load',
		'delete': '/jsonservice/scratch/delete',
		'updates': '/jsonservice/scratch/updatesSince'
	};
	
	// manually track deletes to push them separately
	var deletes = {
		
	};
	
	var updateTimer = null;
	
	var scratchUpdates = function () {
		var persister = $('.itch-type-Persister').first();
		if (persister) {
			var myData = persister.data('itch');
			// get any updates since last request
			$.get(myData.data.saveUrl + api.updates, {
				'date': myData.data.lastUpdate
			}, function (updates) {
				console.log(updates);
				
				var save = {
					itches: Scratch.ALL_ITCHES
				};

				$.ajax(myData.data.saveUrl + api.save, {
					'data': JSON.stringify(save), //{action:'x',params:['a','b','c']}
					'type': 'POST',
					'processData': false,
					'contentType': 'application/json', //typically 'application/x-www-form-urlencoded', but the service you are calling may expect 'text/json'... check with the service to see what they expect as content-type in the HTTP header.
					'success': function (data) {
						myData.data.lastUpdate = (new Date()).toUTCString();
						Scratch.save();
						Scratch.log(myData.data.lastUpdate);
					}
				});
			});
			
			
		}
	};

	var createTimer = function (itchData) {
		if (!itchData) {
			return;
		}
		
		if (itchData.data.saveUrl && itchData.data.saveFrequency) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}
			scratchUpdates();
			updateTimer = setInterval(scratchUpdates, itchData.data.saveFrequency * 1000);
		}
	}
	
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
		
		if (!updateTimer) {
			createTimer(itchData);
		}

		if (itchData.data.saveUrl) {
//			body.append('Saving to ' + itchData.data.saveUrl);
		}
	};

	var renderOptions = function (itch) {
		var elems = [
			{
			"name" : "saveUrl",
			"caption" : "URL for saving data to",
            "type" : "url"
			},
			{
				'name': 'saveFrequency',
				'caption': 'How often will data be sync\'d?',
				'type': 'select',
				options: {
					'300': '5 minutes',
					'600': '10 minutes',
					'1800': '30 minutes'
				}
			}
		];
		
		Scratch.editForm(itch, elems, null, function (event, itchData) {
			createTimer(itchData);
		});
	};
	
	$(document).on('click', '.load-button', function (e) {
		var data = $(this).siblings('textarea').val();
		if (data) {
			var restored = JSON.parse(Base64.decode(data));
			restoreItch(restored);
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
		if ($('.itch-type-Persister').length > 1) {
			alert("Only the first created persister will actually function!");
		}
		
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