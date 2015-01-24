var Plot = require('./plot');

// Global state
var last_hb;

var cc = 0;
var colors = ['blue', 'green', 'orange', 'red'];
var color = function() {
  return colors[cc++];
}

var plots = {};

var init = function(io) {
  last_hb = new Date().getTime();

  Plot.init();

  var handlers = {
    'baseline': function(msg) {
      var id = msg.piksi_id;
      if (plots[id] === undefined) {
        plots[id] = {
          fixed: new Plot.plot(color()),
          float: new Plot.plot(color()),
        };
      }
      if (msg.fixedMode) {
        plots[id].fixed.update(msg.point);
      } else {
        plots[id].float.update(msg.point);
      }
    },
    'heartbeat': function(msg) {
      var now = new Date().getTime();
      last_hb = now;
    }
  }
  console.log('HELLO');
  io.input.add(handlers);
}

// TODO animate heartbeat, other messages?
var animate = function() {
  var now = new Date().getTime();
  var delta = Math.pow(1/2, (now - last_hb) / 3000);
  window.requestAnimationFrame(animate);
}

module.exports = init;
