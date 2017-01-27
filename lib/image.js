const fs = require('fs')
const request = require('request')
const lwip = require('lwip')

const config = require('../config')
const { rgbToHsv } = require('./color')

const imagePath = './tmp_image'

const downloadImage = function(url, destination) {
  return new Promise((resolve, reject) => {
    request(url).pipe(fs.createWriteStream(destination))
    .on('error', function(err){
      reject(err)
    })
    .on('finish', function(){
      resolve(destination)
    })
  })
}

const openImage = function(filePath, imageFormat) {
  return new Promise((resolve, reject) => {
    lwip.open(filePath, imageFormat, function(err, image) {
      if (err) return reject(err)
      resolve(image)
    })
  })
}

const resizeImage = function(image) {
  return new Promise((resolve, reject) => {
    image.resize(config.outputResolution.width, function(err, image) {
      if (err) return reject(err)
      resolve(image)
    })
  })
}

const imageAsGrid = function(image) {
  let grid = [];
  for (let x = 0; x < config.outputResolution.width; x++) {
    grid[x] = [];

    for (let y = 0; y < config.outputResolution.height; y++) {
      let pixel = image.getPixel(x, y);
      grid[x][y] = rgbToHsv(pixel.r, pixel.g, pixel.b);
    }
  }

  return Promise.resolve(grid)
};

exports.getPixelGrid = function(url){
  const imageFormat = url.slice(-3)
  const localFilePath = `${imagePath}.${imageFormat}`

  return downloadImage(url, localFilePath)
  .then(() => {
    return openImage(localFilePath, imageFormat)
    .then(resizeImage)
    .then(imageAsGrid)
  })
}
