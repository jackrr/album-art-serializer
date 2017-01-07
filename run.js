var lastfm = require('./lib/lastfm');
var image = require('./lib/image');
var config = require('./config');
var serial = require('./lib/serial');

var userID = config.userID
var artworkFolder = config.artworkPath


var nextSong = function(err, song){
  if (err) {
    return console.log("error getting current song:", err)
  }

  console.log('Track:', song.name, '\nAlbum: ', song.album, '\nArtist:', song.artist);

  if (!song.albumUrl || !song.albumUrl.length) {
    return console.log("no albumUrl given for song", song.name)
  }

  var url = song.albumUrl
  var fname = Date.now().toString()+'.'+url[url.length-3] + url[url.length-2] + url[url.length-1]

  var albumPath = artworkFolder + fname
  image.getPixelGrid(song.albumUrl, function(err, grid){
    if (err) {
      console.log(err)
    } else {
      serial.sendImage(grid);
    }
  }, {tile: true})
}

lastfm.onSongChange(userID, nextSong)
