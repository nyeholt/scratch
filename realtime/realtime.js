//var http = require('http').Server();
var io = require('socket.io').listen(3000);

io.set('transports', ['websocket', 'flashsocket']);

var clients = {};

var sendTo = {};

var state = {};


var connect = function (socket) {
	clients[socket.id] = socket;
	console.log("Client connected: "+ socket.id);
	socket.on('disconnect', function () {
		if (socket.remoteId) {
			console.log("Remove " + socket.remoteId);
			delete clients[socket.remoteId];
		} else {
			console.log("No remoteId registered for socket");
		}
		delete clients[socket.id];
		disconnect();
	});
	
	socket.on('register', function (data) {
		if (data.me) {
			console.log("Register " + data.me);
			clients[data.me] = socket;
			socket.remoteId = data.me;
		}
	});

	socket.on('itchUpdate', function (data) {
		itchUpdate(data, socket);
	}); 
	
	
	socket.on('registerListeners', function (data) {
		
		registerListeners(data);
	})
};

var disconnect = function () {
	console.log("Client disconnected");
};

var itchUpdate = function (data, client) {
	if (!data.guid) {
		return;
	}
	if (!data.scratchId) {
		return;
	}
	
	console.log("Update " + data.guid + " from " + data.scratchId);
	
	var list = sendTo[data.scratchId];
	
	if (list && list.length) {
		console.log("Restrict sending to list");
		for (var i = 0, l = list.length; i < l; i++) {
			var clid = list[i];
			var clientSock = clients[clid];
			console.log("Looking up client " + clid);
			if (clientSock) {
				console.log("Send to " + clid);
				clientSock.emit('itchUpdate', data);
			}
		}
	} else {
		console.log("Broadcast update");
		client.broadcast.emit('itchUpdate', data);
	}
}

var registerListeners = function (data) {
	if (data.me && data.list) {
		sendTo[data.me] = data.list;
	}
};

io.on('connection', connect);
//
//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});