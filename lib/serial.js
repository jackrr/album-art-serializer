const SerialPort = require('serialport');
const config = require('../config');

var ardiunoComName = function(cb) {
  SerialPort.list(function(err, data) {
    if (err) return cb(err)
    var device;
    data.forEach(function(d) {
      if (d.manufacturer && d.manufacturer.match(/arduino/i)) {
        device = d;
      }
    });
    cb(null, device.comName)
  })
}

var serializePixel = function(x, y, pixel) {
  return ['<'+x, y, pixel.h, pixel.s, pixel.v].join(',');
}

const sendNextPixel = function(x, y, grid, port, first) {
  if (y >= grid[x].length) {
    if (x >= grid.length - 1) {
      console.log('end of image')
      return setTimeout(function() {
        port.close(function() {
          console.log('port closed')
        })
      }, 1000)
    }
    // go to next row
    x++;
    console.log('starting row ' + (x+1))
    return sendNextPixel(x, 0, grid, port)
  }

  let data = serializePixel(x, y, grid[x][y])
  port.write(data, function(err) {
    if (err) return console.log('failed to send ' + data, err)
    setTimeout(() => {
      sendNextPixel(x, y+1, grid, port)
    }, first ? 100 : 0)
  })
}

exports.sendImage = (pixelGrid) => {
  console.log("looking for devices")
  ardiunoComName(function(err, comName) {
    if (err) {
      return console.log("couldn't find arduino device", err)
    }
    let port = new SerialPort(comName, {
      baudRate: 115200
    })

    port.on('open', function() {
      console.log('opened connection to '+ comName)
      setTimeout(() => sendNextPixel(0, 0, pixelGrid, port, true), 500)
    })

    port.on('error', function(err) {
      console.log('Port Error: ', err.message)
    })
  });
}
