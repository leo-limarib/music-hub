const express = require("express");
const router = express.Router();
require("dotenv").config();
const hostPassword = process.env.HOST_PASSWORD;
const usersController = require("../controllers/users");
const spotifyController = require("../controllers/spotify");
const authController = require("../controllers/authentication");
const spotifyApi = require("../singletons/spotify-api").getApi();

class Spotify {
  constructor(io) {
    spotifyController.setIo(io);
    this.router = router;

    router.post(
      "/guests/register",
      usersController.userExist("body", "guest-name"),
      usersController.registerUser
    );

    router.post("/host", usersController.registerUser);

    router.get(
      "/master",
      authController.authLogged,
      authController.authHost,
      (req, res) => {
        if (process.env.HOST != "null") {
          return res.render("spotify-master", {
            layout: false,
            user: req.session.user,
            ip: process.env.IP,
            port: process.env.PORT,
          });
        } else {
          var authorizeURL = spotifyApi.api.createAuthorizeURL(
            spotifyApi.scopes,
            spotifyApi.state
          );
          return res.redirect(authorizeURL);
        }
      }
    );

    router.get("/host", (req, res) => {
      if (process.env.HOST == "null") {
        if (req.session.user != undefined && req.session.type == "host") {
          var authorizeURL = spotifyApi.api.createAuthorizeURL(
            spotifyApi.scopes,
            spotifyApi.state
          );
          return res.redirect(authorizeURL);
        } else return res.render("host-spotify", { layout: false });
      } else {
        if (req.session.user != undefined) {
          if (req.session.type == "host")
            return res.redirect("/spotify/master");
          else return res.redirect("/navigation/guests");
        } else {
          return res.render("register-guest", { layout: false });
        }
      }
    });

    /**
     * Get the musichub api acess token using the code returned by the spotify api.
     */
    router.get(
      "/getacesstoken",
      authController.authLogged,
      authController.authHost,
      usersController.getAccessToken
    );

    /**
     * Get the artist albums
     * @param {string} artistId target artist id
     * @example 192.168.0.105:8080/spotify/artist/albums/f54hg64fg1s65adf
     */
    router.get(
      "/artist/albums/:artistId",
      authController.authLogged,
      spotifyController.getArtistAlbums
    );

    /**
     * List all the devices available in the host account.
     */
    router.get(
      "/devices/select",
      authController.authLogged,
      authController.authHost,
      (req, res) => {
        if (process.env.HOST == "null") {
          return res.render("host-spotify", { layout: false });
        } else {
          return res.render("select-device", { layout: false });
        }
      }
    );

    router.post(
      "/devices/:deviceId",
      authController.authLogged,
      authController.authHost,
      spotifyController.setDevice
    );

    router.get(
      "/devices",
      authController.authLogged,
      authController.authHost,
      spotifyController.getAvailableDevices
    );

    router.get(
      "/tracks/search/:trackName",
      authController.authLogged,
      spotifyController.searchTracks
    );

    router.post(
      "/queue/add-to-queue",
      authController.authLogged,
      spotifyController.addTrackToQueue
    );

    router.post(
      "/queue/remove-from-queue",
      authController.authLogged,
      authController.authHost,
      spotifyController.removeTrackFromQueue
    );

    router.get(
      "/refreshtoken",
      authController.authLogged,
      authController.authHost,
      usersController.refreshToken
    );

    router.put(
      "/skipsong",
      authController.authLogged,
      authController.authHost,
      spotifyController.skipSong
    );

    router.put(
      "/resetserver",
      authController.authLogged,
      authController.authHost,
      spotifyController.resetServer
    );
  }
}

module.exports = Spotify;
