var spotify = require("./spotify");
var queue = [];
var SIZE = 50;
var notifyio = null;

/**
 * Removes the music in the first place (called when the song is done playing)
 */
removeFirstPlace = () => {
  queue.shift();
  if (queue.length > 0) {
    play();
  } else {
    var api = spotify.getApi();
    process.env.STATUS = "off";
    api.pause({ device_id: process.env.DEVICE });
  }
};

play = () => {
  notifyio.emit("playing", {
    queue: queue,
  });
  setTimeout(removeFirstPlace, queue[0].duration);
};

/**
 * Add a song to the play queue.
 * @param {string} user The user name
 * @param {string} musicName the spotify music name
 * @param {string} musicUri the spotify music uri
 * @param {number} musicDuration the spotify music duration in ms
 * @example add({uri: "adsuahd1j901ce09", duration: 240000})
 * @returns {Promise} returns a promise
 */
exports.add = (user, musicName, musicUri, musicDuration, coverUrl, artist) => {
  if (queue.length <= SIZE) {
    queue.push({
      user: user,
      name: musicName,
      uri: musicUri,
      duration: musicDuration,
      coverUrl: coverUrl,
      artist: artist,
    });
    notifyio.emit("playing", {
      queue: queue,
    });
    if (queue.length == 1) {
      play();
    }
  }
};

exports.nowPlaying = () => {
  if (queue.length > 0) {
    return { songName: queue[0].name, user: queue[0].user };
  } else {
    return null;
  }
};

exports.setIo = (io) => {
  notifyio = io;

  notifyio.on("connect", (socket) => {
    if (queue.length > 0) {
      socket.emit("playing", {
        queue: queue,
      });
    }
  });

  console.log("io setted.");
};
