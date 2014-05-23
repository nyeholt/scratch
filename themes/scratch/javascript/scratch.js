;
(function($) {
	var zoomer;

	var TILE_SIZE = 700;
	var TILE_CLASS = 'basictile';
	var $TILE_CLASS = '.' + TILE_CLASS;

	var ITCH_CLASS = 'itch';

	var CONTAINER = '.panzoom';
	
	var scratchStore = null;
	
	/**
	 * A list of all the itches that users can create
	 * 
	 * @type object
	 */
	var itchTypes = {};
	
	/**
	 * A list of wrappers for various itches. Not all types have
	 * a wrapper so there's a default provided
	 * 
	 * @type object
	 */
	var itchWrappers = {};
	
	var defaultWrapper = function (itchData) {
		this.itchData = itchData;
	};

	var Scratch = {
		ALL_TILES: {},
		ALL_ITCHES: {},
		// what is our current itch ID?
		state: {
			itchId: 0
		},
		loaded: false
	};

	Scratch.setStore = function(store) {
		scratchStore = store;
	}

	Scratch.log = function(msg) {
		if (console && console.log) {
			console.log(msg);
		}
	}

	Scratch.init = function() {
		if (!scratchStore) {
			alert("No storage specified");
		}

		var state = scratchStore.get('scratch_state');
		if (state) {
			this.state = state;
		}
		
		if (!this.state.scratchId) {
			this.state.scratchId = Scratch.GUID();
		}

		var itches = scratchStore.get('itches');
		if (itches) {
			this.ALL_ITCHES = itches;
		}

		// see if we've got a start point
		var startPoint = null;

		var origin = this.initOrigin();
		this.loadTilesAround(origin);

		if (this.state.last_interact) {
			startPoint = this.state.last_interact.split('_');
			startPoint[0] = parseInt(startPoint[0]);
			startPoint[1] = parseInt(startPoint[1]);
			var startTile = this.addTile(origin, startPoint);
			this.loadTilesAround(startTile);
		}

		if (this.state.current_transform) {
			zoomer.panzoom('setMatrix', this.state.current_transform);
		}

		this.loaded = true;
	};

	Scratch.save = function() {
		this.state.lastSaved = (new Date()).toUTCString();
		scratchStore.save('scratch_state', this.state);
		scratchStore.save('itches', this.ALL_ITCHES);
	};
	
	Scratch.forExport = function () {
		return {
			itches: this.ALL_ITCHES
		};
	}

	/**
	 * Update a global system state variable
	 * 
	 * @param string option
	 * @param mixed value
	 * @returns null
	 */
	Scratch.updateState = function(option, value) {
		var newOpts = {};
		if (typeof option === 'string') {
			newOpts[option] = value;
		} else {
			newOpts = option;
		}

		$.extend(this.state, newOpts);

		this.save();
	};
	
	/**
	 * Addons should register the type they expose
	 * 
	 * @param object typeInfo
	 * @returns void
	 */
	Scratch.registerType = function (typeInfo) {
		itchTypes[typeInfo.type] = typeInfo;
	};

	/**
	 * Add an object constructor to be used for more indepth logic if needed
	 * around an itch
	 * 
	 * @param string type
	 *			The itch type
	 * @param function ctor
	 *			The constructor used to create a wrapper instance around an itch if
	 *			Scratch.wrap(itchData) is called
	 * @returns {undefined}
	 */
	Scratch.addWrapper = function (type, ctor) {
		itchWrappers[type] = ctor;
		
	};
	
	/**
	 * Wrap an itch data wrapper. 
	 * 
	 * @param object itchData
	 * @returns object
	 */
	Scratch.wrap = function (itchData) {
		var type = itchData.type;
		if (!type) {
			throw "Attempted to wrap invalid itch data";
		}
		
		var ctor = itchWrappers[type];
		if (!ctor) {
			ctor = defaultWrapper;
		}
		
		var wrapped = new ctor(itchData);
		
		return wrapped;
	}

	/**
	 * Initialise the origin tile
	 * 
	 * @param {type} startPoint
	 * @returns {undefined}
	 */
	Scratch.initOrigin = function(startPoint) {
		if (!startPoint) {
			startPoint = [0, 0];
		}
		if (this.ALL_ITCHES.length > 0) {
			return;
		}
		return this.addTile(null, startPoint);
	}

	/**
	 * Add a base tile that acts as a container for the itches
	 * @param string|element relativeElem
	 * @param array relativePos
	 * @returns 
	 */
	Scratch.addTile = function(relativeElem, relativePos) {
		var currentPos = {top: 0, left: 0};
		var newRelPos = [0, 0];
		if (relativeElem) {

			if (!relativeElem.attr || !relativeElem.attr('id')) {
				Scratch.log("relativeElem not a jquery object, or has no ID ");
				Scratch.log(relativeElem);
				return null;
			}
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

				// make sure it's absolute again if coming off the pinned list
				dropped.css('position', 'absolute');
				
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
				dropped.css('height', itch.size[1]);
				itch.position = [parseInt(dropped.css('top')), parseInt(dropped.css('left'))];
				itch.tile = droppedOn.attr('id');
				itch.options.pinned = false;

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

		if (arguments.length == 1 && to.data) {
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
			.addClass('itch-type-' + type).addClass('initialising');

		
		itch.append('<div class="itch-handle"></div>')
			.append('<div class="itch-options">...</div>')
			.append('<div class="itch-body-wrap"><div class="itch-body"></div></div>');

		// bind events
		itch.draggable({
//			handle: '.itch-handle',
//			start: function(event, ui) {
//				if (!$(event.toElement).hasClass('itch')) {
//					return false;
//				}
//			},
			cancel: '.itch-body',
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

		itch.appendTo(to);

		var createNew = false;
		if (!existingData) {
			createNew = true;
			
			existingData = {
				
				tile: $(to).attr('id'),
				position: pos,
				type: type,
				size: size,
				options: {
					title: 'New ' + type + ' itch (#' + itchId +')'
				},
				data: {}
			};
		}
		
		if (!existingData.id) {
			existingData.id = this.nextItchId();
		}
		
		if (!existingData.guid) {
			existingData.guid = Scratch.GUID();
		}
		
		if (!existingData.scratchId) {
			existingData.scratchId = this.state.scratchId;
		}

		this.ALL_ITCHES[existingData.guid] = existingData;
		itch.data('itch', existingData);
		itch.attr('data-id', existingData.guid);

		
		if (existingData.options.title) {
			itch.attr('title', existingData.options.title);
			itch.find('.itch-handle').text(existingData.options.title);
		}

		if (createNew) {
			$(itch).trigger('itchCreated');
			this.save();
		} else {
			$(itch).trigger('itchRestored');
		}
		
		// now if it was pinned...
		if (existingData.options.pinned) {
			this.pinItch(itch);
		}

		return itch;
	};

	Scratch.getItch = function(guid) {
		return this.ALL_ITCHES[guid];
	};
	
	Scratch.$getItch = function(guid) {
		return $('.itch[data-id=' + guid + ']');
	};
	
	Scratch.deleteItch = function(guid) {
		var elem = this.$getItch(guid);
		if (elem.length) {
			elem.trigger('deleteItch');
			delete this.ALL_ITCHES[guid];
			elem.remove();
			this.save();
		}
	};
	
	Scratch.pinItch = function (itch) {
		itch.css({
			'position': 'static',
			'width': 'auto',
			'height': '20px'
		});
		$('#pinned-itches').append(itch);
		
		itch.data('itch').options.pinned = true;

		Scratch.save();
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
		return zoomer.panzoom('getMatrix');
	};
	
	/**
	 * Pan to a specific itch object
	 * 
	 * @param object itch
	 * @returns null
	 */
	Scratch.panToItch = function (itch) {
		var top = parseInt(itch.parent().css('top'));
		var left = parseInt(itch.parent().css('left'));

		itch.trigger('requestFocus');
	}
	
	Scratch.pan = function (x, y) {
		zoomer.panzoom('pan', x, y);
	}

	/**
	 * Nuke everything
	 * 
	 * @returns void
	 */
	Scratch.hardKill = function() {
		if (confirm('Sure?')) {
			scratchStore.remove('scratch_state');
			scratchStore.remove('itches');
			location.reload();
		}
	}

	/**
	 * Bind data to a specific form object
	 * 
	 * @param {type} data
	 * @param {type} form
	 * @returns {undefined}
	 */
	Scratch.bindToForm = function(data, form) {
		try {
			form.populate(data);
		} catch (e) {

		}
	}

	/**
	 * 
	 * Binds form data into a specified object
	 * 
	 * @param object data
	 * @param jquery form
	 * @returns null
	 */
	Scratch.loadFromForm = function(data, form) {
		var object = form.serializeJSON();
		for (var key in object) {
			data[key] = object[key];
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
		$('.selected-itch').each(function() {
			if ($(this).find('.itchForm').is(':visible')) {
				$(this).trigger('renderItch');
			}
			$(this).removeClass('selected-itch');
		})
	};
	
	/**
	 * Provides skeleton functionality for 
	 * 
	 * @param {type} type
	 * @returns {undefined}
	 */
	Scratch.prepareItchType = function (type, handlers) {
		var typeClass = '.itch-type-' + type;
		$(document).on('itchCreated', typeClass, function () {
			$(this).removeClass('initialising');
			if (handlers.onCreate) {
				handlers.onCreate($(this));
			}
			handlers.renderEdit($(this));
		});
		
		$(document).on('itchRestored', typeClass, function () {
			$(this).removeClass('initialising');
			handlers.render($(this));
		});

		$(document).on('renderItch', typeClass, function () {
			// ensure position is correct
			var itchData = $(this).data('itch');
			$(this).css({
				top: itchData.position[0],
				left: itchData.position[1],
				width: itchData.size[0],
				height: itchData.size[1]
			});
			
			handlers.render($(this));
		});

		$(document).on('click', typeClass + ' .itch-handle', function () {
			var itch = $(this).parents('.itch');
			if (itch.find('.itchForm').length > 0) {
				handlers.render(itch);
			} else {
				handlers.renderEdit(itch);
			}
		});

		if (this.loaded) {
			this.typeLoaded(type);
		}
	};

	
	/**
	 * 
	 * @param jqueryelement itch
	 *				The itch element to edit data for
	 * @param string|array templateId
	 *				A jquery identifier, OR array of jquery dform elements representing the form
	 * @param callback beforeEdit
	 *				A callback called before editing the object
	 * @param callback afterEdit
	 *				A callback called after editing the object
	 * @param string propertySet
	 *				Which set of properties on the itch to edit - defaults to 'data'
	 * @returns null
	 */
	Scratch.editForm = function(itch, templateId, beforeEdit, afterEdit, propertySet) {
		if (typeof beforeEdit === 'string') {
			propertySet = beforeEdit;
			beforeEdit = afterEdit;
			afterEdit = null;
		}

		if (!propertySet) {
			propertySet = 'data';
		}

		// todo - implement using dform for json defined forms
		var form = null;
		if (typeof templateId === 'string') {
			form = $(templateId).html();
			itch.find('.itch-body').html(form);
		} else {
			// see https://github.com/daffl/jquery.dform
			if (!templateId.html) {
				templateId = {
					'action': '#',
					'method': 'post',
					'class': 'itchForm',
					'html': templateId
				};
			}
			var o = itch.find('.itch-body').empty().dform(templateId);
			form = itch.find('.itchForm');
		}

		var itchData = itch.data('itch');

		var submitter = itch.find('.itchForm');

		Scratch.bindToForm(itchData[propertySet], submitter);

		if (beforeEdit) {
			beforeEdit.call(itch, submitter, itchData);
		}

		submitter.submit(function(e) {
			e.preventDefault();

			Scratch.loadFromForm(itchData[propertySet], submitter);

			var renderAfterSave = true;
			if (afterEdit) {
				var ret = afterEdit.call(itch, submitter, itchData);
				if (ret === false) {
					renderAfterSave = false;
				}
			}

			Scratch.save();

			submitter.remove();
			delete submitter;
			delete itchData;
			delete form;

			if (renderAfterSave) {
				$(itch).trigger('renderItch');
			}
			
			return false;
		});
	};
	
	/**
	 * Load an external script file
	 * 
	 * @param string src
	 * @returns jqXHR
	 */
	Scratch.loadScript = function (src) {
		return $.getScript(src);
	};
	
	/**
	 * Load an external CSS File
	 * 
	 * @param string css
	 * @returns {undefined}
	 */
	Scratch.loadCss = function (css) {
		var elem = $('<link>');
		elem.attr({
			rel:  "stylesheet",
			type: "text/css",
			href: css
		});
		
		$('head').append(elem);
	};
	
	/**
	 * Call in a $(function () {}); block inside an externally 
	 * loaded script to ensure that elements it provides functionality
	 * for are taken into account. 
	 * 
	 * @param string type
	 * @returns null
	 */
	Scratch.typeLoaded = function (type) {
		$('.itch-type-' + type + '.initialising').each (function () {
			$(this).trigger('itchRestored');
		})
	}

	/**
	 * Add a loading animation into an element
	 * 
	 * @param {type} elem
	 * @returns {undefined}
	 */
	Scratch.loading = function(elem) {
		elem.html('<div class="ajax-loader"><img src="themes/scratch/images/712.png" /></div>');
	}

	var S4 = function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	
	Scratch.GUID = function() {
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}
	
	Scratch.clone = function (data) {
		var cloned = JSON.stringify(data);
		return JSON.parse(cloned);
	}


	$(document).on('renderItch itchRestored', '.itch', function() {
		var itch = $(this);
		var data = $(this).data('itch');
		
		if (data.options.labels && data.options.labels.length) {
			var allLabels = data.options.labels.split(',');
			$(allLabels).each(function () {
				itch.addClass('label-' + $.trim(this));
			})
		}

//		if (data.options.backgroundColor) {
//			$(this).css('color', data.options.fontColor);
//			$(this).css('background-color', data.options.backgroundColor);
//		}
	});


	window.Scratch = Scratch;



	// Init the dom
	$(function() {
		// the last point we right clicked
		var lastContext = null;

		// the event representing the last point we zoomed 
		var lastZoom = null;

		// the last tile we interacted with
		var lastInteract = null;

		$('#collapsecontrols').click(function() {
			$('#controls').removeClass('expanded');
			$('#controls-body').empty();
		})

		zoomer = $('.panzoom');
		zoomer.panzoom({
			$zoomIn: $("#zoomin"),
			$zoomOut: $("#zoomout"),
			$reset: $('#resetzoom'),
			minScale: 0.2
		});

		zoomer.parent().on('mousewheel.focal', function(e) {
			var target = $(e.target);
			
			// only if we're actually moving a base tile
			if (!target.is('.basictile')) {
				return;
			}
			
			lastZoom = e;
			e.preventDefault();
			var delta = e.delta || e.originalEvent.wheelDelta;
			var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
			zoomer.panzoom('zoom', zoomOut, {
				increment: 0.1,
				animate: false,
				focal: lastZoom
			});

			Scratch.updateState('current_transform', Scratch.currentTransform());
		});
		
		$(document).on('requestFocus', function (event) {
//			
//			zoomer.panzoom('zoom', 1, {
//				increment: 0.1,
//				animate: true,
//				focal: event
//			});
		});
		
		$(zoomer).on('touchstart mouseover', '.itch', function() {
			zoomer.panzoom('disable');
		});

		$(zoomer).on('touchend mouseout', '.itch', function() {
			zoomer.panzoom('enable');
		});

		$(zoomer).on('panzoomend', function(e) {
			Scratch.loadTilesAround($(e.target));

			Scratch.updateState({
				'current_transform': Scratch.currentTransform(),
				'last_interact': $(e.target).attr('id')
			});
		})

		$.dform.addType("color", function(options) {
			// Return a new button element that has all options that
			// don't have a registered subscriber as attributes
			return $('<input type="color" />').dform('attr', options);
		});

		$(document).on('click', '.basictile', function(e) {
			if ($(e.target).hasClass('basictile')) {
				Scratch.closeItches();
			}
		});
		
		$(document).on('click', '.itch', function(e) {
			$('.topitch').removeClass('topitch');
			$(this).addClass('topitch');
			
			if (!e.ctrlKey) {
				$('.selected-itch').removeClass('selected-itch');
			}
			$(this).addClass('selected-itch');
		});
		
		$(document).on('optionsUpdate', '.itch', function () {
			var itch = $(this);
			var data = itch.data('itch');
			itch.attr('title', data.options.title);
			itch.find('.itch-handle').text(data.options.title);
		})

		$(document).on('dblclick', '.basictile', function(e) {
			zoomer.panzoom('resetZoom', {
				focal: e
			});
			Scratch.updateState('current_transform', Scratch.currentTransform());
		});

		$(document).on('keyup', function(e) {
			if (e.which === 27) {
				Scratch.closeItches();
			}
		})

		$(document).on('contextmenu', '.basictile', function(e) {
			var target = $(e.target);
			if (!target.is('.basictile')) {
				e.stopImmediatePropagation();
				Scratch.log("Context menu on a non-basictile element... baddd");
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
		
		/** MENU GENERATION STUFF */
		var defaultGeneralMenu = {
			"itch": {
				name: 'Itch'
			}
		};

		var defaultOptionsMenu = {
			"options": {
				name: 'Options',
				execute: function(options) {
					var itch = $(this);
					
					var elems = [
						{
							"name" : "title",
							"caption" : "Title",
							"type" : "text"
						},
//						{
//							"name" : "fontColor",
//							"caption" : "Font Colour",
//							"type" : "color"
//						},
//						{
//							"name" : "backgroundColor",
//							"caption" : "Background Colour",
//							"type" : "color"
//						},
						{
							"name" : "labels",
							"caption" : "Labels (comma separated)",
							"type" : "text"
						},
						{
							"type" : "submit",
							"value" : "Update"
						}
					];

					Scratch.editForm(itch, elems /*'#GeneralSettingsForm'*/, null, function (form, data) {
						itch.trigger('optionsUpdate');
					}, 'options');
				}
			},
			
			'pin': {
				name: "Pin",
				execute: function (o) {
					Scratch.pinItch($(this));
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
		};

		var generalHandler = function(key, options) {
			if (options.items && options.items[key] && options.items[key].execute) {
				options.items[key].execute.call($(this).parents('.itch'), options);
			}
		};

		// Initialise and boot away
		
		// ugly hack for now...
		Scratch.setStore(new LocalDataStore());
		Scratch.init();

		// aannndd some post init stuff that hasn't been cleaned up yet...
		setTimeout(function() {
			$(document).trigger('prepareGeneralMenu', defaultGeneralMenu);
			$(document).trigger('prepareOptionsMenu', defaultOptionsMenu);

			// this is built here to allow plugins time to actually modify 
			// the menu items. 
			$.contextMenu({
				selector: '.basictile',
				build: function(trigger, e) {
					var items = $.extend(true, {}, defaultGeneralMenu);
					
					// add any specific ones in
					$(document).trigger('updateGeneralMenu', items);

					return {
						callback: function(key, options) {
							if (!lastContext) {
								return;
							}
							if (options.items && options.items[key] && options.items[key].execute) {
								options.items[key].execute.call(this, options);
							} else {
								Scratch.addItch($(lastContext.element), lastContext.position, key);
							}
						},
						items: items
					};
				}
			});

			$.contextMenu({
				selector: '.itch-options',
				trigger: "left",
				build: function(trigger, e) {
					var itchElem = $(trigger).parents('.itch');

					var items = $.extend(true, {}, defaultOptionsMenu);
					
					// add any specific ones in
					itchElem.trigger('updateItemOptionMenu', items);

					return {
						callback: generalHandler,
						items: items
					};
				}
			});
		}, 1000);
	});
	
})(jQuery);

