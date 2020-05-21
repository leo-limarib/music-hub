var queue = [];
var SIZE = 50;
var notifyio = null;
const spotifyApi = require("../singletons/spotify-api").getApi();

/**
 * Verify if the song is no the queue.
 * @param {string} song the name of the song
 * @returns {Promise} reject if the song is already on the queue, resolve if is not.
 */
songInQueue = (songUri) => {
  return new Promise((resolve, reject) => {
    resolve();
  });
};

/**
 * Removes the music in the first place (called when the song is done playing)
 */
removeFirstPlace = (songUri) => {
  if (queue.length > 0 && queue[0].uri == songUri) {
    spotifyApi.api.pause({ device_id: process.env.DEVICE }, () => {
      queue.shift();
      if (queue.length > 0) {
        if (queue[0].status == "ok") {
          play();
        } else {
          console.log(`PULANDO MÚSICA: ${queue[0].name}`);
          removeFirstPlace(queue[0].uri);
        }
      } else {
        process.env.STATUS = "off";
        notifyio.emit("playing", {
          queue: queue,
        });
      }
    });
  }
};

play = () => {
  notifyio.emit("playing", {
    queue: queue,
  });
  spotifyApi.api
    .play({ device_id: process.env.DEVICE, uris: [queue[0].uri] })
    .then(() => {
      setTimeout(removeFirstPlace, queue[0].duration, queue[0].uri);
    })
    .catch((err) => {
      console.log(err);
    });
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
exports.add = (user, name, songUri, duration, coverUrl, artist) => {
  return new Promise((resolve, reject) => {
    if (queue.length <= SIZE) {
      queue.push({
        user: user,
        name: name,
        uri: songUri,
        duration: duration - 500, //delay to sinchronize with player
        coverUrl: coverUrl,
        artist: artist,
        status: "ok",
      });
      notifyio.emit("playing", {
        queue: queue,
      });
      if (queue.length == 1) {
        play();
        resolve("Sessão inicializada com sucesso.");
      }
      resolve("Música adicionada a fila com sucesso.");
    } else {
      reject("A fila está no tamanho máximo.");
    }
  });
};

/**
 * Get the song in queue[0]
 * @returns {Object} {songName, user} or null.
 */
exports.nowPlaying = () => {
  if (queue.length > 0) {
    return { songName: queue[0].name, user: queue[0].user };
  } else {
    return null;
  }
};

/**
 * Set the io connection.
 * @param {Object} io the io connection object
 */
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

/**
 * Removes a song from the queue.
 * @param {String} songUri the spotify uri for the song
 * @returns {Promise} returns a promise, reject if the song was not found.
 */
exports.removeSong = (songUri) => {
  return new Promise((resolve, reject) => {
    queue.forEach((song) => {
      if (song.uri == songUri) {
        song.status = "deleted";
        notifyio.emit("playing", {
          queue: queue,
        });
        resolve();
      }
    });
    reject();
  });
};

/**
 * Skip the song (if theres a song playing)
 */
exports.skipSkong = () => {
  if (queue.length > 0) removeFirstPlace(queue[0].uri);
};

exports.reset = () => {
  queue = [];
  spotifyApi.api.pause({ device_id: process.env.DEVICE });
  notifyio.emit("playing", {
    queue: queue,
  });
};
