var _ = require('underscore');
var wso = require('./ws-obj');
var WS = require('ws');

var init = function(port) {
  var ws = new WS('ws://' + document.domain + ':' + port + '/');
  // Receive messages from server
  var input = wso.wrap_input(ws);
  // Send stuff back
  var output = wso.wrap_output(ws);

  var handlers = {
    'id': function(data) {
      //console.log('id: ', data.id)
    },
    'open': function() {
      console.log('ws open!');
      output.handle({tag: 'get-id'});
    },
    'ping': function(msg) {
      output.handle({tag: 'pong', mark: msg.mark});
    },
  }

  input.add(handlers);
  input.add_default(function(msg) {
    //console.log('no handler: ', msg);
  });

  return {output: output, input: input};
}

module.exports = init;
