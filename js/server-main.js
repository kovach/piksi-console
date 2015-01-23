var _ = require('underscore');
var startServer = require('../base/server');
var pc = require('../console');

var sockets = {};

var piksi = pc.init("/dev/tty.usbserial-00001014");

var server = startServer(2223);

// Forward messages to clients
piksi.add_default(function(msg) {
  _.each(sockets, function(out) {
    out.handle(msg);
  });
});
//piksi.add({
//  'pos': function(msg) {
//  },
//});

server.add({
  // {ws, id}
  'close': function(msg) {
    delete sockets[msg.id];
  },
  'connection': function(msg) {
    // Forward messages
    sockets[msg.id] = msg.output;
  },
});
