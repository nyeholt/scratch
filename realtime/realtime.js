//var http = require('http').Server();
var io = require('socket.io').listen(3000);

io.set('transports', ['websocket', 'flashsocket']);


var connect = function (socket) {
	socket.on('disconnect', disconnect);
};

var disconnect = function () {
	
};

io.on('connection', connect);
//
//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});