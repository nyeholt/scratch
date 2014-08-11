//var http = require('http').Server();
var io = require('socket.io').listen(3000);

io.set('transports', ['websocket', 'flashsocket']);

var clients = {};

var listenTo = {};

var state = {};


var connect = function (socket) {
	clients[socket.id] = socket;
	console.log("Client connected: "+ socket.id);
	socket.on('disconnect', function () {
		delete clients[socket.id];
		disconnect();
	});

	socket.on('itchUpdate', function (data) {
		itchUpdate(data, socket);
	}); 
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
	
	client.broadcast.emit('itchUpdate', data);
}

io.on('connection', connect);
//
//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});