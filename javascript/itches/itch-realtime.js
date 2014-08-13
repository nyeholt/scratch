;(function ($) {
	var type = 'realtime';
	
	var sockets = {};
	
	var handlers = {
		render: function (itch) {
			// check if markdown is loaded yet
			var body = itch.find('.itch-body');
			var info = itch.data('itch');
			
			body.empty();
			if (typeof io == 'undefined') {
				body.append('<h3>Offline - could not load socket.io</h3>');
			} else if (!sockets[info.data.remote]) {
				bindSocket(info, itch);
				body.append("<p>Connecting to " + info.data.remote + "</p>");
			} else {
				body.append("<p>Connected to " + info.data.remote + "</p>");
				body.append('<p>Your ID: ' + Scratch.getState('scratchId') + '</p>');
				
			}
		},
		renderEdit: function (itch) {
			// <textarea name="content" rows="10"></textarea>
			var elems = [
				{
					type: 'text',
					name: 'remote',
					caption: 'Remote server'
				},
				{
					type: 'text',
					name: 'sendTo',
					caption: 'Those allowed to access your data'
				},
				{
					type: 'submit',
					value: 'Update'
				}
			];
			Scratch.editForm(itch, elems, null, function () {
				var info = itch.data('itch');
				bindSocket(info);
				registerListeners(info);
			});
		}
	};

	$(document).on('itchUpdated', function (e) {
		var data = $(e.target).data('itch');
		if (data.options.pushRemote) {
			// send on all sockets
			for (var url in sockets) {
				sockets[url].emit("itchUpdate", data);
			}
		}
	});

	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Collab"};
	});
	
	$(document).on('updateoptionsform', function (e, form) {
		if (form && form.html) {
			var i = 0;
			for (i in form.html) {
				var type = form.html[i].type;
				if (type == 'button' || type == 'submit') {
					break;
				}
			}
			
			form.html.splice(i, 0, {
				name: 'pushRemote',
				caption: 'Push this itch',
				type: 'checkbox'
			})
		}
	});
	
	var bindSocket = function (info, itch) {
		if (info.data.remote && info.data.remote.length > 0 && !sockets[info.data.remote]) {
			info.data.connected = false;
			var socket = io(info.data.remote, {transports:['websocket', 'flashsocket'] });
			
			socket.on('connect_error', function() {
				info.data.connected = false;
				console.log('connection error');
			});

			socket.on('connect', function () {
				sockets[info.data.remote] = socket;
				info.data.connected = true;
				
				socket.emit('register', {me: Scratch.getState('scratchId')});

				registerListeners(info);
				
				if (itch) {
					handlers.render(itch);
				}
			})
			
			socket.on('itchUpdate', function (data) {
				if (data.type == type) {
					return;
				}
				$(document).trigger('loadItch', data);
			})
		}
	};
	
	var registerListeners = function (info) {
		var scratchId = Scratch.getState('scratchId');
		var socket = socketFor(info);
		
		if (socket && info.data.sendTo && info.data.sendTo.length) {
			var sendTo = info.data.sendTo.replace(' ', '').split(',');
			
			console.log(sendTo);
			
			socket.emit('registerListeners', {me: scratchId, list: sendTo});
		}
	}

	var socketFor = function(info) {
		if (info.data.remote && info.data.remote.length > 0 && sockets[info.data.remote]) {
			return sockets[info.data.remote];
		}
	};

	Scratch.prepareItchType(type, handlers);
	
	Scratch.loadScript("https://cdn.socket.io/socket.io-1.0.6.js").done(function () {
		$('.itch-type-realtime').each(function () {
			var itch = $(this);
			handlers.render(itch);
		});
//		io.set('transports', ['websocket', 'flashsocket']);
//		var socket = io('http://127.0.0.1:3000', {transports:['websocket', 'flashsocket'] });

	});
	
})(jQuery);
