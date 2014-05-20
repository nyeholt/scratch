;(function ($) {
	var type = 'persister';
	var typeClass = '.itch-type-' + type;
	
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
		var persister = $(typeClass).first();
		if (persister) {
			
			var myData = persister.data('itch');
			
			if (!myData) {
				Scratch.log("Itch is null");
				Scratch.log(persister);
				return;
			}
			
			if (!myData.data.lastUpdate) {
				myData.data.lastUpdate = Scratch.state.lastSaved;
			}
			
			// get any updates since last request
			$.get(myData.data.saveUrl + api.updates, {
				'date': myData.data.lastUpdate
			}, function (updates) {
				
				var toSave = JSON.stringify(Scratch.ALL_ITCHES);
				toSave = JSON.parse(toSave);
				
				var save = {
					itches: toSave
				};

				$.ajax(myData.data.saveUrl + api.save, {
					'data': JSON.stringify(save), //{action:'x',params:['a','b','c']}
					'type': 'POST',
					'processData': false,
					'contentType': 'application/json', //typically 'application/x-www-form-urlencoded', but the service you are calling may expect 'text/json'... check with the service to see what they expect as content-type in the HTTP header.
					'success': function (data) {
						myData.data.lastUpdate = (new Date()).toUTCString();
						delete save;
						Scratch.save();
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
		
		if (!updateTimer) {
			createTimer(itchData);
		}

		if (!itchData.data.saveUrl) {
			body.append('No endpoint specified, no updates will occur');
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

	$(document).on('prepareGeneralMenu', function (e, items) {
		items[type] = { name: "Persister" };
	});

	$(document).on('itchCreated', typeClass, function () {
		$(this).removeClass('initialising');
		if ($('.itch-type-Persister').length > 1) {
			alert("Only the first created persister will actually function!");
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
	
	/**
	 * on addition to the page, make sure to load the itches up
	 */
	$(function () {
		Scratch.typeLoaded(type);
	});
})(jQuery);