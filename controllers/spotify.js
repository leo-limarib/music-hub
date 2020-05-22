const spotifyApi = require("../singletons/spotify-api").getApi();
var queueController = require("./queue");

exports.setIo = (io) => {
  queueController.setIo(io);
};

exports.playingNow = () => {
  return queueController.nowPlaying();
};

/**
 * Get a the artist albums list
 * @param {string} req.params.artistId the artist spotify id
 * @returns a array with the albums objects
 */
exports.getArtistAlbums = (req, res) => {
  spotifyApi.api
    .getArtistAlbums(req.params.artistId)
    .then((albums) => {
      return res.send(albums);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        message: "Erro ao tentar retornar lista de álbuns do artista.",
      });
    });
};

/**
 * Set the device where the music will be played.
 * @param {string} deviceId The target device id
 * @returns {Object} returns a json with a sucess message.
 */
exports.setDevice = (req, res) => {
  process.env.DEVICE = req.params.deviceId;
  return res.json({ message: "Dispositivo selecionado com sucesso." });
};

/**
 * Get the list of available devices with the user account
 * @example 192.168.0.105:8080/spotify/getmydevices
 * @returns {Object} Returns a json with the devices list.
 */
exports.getAvailableDevices = (req, res) => {
  spotifyApi.api
    .getMyDevices()
    .then((devices) => {
      return res.send(devices);
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Search a track by name (limit = 10)
 * @param {string} trackName The track name.
 * @example 192.168.0.105:8080/spotify/track/search/mirror
 * @returns {Object} Returns a json with a message (error or sucess).
 */
exports.searchTracks = (req, res) => {
  spotifyApi.api
    .searchTracks(req.params.trackName, { limit: 10 })
    .then((tracks) => {
      return res.send(tracks);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Erro ao pesquisar música." });
    });
};

/**
 * Add a song to the user queue.
 * @param {req.body.songUri} songUri The spotify uri to the track.
 * @param {req.body.songName} songName The song name
 * @param {req.body.durationMs} durationMs The song duration in milliseconds
 * @param {req.body.coverUrl} coverUrl
 * @example 192.168.0.105:8080/queue/add-to-queue/a61s5d1s6af1sad1
 * @returns {Object} Returns a json with a message (error or sucess).
 */
exports.addTrackToQueue = (req, res) => {
  //TESTING OUT
  queueController
    .add(
      req.session.user,
      req.body.songName,
      req.body.songUri,
      req.body.durationMs,
      req.body.coverUrl,
      req.body.artist
    )
    .then((msg) => {
      process.env.STATUS = "on";
      return res.json({ message: msg });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Erro ao tentar inicializar sessão." });
    });
};

/**
 * Sign a song as "deleted" on the queue.
 * @param {string} req.body.songUri the spotify uri for the song
 */
exports.removeTrackFromQueue = (req, res) => {
  queueController
    .removeSong(req.body.songUri)
    .then(() => {
      return res.json({ message: "Música removida da fila com sucesso." });
    })
    .catch(() => {
      return res
        .status(500)
        .json({ message: "Erro ao tentar remover música da fila." });
    });
};

exports.skipSong = (req, res) => {
  queueController.skipSkong();
  return res.json({ message: "Música pulada com sucesso." });
};

/**
 * Reset the server queue and device.
 */
exports.resetServer = (req, res) => {
  try {
    queueController.reset();
    return res.redirect("/spotify/master");
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Erro ao tentar reiniciar servidor." });
  }
};
