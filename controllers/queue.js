var spotify = require("./spotify");
var queue = [];
var SIZE = 50;

/**
 * Removes the music in the first place (called when the song is done playing)
 */
removeFirstPlace = () => {
  queue.shift();
  if (queue.length > 0) {
    console.log(`Next song: ${queue[0].name}`);
    play();
  } else {
    var api = spotify.getApi();
    process.env.STATUS = "off";
    api.pause({ device_id: process.env.DEVICE });
  }
};

play = () => {
  setTimeout(removeFirstPlace, queue[0].duration);
};

songInQueue = (songName) => {};

/**
 * Add a song to the play queue.
 * @param {string} user The user name
 * @param {string} musicName the spotify music name
 * @param {string} musicUri the spotify music uri
 * @param {number} musicDuration the spotify music duration in ms
 * @example add({uri: "adsuahd1j901ce09", duration: 240000})
 * @returns {Promise} returns a promise
 */
exports.add = (user, musicName, musicUri, musicDuration) => {
  if (queue.length <= SIZE) {
    queue.push({
      user: user,
      name: musicName,
      uri: musicUri,
      duration: musicDuration,
    });
    if (queue.length == 1) {
      play();
    }
  }
};
