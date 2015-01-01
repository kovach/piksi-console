var _ = require('underscore');
var wsm = require('./ws-obj');

// Global state
var ws;

var handlers = {
  'id': function(data) {
    console.log('id: ', data.id)
  }
}

var init = function(port) {
  ws = wsm.open(document.domain, port);
  ws.on('open', function() {
    console.log('ws open!');
    ws.send({tag: 'get-id'});
  });
  ws.on('message', handlers);
  return ws;
}

module.exports = {
  init: init,
}
