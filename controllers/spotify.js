const SpotifyWebApi = require("spotify-web-api-node");
var queueController = require("./queue");

var spotifyApi = new SpotifyWebApi({
  clientId: "b2a6860195204e8c89ea8cc1241b836d",
  clientSecret: "a84a59a1ecaf42a1aa805706139a943d",
  redirectUri: "http://localhost:8080",
});

var scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
];
var state = "some-state-of-my-choice";
var spotifyApi = new SpotifyWebApi();
var spotifyApi = new SpotifyWebApi({
  clientId: "be2c978836a64f48abddd38756001b7b",
  clientSecret: "8b7daffe461d4709baca8031560ceae3",
  redirectUri: "http://192.168.0.105:8080/spotify/getacesstoken",
});

spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log("The access token is " + data.body["access_token"]);
    spotifyApi.setAccessToken(data.body["access_token"]);
  },
  function (err) {
    console.log("Something went wrong!", err);
  }
);

exports.getApi = () => {
  return spotifyApi;
};

exports.getScopes = () => {
  return scopes;
};

exports.getState = () => {
  return state;
};

exports.getAccessToken = (req, res) => {
  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function (data) {
      console.log("The token expires in " + data.body["expires_in"]);
      console.log("The access token is " + data.body["access_token"]);
      console.log("The refresh token is " + data.body["refresh_token"]);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);

      spotifyApi.refreshAccessToken().then(
        function (data) {
          console.log("The access token has been refreshed!");

          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function (err) {
          console.log("Could not refresh access token", err);
        }
      );

      process.env.HOST = "Unkown";
      return res.redirect("/spotify/devices/select");
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
};

exports.getArtistAlbums = (req, res) => {
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then((albums) => {
      return res.send(albums);
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Set the device where the music will be played.
 * @param {string} deviceId The target device id
 * @example 192.168.0.105:8080/setdevice/s65ad1sad1s65ad1
 * @returns {Object} returns a json with a sucess message.
 */
exports.setDevice = (req, res) => {
  if (req.session.user != undefined && req.session.type == "host") {
    process.env.DEVICE = req.params.deviceId;
    return res.json({ message: "Dispositivo selecionado com sucesso." });
  } else {
    return res
      .status(401)
      .json({ message: "Você não tem permissão para realizar essa tarefa." });
  }
};

/**
 * Get the list of available devices with the user account
 * @example 192.168.0.105:8080/spotify/getmydevices
 * @returns {Object} Returns a json with the devices list.
 */
exports.getAvailableDevices = (req, res) => {
  if (req.session.user != undefined && req.session.type == "host") {
    spotifyApi
      .getMyDevices()
      .then((devices) => {
        return res.send(devices);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return res
      .status(401)
      .json({ message: "Você não tem permissão para realizar essa tarefa." });
  }
};

/**
 * Starts or Resumes the Current User's Playback
 * @param {string} deviceId The id of the target device.
 * @example 192.168.0.105:8080/spotify/player/play/aesadasdWSADwa
 * @returns {Object} Returns a json with the error or sucess message.
 */
exports.play = (req, res) => {
  if (req.session.user != undefined && req.session.type == "host") {
    spotifyApi
      .play({ device_id: req.params.deviceId })
      .then(() => {
        return res.json({ message: "Playback status switched!" });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error while trying to switch playback status." });
      });
  } else {
    return res
      .status(401)
      .json({ message: "Você não tem permissão para realizar essa tarefa." });
  }
};

/**
 * Search a track by name (limit = 10)
 * @param {string} trackName The track name.
 * @example 192.168.0.105:8080/spotify/track/search/mirror
 * @returns {Object} Returns a json with a message (error or sucess).
 */
exports.searchTracks = (req, res) => {
  spotifyApi
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
 * @param {req.params.songUri} songUri The spotify uri to the track.
 * @param {req.params.songName} songName The song name
 * @param {req.params.durationMs} durationms The song duration in milliseconds
 * @example 192.168.0.105:8080/queue/add-to-queue/a61s5d1s6af1sad1
 * @returns {Object} Returns a json with a message (error or sucess).
 */
exports.addTrackToQueue = (req, res) => {
  if (req.session.user != undefined) {
    queueController.add(
      req.session.user,
      req.params.songName,
      req.params.songUri,
      req.params.durationMs
    );
    if (process.env.STATUS == "off") {
      return spotifyApi
        .addSongToQueue(req.params.songUri, process.env.DEVICE)
        .then(() => {
          spotifyApi
            .skipToNext()
            .then(() => {
              process.env.STATUS = "on";
              return res.json({
                message: "Servidor inicializado com sucesso.",
              });
            })
            .catch((err) => {
              console.log(err);
              return res
                .status(500)
                .json({ message: "Erro ao tentar iniciar sessão." });
            });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Erro ao tentar iniciar sessão." });
        });
    } else {
      return spotifyApi
        .addSongToQueue(req.params.songUri, process.env.DEVICE)
        .then(() => {
          return res.json({ message: "Música adicionada à fila com sucesso." });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Erro ao tentar adicionar música a fila." });
        });
    }
  } else {
    return res.status(401).json({ message: "Não autorizado." });
  }
};
