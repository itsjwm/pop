'use strict';

var Primus = require('primus');
var http = require('http');

const { Pool } = require('pg');
// const { graphql } = require('graphql');
// const { withPostGraphQLContext } = require('postgraphile');
// const http = require('http');
// const { postgraphile } = require('postgraphile')

// Create Postgres connection
var pool = new Pool({
  user: 'itsjwm',
  password: 'itsjwm',
  host: 'localhost',
  port: 5432,
  ssl: false,
  database: 'pop',
  max: 20, // set pool max size to 20
  min: 2, // set min pool size to 4
  idleTimeoutMillis: 1000, // close idle clients after 1 second
  connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
})

var mypool = new Pool(pool)

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    console.log(result.rows)
  })
})
// Create Postgres connection

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

server.listen(8081);
