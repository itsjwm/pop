'use strict';

var Primus = require('primus');
var http = require('http');
const postgraphql = require('postgraphql').postgraphql;
var Client = require('node-rest-client').Client;
var client = new Client();
import { Pool } from 'pg-pool'

// postgraphql -c "postgres://itsjwm:itsjwm@localhost:5432/pop" --watch

var server = http.createServer(postgraphql('postgres://itsjwm:itsjwm@localhost:5432/pop', 'public', {graphiql: true, watchPg: true}));
var primus = new Primus(server, { transformer: 'uws' });

primus.on('error', function error(err) {
	console.error('ERROR', err.stack);
});

primus.on('connection', function (socket) {
	console.log("connection");
	socket.on('data', function ping(message) {
		console.log('recieved a new message', message);
		var msg = process_graphql_request(message, socket);
	});
});

server.listen(8081); // And listen on the HTTP server
console.log("Listening on 8081");

// This the function will likely change.  For now - we use post
function process_graphql_request (req, socket) {
	var body = '{ allServers { edges { node { id } } }   }';

	var options = {
	  "method": "PUT",
	  "uri": "127.0.0.1",
	  "path": "/graphql/",
	  "headers": { 
	    "Content-Type" : "application/json",
	  }
	}
	var opts = JSON.stringify(options);

	http.request(opts, httpcallback(socket)).end(body);
};

function httpcallback (response, socket) {
	var str = ''
	console.log("callback called with: response");
	response.on('data', function(chunk){
		str += chunk
		console.log("response.on with ", str);
	})

	response.on('end', function(){
		console.log("sending:", str)
		socket.write(str)
	  })
}
