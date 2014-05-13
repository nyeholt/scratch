;
(function($) {
	var zoomer;
	
	var TILE_SIZE = 500;
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

	Scratch.setStore = function (store) {
		this.store = store;
	}
	
	Scratch.init = function () {
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

	Scratch.save = function () {
		this.store.save('scratch_state', this.state);
		this.store.save('itches', this.ALL_ITCHES);
	};

	Scratch.initOrigin = function () {
		if (this.ALL_ITCHES.length > 0) {
			return;
		}
		return this.addTile(null, [0,0]);
	}

	Scratch.addTile = function(relativeElem, relativePos) {
		var currentPos = {top: 0, left: 0};
		if (relativeElem) {
			// horrible hack, but works around the issue of the parent webkit transform
			currentPos  = {
				top: parseInt($(relativeElem).css('top')),
				left: parseInt($(relativeElem).css('left')),
			}
		}

		var newTilePos = {
			top: currentPos.top + (TILE_SIZE * relativePos[0]),
			left: currentPos.left + (TILE_SIZE * relativePos[1])
		};

		var key = newTilePos.top + '_' + newTilePos.left;

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

				if (currentParent[0] === this) {
					return;
				}

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
	
	Scratch.getTile = function (x, y) {
		var key = (x * TILE_SIZE) + '_' + (y * TILE_SIZE);
		return Scratch.ALL_TILES[key];
	};

	Scratch.loadTilesAround = function (relativeElem) {
		for (var i = -1; i <= 1; i++) {
			for (var j = -1; j <= 1; j++) {
				if (i == 0 && j == 0) {
					continue;
				}
				Scratch.addTile(relativeElem, [i, j]);
			}
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
	Scratch.addItch = function (to, pos, type, existingData) {
		// we've got existing data to work with
		var size = [100, 100];
		
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

		var itch = $('<div>').addClass(ITCH_CLASS).css({
			top: pos[0],
			left: pos[1],
			width: size[0],
			height: size[1]
		}).appendTo(to);

		// bind events
		itch.draggable({
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
				type: '',
				size: [100, 100],
				data: {

				}
			};
		}

		this.ALL_ITCHES[existingData.id] = existingData;
		itch.data('itch', existingData);
		
		if (doSave) {
			this.save();
		}
		
		return itch;
	};
	
	Scratch.getItch = function (id) {
		return this.ALL_ITCHES[id];
	};
	
	Scratch.nextItchId = function () {
		return ++this.state.itchId;
	};

	Scratch.loadItchesForTile = function (tileId) {
		for (var k in this.ALL_ITCHES) {
			if (this.ALL_ITCHES[k].tile == tileId) {
				this.addItch(this.ALL_ITCHES[k]);
			}
		}
	}

	window.Scratch = Scratch;


	$(function() {
		zoomer = $('.panzoom');
		zoomer.panzoom({
			$zoomIn: $("#zoomin"),
            $zoomOut: $("#zoomout"),
			$reset: $('#resetzoom')
		});

		$(zoomer).on('touchstart mouseover', '.itch', function() {
			zoomer.panzoom('disable');
		});

		$(zoomer).on('touchend mouseout', '.itch', function() {
			zoomer.panzoom('enable');
		});

		$(zoomer).on('panzoomend', function(e) {
			console.log(e);
			Scratch.loadTilesAround($(e.target));
//			console.log("pan-zoom end");
		})


		Scratch.init();
	})
})(jQuery);

