;
(function($) {
	var zoomer;

	var TILE_SIZE = 700;
	var TILE_CLASS = 'basictile';

	var ITCH_CLASS = 'itch';

	var CONTAINER = '.panzoom';

	var Scratch = {
		store: null,
		ALL_TILES: {},
		ALL_ITCHES: {},
		// what is our current itch ID?
		state: {
			itchId: 0
		}
	};

	Scratch.setStore = function(store) {
		this.store = store;
	}

	Scratch.init = function() {
		if (!this.store) {
			alert("No storage specified");
		}

		var state = this.store.get('scratch_state');
		if (state) {
			this.state = state;
		}

		var itches = this.store.get('itches');
		if (itches) {
			this.ALL_ITCHES = itches;
		}

		var origin = this.initOrigin();
		this.loadTilesAround(origin);
	};

	Scratch.save = function() {
		this.store.save('scratch_state', this.state);
		this.store.save('itches', this.ALL_ITCHES);
	};

	Scratch.initOrigin = function() {
		if (this.ALL_ITCHES.length > 0) {
			return;
		}
		return this.addTile(null, [0, 0]);
	}

	Scratch.addTile = function(relativeElem, relativePos) {
		var currentPos = {top: 0, left: 0};
		var newRelPos = [0, 0];
		if (relativeElem) {
			// horrible hack, but works around the issue of the parent webkit transform
			currentPos = {
				top: parseInt($(relativeElem).css('top')),
				left: parseInt($(relativeElem).css('left')),
			}
			// horrible hack to determine a y/x position relative to origin
			var relativeToOrigin = relativeElem.attr('id').split('_');
			var relTop = parseInt(relativeToOrigin[0]);
			var relLeft = parseInt(relativeToOrigin[1]);

			newRelPos[0] = relTop + relativePos[0];
			newRelPos[1] = relLeft + relativePos[1];
		}

		var newTilePos = {
			top: currentPos.top + (TILE_SIZE * relativePos[0]),
			left: currentPos.left + (TILE_SIZE * relativePos[1])
		};

		var key = newRelPos[0] + '_' + newRelPos[1];

		// already loaded?
		if (Scratch.ALL_TILES[key]) {
			return;
		}



		var newTile = $('<div>').addClass(TILE_CLASS).attr('id', key).css(newTilePos).appendTo(CONTAINER);

		newTile.droppable({
			drop: function(event, ui) {
				var droppedOn = $(this);
				var dropped = $(ui.draggable);

				var currentParent = $(dropped.parent());

				if (currentParent[0] !== this) {
					var oldPosition = dropped.offset();
					dropped.appendTo(droppedOn);
					var newPosition = dropped.offset();

					//calculate correct position offset
					var leftOffset = null;
					var topOffset = null;

					if (oldPosition.left > newPosition.left) {
						leftOffset = (oldPosition.left - newPosition.left);
					} else {
						leftOffset = -(newPosition.left - oldPosition.left);
					}

					if (oldPosition.top > newPosition.top) {
						topOffset = (oldPosition.top - newPosition.top);
					} else {
						topOffset = -(newPosition.top - oldPosition.top);
					}

					//instantly offsetting the div to it current position
					ui.draggable.animate({
						left: '+=' + leftOffset,
						top: '+=' + topOffset,
					}, 0);

				}

				var itch = dropped.data('itch');
				itch.position = [parseInt(dropped.css('top')), parseInt(dropped.css('left'))];
				itch.tile = droppedOn.attr('id');

				Scratch.save();

				zoomer.panzoom('enable');
			}
		});

		Scratch.ALL_TILES[key] = newTile;

		// now find all the itches that go in this tile
		this.loadItchesForTile(key);

		return newTile;
	};

	Scratch.getTile = function(x, y) {
		var key = (x * TILE_SIZE) + '_' + (y * TILE_SIZE);
		return Scratch.ALL_TILES[key];
	};

	Scratch.loadTilesAround = function(relativeElem) {
		for (var i = -1; i <= 1; i++) {
			for (var j = -1; j <= 1; j++) {
				if (i == 0 && j == 0) {
					continue;
				}
				Scratch.addTile(relativeElem, [i, j]);
			}
		}
	};

	Scratch.deleteItch = function(id) {
		var elem = $('.itch[data-id=' + id + ']');
		if (elem.length) {
			delete this.ALL_ITCHES[id];
			elem.remove();
			this.save();
		}
	};

	/**
	 * 
	 * @param mixed to
	 *				The tile to add to, either as a jquery object or an x,y of which tile 
	 * @param array pos
	 *				An array of [x,y] for the absolute position in the tile
	 * @param string type
	 *				The type of the itch to add
	 * @returns DOMElement
	 */
	Scratch.addItch = function(to, pos, type, existingData) {
		// we've got existing data to work with
		var size = [400, 300];

		if (arguments.length == 1 && to.id) {
			existingData = to;
			to = $('#' + existingData.tile);
			pos = existingData.position;
			type = existingData.type;
			size = existingData.size ? existingData.size : size;
		}

		if (!pos) {
			pos = [100, 100];
		}
		if (to.split && to.indexOf(',') > 0) {
			var bits = to.split(',');
			to = Scratch.getTile(bits[0], bits[1]);

			if (!to) {
				return;
			}
		}

		var itch = $('<div>')
			.addClass(ITCH_CLASS)
			.css({
				top: pos[0],
				left: pos[1],
				width: size[0],
				height: size[1]
			})
			.addClass('itch-type-' + type)
			.appendTo(to);

		itch.append('<div class="itch-handle"></div>').append('<div class="itch-options">...</div>').append('<div class="itch-body"></div>');

		// bind events
		itch.draggable({
//			handle: '.itch-handle',
			stop: function(event, ui) {
				// note: This is handled in the drop handler above to prevent problems with the
				// new parent elem not being tracked
//				var itch = ui.helper.data('itch');
//				itch.position = [ui.position.top, ui.position.left];
//				Scratch.save();
			}
		}).resizable({
			stop: function(event, ui) {
				var itch = ui.element.data('itch');
				itch.size = [ui.size.width, ui.size.height];
				Scratch.save();
			}
		});

		var doSave = false;
		if (!existingData) {
			doSave = true;
			existingData = {
				id: this.nextItchId(),
				tile: $(to).attr('id'),
				position: pos,
				type: type,
				size: size,
				options: {},
				data: {}
			};
		}

		this.ALL_ITCHES[existingData.id] = existingData;
		itch.data('itch', existingData);
		itch.attr('data-id', existingData.id);

		if (doSave) {
			this.save();
		}

//		$(document).trigger('itchCreated');
		$(itch).trigger('itchCreated');
		$(itch).trigger('renderItch');

		return itch;
	};

	Scratch.getItch = function(id) {
		return this.ALL_ITCHES[id];
	};

	Scratch.nextItchId = function() {
		return ++this.state.itchId;
	};

	Scratch.loadItchesForTile = function(tileId) {
		for (var k in this.ALL_ITCHES) {
			if (this.ALL_ITCHES[k].tile == tileId) {
				this.addItch(this.ALL_ITCHES[k]);
			}
		}
	}

	// SOME UI HELPERS
	/**
	 * Get the currently applied UI transform by the zoomer
	 * 
	 * @returns 
	 */
	Scratch.currentTransform = function() {
		var values = [1, 0, 0, 0, 0, 0];
		var transform = zoomer.css('transform');
		if (transform && transform !== "none") {
			values = transform.match(/-?[0-9\.]+/g);
		}
		return values;
	}

	Scratch.hardKill = function() {
		if (confirm('Sure?')) {
			this.store.remove('scratch_state');
			this.store.remove('itches');
			location.reload();
		}
	}

	Scratch.bindToForm = function(data, form) {
		form.populate(data);
	}

	Scratch.loadFromForm = function(data, form) {
		var object = form.serializeJSON();
		for (var key in object) {
			data[key]  = object[key];
		}
//		inputs.each(function() {
//			data[this.name] = $(this).val();
//		})
	};

	/**
	 * Close all open itch forms (ie cancel any editing and just render()
	 * 
	 * @returns null
	 */
	Scratch.closeItches = function() {
		$('.itch').each(function() {
			if ($(this).find('.itchForm').is(':visible')) {
				$(this).trigger('renderItch');
			}
		})
	};


	Scratch.editForm = function(itch, templateId, beforeEdit, afterEdit, propertySet) {

		if (typeof beforeEdit === 'string') {
			propertySet = beforeEdit;
			beforeEdit = afterEdit;
			afterEdit = null;
		}

		if (!propertySet) {
			propertySet = 'data';
		}

		var form = $(templateId).html();
		itch.find('.itch-body').html(form);

		var itchData = itch.data('itch');

		var submitter = itch.find('.itchForm');

		Scratch.bindToForm(itchData[propertySet], submitter);

		if (beforeEdit) {
			beforeEdit.call(itch, submitter, itchData);
		}

		submitter.submit(function(e) {
			e.preventDefault();

			Scratch.loadFromForm(itchData[propertySet], submitter);

			if (afterEdit) {
				afterEdit.call(itch, submitter, itchData);
			}

			Scratch.save();

			submitter.remove();
			delete submitter;
			delete itchData;
			delete form;

			$(itch).trigger('renderItch');
			return false;
		});
	};
	
	Scratch.loading = function (elem) {
		elem.html('<div class="ajax-loader"><img src="themes/scratch/images/712.png" /></div>');
	}

	$(document).on('renderItch', '.itch', function() {
		var data = $(this).data('itch');
		if (data.options.backgroundColor) {
			$(this).css('background-color', data.options.backgroundColor);
		}
	});

	window.Scratch = Scratch;



	// Init the dom
	$(function() {
		var lastContext = null;
		var lastZoom = null;

		zoomer = $('.panzoom');
		zoomer.panzoom({
			$zoomIn: $("#zoomin"),
			$zoomOut: $("#zoomout"),
			minScale: 0.2
		});

		$(document).on('click', '#resetzoom', function() {
			zoomer.panzoom('resetZoom', {
				focal: lastZoom
			});
		})

		zoomer.parent().on('mousewheel.focal', function(e) {
			lastZoom = e;
			e.preventDefault();
			var delta = e.delta || e.originalEvent.wheelDelta;
			var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
			zoomer.panzoom('zoom', zoomOut, {
				increment: 0.1,
				animate: false,
				focal: e
			});
		});

		$(zoomer).on('touchstart mouseover', '.itch', function() {
			zoomer.panzoom('disable');
		});

		$(zoomer).on('touchend mouseout', '.itch', function() {
			zoomer.panzoom('enable');
		});

		$(zoomer).on('panzoomend', function(e) {
			Scratch.loadTilesAround($(e.target));
//			console.log("pan-zoom end");
		})

		$(document).on('click', '.basictile', function(e) {
			if ($(e.target).hasClass('basictile')) {
				Scratch.closeItches();
			}
		})

		$(document).on('keyup', function(e) {
			if (e.which === 27) {
				Scratch.closeItches();
			}
		})

		$(document).on('contextmenu', '.basictile', function(e) {
			var target = $(e.target);
			if (!target.is('.basictile')) {
				e.stopImmediatePropagation();
				console.log("Context menu on a non-basictile element... baddd");
				return;
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return false;
			}
			var offsetPos = [];
			if (e.offsetX === undefined) {
				var offx = e.pageX - target.offset().left;
				var offy = e.pageY - target.offset().top;
				offsetPos = [offy, offx];
			} else {
				offsetPos = [e.offsetY, e.offsetX];
			}

			var transform = Scratch.currentTransform();
			if (transform[0] != 1) {
				var newX = offsetPos[0] ? offsetPos[0] / transform[0] : 0;
				var newY = offsetPos[1] ? offsetPos[1] / transform[0] : 0;
				offsetPos = [newY, newX];
			}

			lastContext = {
				element: '#' + target.attr('id'),
				position: offsetPos
			};
		});

		$.contextMenu({
			selector: '.basictile',
			callback: function(key, options) {
				if (!lastContext) {
					return;
				}
				if (options.items && options.items[key] && options.items[key].execute) {
					options.items[key].execute.call(this, options);
				} else {
					Scratch.addItch($(lastContext.element), lastContext.position, options.items[key].name);
				}
			},
			items: {
				"newItch": {
					name: 'Itch'
				},
				'embed': {
					name: "Embed"
				},
				'rss': {
					name: "RSS"
				}
			}
		});

		$.contextMenu({
			selector: '.itch-options',
			trigger: "left",
			callback: function(key, options) {
				if (options.items && options.items[key] && options.items[key].execute) {
					options.items[key].execute.call($(this).parents('.itch'), options);
				}
			},
			items: {
				"options": {
					name: 'Options',
					execute: function(options) {
						var itch = $(this);

						Scratch.editForm(itch, '#GeneralSettingsForm', 'options')
					}
				},
				"delete": {
					name: "Delete",
					execute: function(o) {
						var id = $(this).attr('data-id');
						if (id) {
							if (confirm("Sure?")) {
								Scratch.deleteItch(id);
							}
						}
					}
				}
			}
		});

		Scratch.init();
	});

	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
})(jQuery);

