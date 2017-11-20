'use strict';

var Primus = require('primus');
var http = require('http');

var server = http.createServer();
var primus = new Primus(server, { transformer: 'uws' });

primus.on('error', function error(err) {
	console.error('ERROR', err.stack);
});

primus.on('connection', function (socket) {
	socket.on('data', function ping(message) {
		console.log('recieved a new message', message);
		socket.write({ data: message });
	});
});

server.listen(8081); // And listen on the HTTP server
