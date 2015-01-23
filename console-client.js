var plot = require('./plot');

// Global state
var last_hb;

var init = function(io) {
  last_hb = new Date().getTime();

  var handlers = {
    'baseline': function(msg) {
      plot.addPoint(msg.point);
    },
    'heartbeat': function(msg) {
      var now = new Date().getTime();
      last_hb = now;
    }
  }
  io.input.add(handlers);
}

// TODO animate heartbeat, other messages?
var animate = function() {
  var now = new Date().getTime();
  var delta = Math.pow(1/2, (now - last_hb) / 3000);
  window.requestAnimationFrame(animate);
}

module.exports = init;
