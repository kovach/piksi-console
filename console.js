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
var resetParser = function(p) {
  p.header = [];
  p.state = WAITING;
  p.data = [];
  p.crc = [];
}

var word = function(b1, b2) {
  return b1 + 256 * b2;
}

var step = function(object, p, b) {
  switch (p.state) {
    case WAITING:
      if (b === MAGIC) {
        resetParser(p);
        p.state = HEADER;
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
      addMsg(object, p);
      break;
  }
}

var addMsg = function(object, parser) {
  var msg = {
    header: parser.vars,
    data: parser.data,
  };

  switch (msg.header.id) {
    case TAG.HEARTBEAT:
      var notokay = 1 &
        binary.parse(new Buffer(msg.data))
        .word32lu('flags')
        .vars.flags;
      object.handle({tag: 'heartbeat', error: notokay});
      break;
    case TAG.BASELINE_NED:
      var vars =
        binary.parse(new Buffer(msg.data))
        .skip(4)
        .word32ls('north')
        .word32ls('east')
        .word32ls('down')
        .skip(2)
        .skip(2)
        .word8ls('numSats')
        .word8ls('status')
        .vars;
      
      var point = {
        x: vars.east,
        y: vars.north,
      };
      var fixed_mode = vars.status & 1;

      object.handle({
        tag: 'baseline',
        point: point,
        numSats: vars.numSats,
        fixedMode: fixed_mode});
      break;
  }
}

var reader = function(object, parser) {
  var readData = function(data) {
    data.toJSON().forEach(function(b) {
      step(object, parser, b);
    });
  }

  return readData;
}

var mkConnection = function(serial) {
  var piksiObj = new obj();

  var piksi = new SerialPort(serial, {
    baudrate: 115200,
  });

  piksi.on('open', function() {
    console.log('serial port open!');
    parser = mkParser();
    piksi.on('data', reader(piksiObj, parser));
    piksiObj.handle({tag: 'open'});
  });

  return piksiObj;
}

module.exports = mkConnection
