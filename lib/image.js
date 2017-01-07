var request = require('request');
var fs = require('fs');
var lwip = require('lwip');
var config = require('../config');
var color = require('./color');
var imagePath = './tmp/image.';

var imageToGrid = function(image, cb) {
  image.resize(config.outputResolution.width, function(err, image) {
    if (err) return cb(err);
    var grid = [];
    for (var x = 0; x < config.outputResolution.width; x++) {
      grid[x] = [];

      for (var y = 0; y < config.outputResolution.height; y++) {
        var pixel = image.getPixel(x, y);
        grid[x][y] = color.rgbToHsv(pixel.r, pixel.g, pixel.b);
      }
    }

    cb(null, grid);

  });
};

exports.getPixelGrid = function(url, cb) {
  var imageType = 'jpg'
  if (!url.match(/\.jpg$/)) {
    imageType = url[url.length-3] + url[url.length-2] + url[url.length-1]
  }
  var path = imagePath + imageType;
  request(url).pipe(fs.createWriteStream(path))
  .on('error', function(err){
    cb(err);
  })
  .on('finish', function() {
    lwip.open(path, imageType, function(err, image) {
      if (err) return cb(err);
      imageToGrid(image, cb)
    });
  });
}
