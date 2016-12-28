const SerialPort = require('serialport');
const config = require('../config');

const ardiunoComName = () => {
  return new Promise((resolve, reject) => {
    SerialPort.list(function(err, data) {
      if (err) return reject(err)

      device = data.find((d) => d.manufacturer && d.manufacturer.match(/arduino/i))
      resolve(device.comName)
    })
  })
}

const serializePixel = (x, y, pixel) => {
  return `<${x},${y},${pixel.h},${pixel.s},${pixel.v}`
}

const sendNextPixel = (x, y, grid, port, first = false) => {
  if (y >= grid[x].length) {
    if (x >= grid.length - 1) {
      console.log('end of image')
      return setTimeout(() => {
        port.close(() => {
          console.log('port closed')
        })
      }, 1000)
    }
    // go to next row
    x++;
    console.log(`starting row ${x+1}`)
    return sendNextPixel(x, 0, grid, port)
  }

  let data = serializePixel(x, y, grid[x][y])
  port.write(data, (err) => {
    if (err) return console.log(`failed to send ${data}`, err)
    setTimeout(() => {
      sendNextPixel(x, y+1, grid, port)
    }, first ? 100 : 0)
  })
}

exports.sendImage = (pixelGrid) => {
  console.log("looking for devices")
  ardiunoComName().then((comName) => {
    let port = new SerialPort(comName, {
      baudRate: 115200
    })

    port.on('open', () => {
      console.log(`opened connection to ${comName}`)
      setTimeout(() => sendNextPixel(0, 0, pixelGrid, port, true), 500)
    })

    port.on('error', function(err) {
      console.log('Port Error: ', err.message)
    })

  }).catch((err) => {
    console.log("couldn't find arduino device", err)
  })
}
