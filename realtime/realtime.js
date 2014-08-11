//var http = require('http').Server();
var io = require('socket.io').listen(3000);

io.set('transports', ['websocket', 'flashsocket']);


var connect = function (socket) {
	console.log("Client connected");
	socket.on('disconnect', disconnect);
};

var disconnect = function () {
	console.log("Client disconnected");
};

io.on('connection', connect);
//
//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});