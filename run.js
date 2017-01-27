const { onSongChange } = require('./lib/lastfm')
const { getPixelGrid } = require('./lib/image')
const { sendImage } = require('./lib/serial')

const nextSong = function(err, song) {
  if (err) {
    return console.log("Error getting current song:", err)
  }

  console.log(`Track: ${song.name}\nAlbum: ${song.album}\nArtist:${song.artist}`)

  if (!song.albumUrl || !song.albumUrl.length) {
    return console.log('(No album url given)')
  }

  getPixelGrid(song.albumUrl)
    .then(sendImage)
    .catch((err) => {
      console.log("Failed to process image:", err)
    })
}

onSongChange(nextSong)
