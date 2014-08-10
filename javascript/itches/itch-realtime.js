;(function ($) {
	var type = 'realtime';
	
	var handlers = {
		render: function (itch) {
			// check if markdown is loaded yet
			var info = itch.data('itch');
			var body = itch.find('.itch-body');
			
			body.append('<button class="send-updates">Send updates</button>');
			body.append('<button class="get-updates">Get updates</button>');
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
					type: 'submit',
					value: 'Update'
				}
			];
			Scratch.editForm(itch, elems, function () {
				
			});
		}
	};

	$(document).on('updateGeneralMenu', function(e, items) {
		items[type] = {name: "Collab"};
	});

	Scratch.prepareItchType(type, handlers);
	
	Scratch.loadScript("https://cdn.socket.io/socket.io-1.0.6.js").done(function () {
		console.log("Socket loaded");
//		io.set('transports', ['websocket', 'flashsocket']);
		var socket = io('http://127.0.0.1:3000', {transports:['websocket', 'flashsocket'] });

	});
	
})(jQuery);
