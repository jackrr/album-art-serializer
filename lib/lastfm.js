const request = require('request');
const {
  currentTrackCheckInterval,
  lastfmApiKey,
  userID
} = require('../config')
const recentTracksUrl = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${userID}&api_key=${lastfmApiKey}&format=json`

let currentTrack = null

const getId = function(track) {
  return track.name
}

const setCurrentTrack = function(track) {
  currentTrack = getId(track)
}

const isNewTrack = function(track) {
  if (!currentTrack) return true
  return currentTrack != getId(track)
}

const handleRequest = function(url) {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      if (error || response.statusCode != 200) {
        return reject(error || new Error("Failed to get image from host"))
      }
      resolve(JSON.parse(body))
    })
  })
}

const parseTrack = function(track) {
  const images = track.image
  return {
    albumUrl: images[images.length-1]['#text'],
    name: track.name,
    album: track.album['#text'],
    artist: track.artist['#text']
  }
}

const checkSongChange = function(onChange) {
  handleRequest(recentTracksUrl)
  .catch(onChange)
  .then((body) => {
    let tracks = body.recenttracks.track
    if (tracks && tracks.length > 0) {
      let track = tracks[0]
      if (isNewTrack(track)) {
        setCurrentTrack(track)
        onChange(null, parseTrack(track))
      }
    }
  })
}

exports.onSongChange = function(cb){
  checkSongChange(cb)
  setInterval(function(){
    checkSongChange(cb)
  }, currentTrackCheckInterval)
}
