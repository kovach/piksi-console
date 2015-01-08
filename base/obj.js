var _ = require('underscore');
var doWhile = _.find;
var done = true;

// Each value in handlers is a list of event handlers
// key is the message tag it handles
var obj = function() {
  var obj = this;
  obj.handlers = {};
  obj.default = [];
}

obj.prototype.add = function(handlers) {
  var obj = this;
  _.each(handlers, function(val, key) {
    if (!obj.handlers[key])
      obj.handlers[key] = [];
    obj.handlers[key].push(val);
  });
}
obj.prototype.add_default = function(handler) {
  var obj = this;
  obj.default.push(handler);
}
obj.prototype.chain = function(tag, dep) {
  var obj = this;
  var h = {};
  h[tag] = function(msg) {
    dep.handle(msg);
  }
  obj.add(h);
}

obj.prototype.handle = function(msg) {
  var obj = this;
  var handler = obj.handlers[msg.tag];
  if (handler) {
    handler.forEach(function(fn) {
      fn(msg);
    });
  } else {
    // Attempt polymorphic handler
    obj.default.forEach(function(fn) {
      fn(msg);
    });
  }
}

module.exports = obj;
