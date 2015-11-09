var _ = require('underscore');
var repl = require('repl');

var binary = require('binary');
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort
var libsbp = require('libsbp');
var dispatcher = libsbp.dispatch;

var obj = require('./base/obj');

var mkConnection = function(serial) {
  var piksiObj = new obj();

  var piksi = new SerialPort(serial, {
    //baudrate: 115200 // serial or uart
    baudrate: 1000000 // USB
  });

  piksi.on('open', function() {
    console.log('serial port open!');
    piksiObj.handle({tag: 'open'});

    dispatcher(piksi, function (err, framedMessage) {
      // MSG_POS_LLH
      if (0x0201 === framedMessage.sbp.msg_type) {
        piksiObj.handle({
          tag: 'pos_llh',
          point: { lat: framedMessage.fields.lat, lng: framedMessage.fields.lon }, // east/north
          numSats: framedMessage.fields.n_sats,
          fixedMode: framedMessage.fields.flags & 1
        });
      }
    });
  });

  return piksiObj;
}

module.exports = mkConnection
