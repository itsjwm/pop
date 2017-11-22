'use strict';

var Primus = require('primus');
var http = require('http');
const postgraphql = require('postgraphql').postgraphql;

// postgraphql -c "postgres://itsjwm:itsjwm@localhost:5432/pop" --watch

var server = http.createServer(postgraphql('postgres://itsjwm:itsjwm@localhost:5432/pop', 'public', {graphiql: true, watchPg: true}));
var primus = new Primus(server, { transformer: 'uws' });

// withPostGraphQLContext();
// createPostGraphQLSchema('postgres://localhost:5432', 'public', {graphiql: true, watchPG: true})
//   .then(schema => { })
//   .catch(error => { })

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
console.log("Listening on 8081");
