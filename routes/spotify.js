const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const hostPassword = process.env.HOST_PASSWORD;

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

router.post("/guests/register", (req, res) => {
  try {
    req.session.user = req.body["guest-name"];
    req.session.type = "guest";
    return res.render("spotify-guests", { layout: false });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Erro ao tentar registrar-se na sala." });
  }
});

/**
 * Protection to the host page, password saved on .env file
 * req.body.hostPassword
 * req.body.hostName
 */
router.post("/host", (req, res, next) => {
  try {
    if (req.body.hostPassword == hostPassword) {
      var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
      req.session.user = req.body.hostName;
      req.session.type = "host";
      return res.json({ url: authorizeURL });
    } else {
      return res.status(401).json({ message: "Senha de host inválida." });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Erro ao tentar autorizar aplicativo.",
    });
  }
});

router.get("/master", (req, res) => {
  if (req.session.user != undefined && req.session.type == "host") {
    if (process.env.HOST != "null") {
      return res.render("spotify-master", { layout: false });
    } else {
      var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
      return res.redirect(authorizeURL);
    }
  } else {
    return res.render("register-guest", { layout: false });
  }
});

router.get("/host", (req, res) => {
  if (process.env.HOST == "null") {
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    return res.redirect(authorizeURL);
  } else {
    if (req.session.user != undefined) {
      if (req.session.type == "host")
        return res.render("spotify-master", { layout: false });
      else return res.render("spotify-guests", { layout: false });
    } else {
      return res.render("register-guest", { layout: false });
    }
  }
});

/**
 * Get the musichub api acess token using the code returned by the spotify api.
 */
router.get("/getacesstoken", (req, res, next) => {
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
});

/**
 * Get the artist albums
 * @param {string} artistId target artist id
 * @example 192.168.0.105:8080/spotify/artist/albums/f54hg64fg1s65adf
 */
router.get("/artist/albums/:artistId", (req, res, next) => {
  spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then((albums) => {
      return res.send(albums);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/devices/select", (req, res) => {
  if (process.env.HOST == "null") {
    return res.render("host-spotify", { layout: false });
  } else {
    return res.render("select-device", { layout: false });
  }
});

/**
 * Set the device where the music will be played.
 * @param {string} deviceId The target device id
 * @example 192.168.0.105:8080/setdevice/s65ad1sad1s65ad1
 * @returns {Object} returns a json with a sucess message.
 */
router.post("/devices/:deviceId", (req, res, next) => {
  if (req.session.user != undefined && req.session.type == "host") {
    process.env.DEVICE = req.params.deviceId;
    return res.json({ message: "Dispositivo selecionado com sucesso." });
  } else {
    return res
      .status(401)
      .json({ message: "Você não tem permissão para realizar essa tarefa." });
  }
});

/**
 * Get the list of available devices with the user account
 * @example 192.168.0.105:8080/spotify/getmydevices
 * @returns {Object} Returns a json with the devices list.
 */
router.get("/devices", (req, res, next) => {
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
});

/**
 * Starts or Resumes the Current User's Playback
 * @param {string} deviceId The id of the target device.
 * @example 192.168.0.105:8080/spotify/player/play/aesadasdWSADwa
 * @returns {Object} Returns a json with the error or sucess message.
 */
router.post("/player/play/:deviceId", (req, res, next) => {
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
});

/**
 * Search a track by name (limit = 10)
 * @param {string} trackName The track name.
 * @example 192.168.0.105:8080/spotify/track/search/mirror
 * @returns {Object} Returns a json with a message (error or sucess).
 */
router.get("/tracks/search/:trackName", (req, res) => {
  spotifyApi
    .searchTracks(req.params.trackName, { limit: 10 })
    .then((tracks) => {
      return res.send(tracks);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Erro ao pesquisar música." });
    });
});

/**
 * Add a song to the user queue.
 * @param {string} songUri The spotify uri to the track.
 * @example 192.168.0.105:8080/queue/add-to-queue/a61s5d1s6af1sad1
 * @returns {Object} Returns a json with a message (error or sucess).
 */
router.post("/queue/add-to-queue/:songUri", (req, res) => {
  if (req.session.user != undefined) {
    if ((req.session.type = "host" && process.env.STATUS == "off")) {
      spotifyApi
        .addSongToQueue(req.params.songUri, process.env.DEVICE)
        .then(() => {
          spotifyApi
            .skipToNext()
            .then(() => {
              process.env.status = "on";
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
      spotifyApi
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
});

/* 
router.post("/start/:songUri", (req, res) => {
  if (req.session.user != undefined && req.session.type == "host") {
    spotifyApi
      .addSongToQueue(req.params.songUri, process.env.DEVICE)
      .then(() => {
        spotifyApi
          .skipToNext()
          .then(() => {
            process.env.status = "on";
            return res.json({ message: "Servidor inicializado com sucesso." });
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
    return res.status(400).json({
      message: "Você não é o host.",
    });
  }
});
*/

module.exports = router;
