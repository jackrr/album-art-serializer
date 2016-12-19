var request = require('request');
var config = require('../config');

var checkInterval = config.currentTrackCheckInterval
var apiKey = config.lastfmApiKey

var baseUrls = {
  recentTracks: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks"
}

var userID

var handleRequest = function(url, cb){
  request(url, function(error, response, body) {
    if (error || response.statusCode != 200) {
      return cb(error || new Error("Failed to get image from host"))
    }
    cb(null, JSON.parse(body))
  })
}

var setUserID = function(id){
  userID = id
}

var recentTracksUrl = function(){
  return baseUrls.recentTracks + "&user="+userID+"&api_key="+apiKey+"&format=json"
}

var currentTrack = null

var getId = function(track){
  return track.name
}

var checkTrackChanged = function(track){
  if (!currentTrack) return true
  if (currentTrack == getId(track)) {
    return false
  }
  return true
}

var setCurrentTrack = function(track){
  currentTrack = getId(track)
}

var parseTrack = function(track){
  var images = track.image
  var url = images[images.length-1]['#text']
  var album = track.album['#text']
  var artist = track.artist['#text']
  return { albumUrl: url, name: track.name, album: album, artist: artist }
}

var checkSongChange = function(changeCB){
  handleRequest(recentTracksUrl(), function(err, body){
    if (err) return changeCB(err)
    var tracks = body.recenttracks.track
    if (tracks && tracks.length) {
      if (checkTrackChanged(tracks[0])) {
        setCurrentTrack(tracks[0])
        changeCB(null, parseTrack(tracks[0]))
      }
    }
  })
}

var onSongChange = function(userID, cb){
  setUserID(userID)
  checkSongChange(cb)
  setInterval(function(){
    checkSongChange(cb)
  }, checkInterval)
}

module.exports = {
  onSongChange: onSongChange
}
