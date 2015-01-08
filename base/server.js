var _ = require('underscore');
var express = require('express');
var http = require('http');
var WSS = require('ws').Server;
var obj = require('./obj');
var wso = require('./ws-obj');

var clients = {};

var addClient = function(connections, ws) {
  var id = _.uniqueId();
  connections[id] = {ws: ws};
  console.log('new client: ', id);
  return id;
}
var removeClient = function(connections, id) {
  console.log('closing: ', id);
  delete connections[id];
}

var send = function(ws, msg) {
  ws.send(JSON.stringify(msg));
}

var startServer = function(port) {
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);
  server.listen(port);

  var wss = new WSS({server: server});

  var base_server = new obj();
  var connections = {};
  // Dependent objects need access to websocket objects too
  base_server.connections = connections;

  // Handles connections and closed connections
  var base_handler = {
    // {ws}
    'ws': function(msg) {
      var ws = msg.ws;
      var id = addClient(connections, ws);
      // Sends data to client
      var output = wso.wrap_output(ws);
      // Handles messages from client
      var input = wso.wrap_input(ws);
      connections[id].output = output;
      connections[id].input = input;
      // Register close handler
      ws.on('close', function() {
        base_server.handle({tag: 'close', id: id});
      });

      // Now handle the message with ID added
      base_server.handle({tag: 'connection', ws: ws, id: id});
    },
    // {id}
    'close': function(msg) {
      removeClient(connections, msg.id);
    },
  };

  // Make the object
  base_server.add(base_handler);

  wss.on('connection', function(ws) {
    base_server.handle({tag: 'ws', ws: ws});
  });

  // External code registers dependencies on this object
  return base_server;
}

module.exports = startServer;
