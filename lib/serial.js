const SerialPort = require('serialport');

const ardiunoComName = () => {
  return new Promise((resolve, reject) => {
    SerialPort.list(function(err, data) {
      if (err) return reject(err);

      device = data.find((d) => d.manufacturer && d.manufacturer.match(/arduino/i));
      resolve(device.comName);
    });
  });
};

const serializePixel = (x, y, pixel) => {
  console.log(`<${x},${y},${pixel.h},${pixel.s},${pixel.v}`)
  return `<${x},${y},${pixel.h},${pixel.s},${pixel.v}`;
};

const sendNextPixel = (x, y, grid, port) => {
  if (y >= grid[x].length) {
    if (x >= grid.length - 1) {
      // finished last row, so all are sent
      return;
    }
    // go to next row
    x++;
    return sendNextPixel(x, 0, grid, port);
  }

  port.write(serializePixel(x, y, grid[x][y]), (err) => {
    if (err) return console.log(`failed to send ${x},${y}`, err)
    console.log(`sent ${x},${y}`);
    sendNextPixel(x, y+1, grid, port);
  });
};

exports.sendImage = (pixelGrid) => {
  console.log("looking for devices")
  ardiunoComName().then((comName) => {
    let port = new SerialPort(comName, {
      baudRate: 9600
    });

    port.on('open', () => {
      console.log(`opened connection to ${comName}`);
      sendNextPixel(0, 0, pixelGrid, port);
    })
  }).catch((err) => {
    console.log("couldn't find arduino device", err)
  });
};
