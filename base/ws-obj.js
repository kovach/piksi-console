var obj = require('./obj');

// Calls send on ws
var wrap_output = function(ws) {
  var o = new obj();

  o.default.push(function(msg) {
    ws.send(JSON.stringify(msg));
  });

  return o;
}

// Sets onmessage on ws
var wrap_input = function(ws) {
  var o = new obj();

  ws.onmessage = function(message) {
    var msg = JSON.parse(message.data);
    o.handle(msg);
  }

  ws.onopen = function() {
    o.handle({tag: 'open'});
  }

  return o;
}

module.exports = {
  wrap_input: wrap_input,
  wrap_output: wrap_output,
}
