var _ = require('underscore');

var doWhile = _.find;
var done = true;

var handle = function(handlers, msg, other) {
  var ok = doWhile(handlers, function(handler, key) {
    if (msg.tag === key) {
      handler(msg.data, msg);
      return done;
    }
  });
  if (ok === undefined && other) {
    other(msg);
  }
}

module.exports = {
  handle: handle,
  doWhile: doWhile,
  done: done,
}
