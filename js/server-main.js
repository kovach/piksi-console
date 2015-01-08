var startServer = require('../base/server');

var server = startServer(2222);
server.add({
  // {ws, id}
  'connection': function(msg) {
    // connection hook...
    // console.log('connection: ', msg.id);
  },
});
