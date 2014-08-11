;(function ($) {
	var type = 'realtime';
	
	var sockets = {};
	
	var handlers = {
		render: function (itch) {
			// check if markdown is loaded yet
			var body = itch.find('.itch-body');
			body.empty();
			if (typeof io == 'undefined') {
				body.append('<h3>Offline - could not load socket.io</h3>');
			} else {
				var info = itch.data('itch');
				bindSocket(info);
				body.append("<p>Connected to " + info.data.remote + "</p>");
//				body.append('<button class="send-updates">Send updates</button>');
//				body.append('<button class="get-updates">Get updates</button>');
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
					type: 'textarea',
					name: 'listenTo',
					caption: 'Take data from'
				},
				{
					type: 'submit',
					value: 'Update'
				}
			];
			Scratch.editForm(itch, elems, null, function () {
				var info = itch.data('itch');
				bindSocket(info);
			});
		}
	};
	
	$(document).on('itchUpdated', function (e) {
		var data = $(e.target).data('itch');
		
		// send on all sockets
		for (var url in sockets) {
			sockets[url].emit("itchUpdate", data);
		}
	});

	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Collab"};
	});
	
	var bindSocket = function (info) {
		if (info.data.remote && info.data.remote.length > 0 && !sockets[info.data.remote]) {
			var socket = io(info.data.remote, {transports:['websocket', 'flashsocket'] });
			sockets[info.data.remote] = socket;
			
			socket.on('itchUpdate', function (data) {
				if (data.type == type) {
					return;
				}
				$(document).trigger('loadItch', data);
			})
		}
	};
	
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
		})
//		io.set('transports', ['websocket', 'flashsocket']);
//		var socket = io('http://127.0.0.1:3000', {transports:['websocket', 'flashsocket'] });

	});
	
})(jQuery);
