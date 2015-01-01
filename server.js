var util = require('./js/util');

var _ = require('underscore');
var express = require('express');
var http = require('http');
var WSS = require('ws').Server;

var clients = {};

var add_client = function(ws) {
  var id = _.uniqueId();
  clients[id] = {ws: ws};
  console.log('connection: ', id);
  return id;
}
var remove_client = function(id) {
  console.log('closing: ', id);
  delete clients[id];
}

var send = function(ws, msg) {
  ws.send(JSON.stringify(msg));
}

// Add handlers here
var make_handlers = function(id, ws) {
  return {
    'get-id': function(data) {
      console.log('id requested');
      send(ws, {tag: 'id', data: {id: id}});
    },
  };
}

var start_server = function(port) {
  var app = express();
  app.use(express.static('static'));
  var server = http.createServer(app);
  server.listen(port);

  var wss = new WSS({server: server});

  wss.on('connection', function(ws) {
    var id = add_client(ws);

    var handlers = make_handlers(id, ws);

    ws.on('close', function() {
      remove_client(id);
    });
    ws.on('message', function(message) {
      var msg = JSON.parse(message);
      util.handle(handlers, msg, function(msg) {
        console.log('no handler for: ', msg);
      });
    });
  });
}

start_server(2222);
