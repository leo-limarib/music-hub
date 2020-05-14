var spotify = require("./spotify");
var queue = [];
var SIZE = 50;
var notifyio = null;

/**
 * Verify if the song is no the queue.
 * @param {string} song the name of the song
 * @returns {Promise} reject if the song is already on the queue, resolve if is not.
 */
songInQueue = (song) => {
  return new Promise((resolve, reject) => {
    queue.forEach((music) => {
      if (music.name == song) reject();
    });
    resolve();
  });
};

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
  return new Promise((resolve, reject) => {
    if (queue.length <= SIZE) {
      songInQueue(musicName)
        .then(() => {
          queue.push({
            user: user,
            name: musicName,
            uri: musicUri,
            duration: musicDuration,
            coverUrl: coverUrl,
            artist: artist,
            status: "ok",
          });
          notifyio.emit("playing", {
            queue: queue,
          });
          if (queue.length == 1) {
            play();
          }
          resolve();
        })
        .catch(() => {
          console.log("Essa música já está na fila.");
          reject();
        });
    } else {
      reject();
    }
  });
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
