const SerialPort = require('serialport');

const ardiunoComName = function() {
  return new Promise((resolve, reject) => {
    SerialPort.list(function(err, data) {
      if (err) return reject(err)

      let device = data.find((d) => d.manufacturer && d.manufacturer.match(/arduino/i))

      if (!device) return reject("No device found for serial port")
      resolve(device.comName)
    })
  })
}

const writeToPort = function(port, data) {
  return new Promise((resolve, reject) => {
    port.write(data, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

const serializePixel = function(x, y, pixel) {
  return `<${x},${y},${pixel.h},${pixel.s},${pixel.v}`
}

// Recursive function to sequentially
// 1. send a pixel
// 2. await successful write
// 3. sendNextPixel (if more to send)
const sendNextPixel = function(x, y, grid, port, first = false) {
  if (y >= grid[x].length) {
    // End of column

    if (x >= grid.length - 1) {
      // End of last column
      // Wait a sec for last bits to be read
      // on the other side
      return setTimeout(() => {
        port.close(() => {
          // Successful close
        })
      }, 1000)
    }

    // Advance to next column
    x++;
    return sendNextPixel(x, 0, grid, port)
  }

  let data = serializePixel(x, y, grid[x][y])

  writeToPort(port, data)
  .catch((err) => {
    console.log(`Failed to send ${data}:`, err)
  })
  .then(() => {
    setTimeout(() => {
      sendNextPixel(x, y+1, grid, port)
    }, first ? 100 : 0)
  })
}

exports.sendImage = (pixelGrid) => {
  console.log("Connecting to device...")
  return ardiunoComName()
  .then((comName) => {
    let port = new SerialPort(comName, {
      baudRate: 115200
    })

    port.on('open', () => {
      console.log(`Connected to ${comName}`)
      setTimeout(() => sendNextPixel(0, 0, pixelGrid, port, true), 500)
    })

    port.on('error', function(err) {
      console.log('SerialPort error:', err)
    })
  })
}
