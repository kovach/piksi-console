var util = require('./util');

var WS = require('ws');

var ws_obj = function(ws) {
  this.ws = ws;
}
ws_obj.prototype.on = function(tag, handler) {
  var ws = this;
  switch (tag) {
    case 'open':
      ws.ws.onopen = handler;
      break;
    case 'message':
      // message is a WS object with metadata
      ws.ws.onmessage = function(message) {
        var msg = JSON.parse(message.data);
        util.handle(handler, msg, function(msg) {
          console.log('no handler for: ', msg);
        });
      }
      break;
  }
}

ws_obj.prototype.send = function(msg) {
  this.ws.send(JSON.stringify(msg));
}

var open = function(domain, port) {
  var ws = new WS('ws://' + document.domain + ':' + port + '/');
  return new ws_obj(ws);
}

module.exports = {
  open: open,
}
