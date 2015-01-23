var _ = require('underscore');
var repl = require('repl');

var binary = require('binary');
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort

var obj = require('./base/obj');

var MAGIC = 0x55;
var TAG = {
  'POS_ECEF': 0x0200,
  'BASELINE_NED': 0x0203,
  'HEARTBEAT': 0xffff,
};

// Global state
// msg output
var msgs = [];
var parser;
var piksiObj;

var HEADER = 0;
var DATA = 1;
var CRC = 2;
var WAITING = 3;
var mkParser = function() {
  return {
    header: [],
    state: WAITING,
    data: [],
    crc: [],
  };
}

var word = function(b1, b2) {
  return b1 + 256 * b2;
}

var step = function(p, b) {
  switch (p.state) {
    case WAITING:
      if (b === MAGIC) {
        parser = mkParser();
        parser.state = HEADER;
      }
      break;
    case HEADER:
      var h = p.header;
      h.push(b);
      if (h.length === 5) {
        p.vars = {};
        p.vars.id = word(h[0], h[1]);
        p.vars.sender = word(h[2], h[3]);
        p.vars.length = h[4];
        p.state = DATA;
      }
      break;
    case DATA:
      p.data.push(b);
      if (p.data.length === p.vars.length)
        p.state = CRC;
      break;
    case CRC:
      p.crc.push(b);
      if (p.crc.length === 2) {
        p.vars.crc = word(p.crc[0], p.crc[1]);
        p.state = WAITING;
      }
      addMsg();
      break;
  }
}

var addMsg = function() {
  var msg = {
    header: parser.vars,
    data: parser.data,
  };

  // TODO logging?
  //msgs.push(msg);

  if (msgs.length % 100 === 0) {
    //console.log(msg.header.id.toString(16), msg.header.length);
  }

  switch (msg.header.id) {
    case TAG.BASELINE_NED:
      var vars =
        binary.parse(new Buffer(msg.data))
        .skip(4)
        .word32ls('north')
        .word32ls('east')
        .vars;
      
      var point = {
        x: vars.east,
        y: vars.north,
      };

      piksiObj.handle({tag: 'pos', point: point});
      break;
  }
}

var readData = function(data) {
  data.toJSON().forEach(function(b) {
    step(parser, b);
  });
}

var main = function(serial) {
  piksiObj = new obj();

  piksi = new SerialPort(serial, {
    baudrate: 115200,
  });

  piksi.on('open', function() {
    console.log('serial port open!');
    parser = mkParser();
    piksi.on('data', readData);
  });

  return piksiObj;
}

module.exports = {
  init: main,
}
