const express = require("express");
const router = express.Router();
require("dotenv").config();
const hostPassword = process.env.HOST_PASSWORD;
const usersController = require("../controllers/users");
const spotifyController = require("../controllers/spotify");

class Spotify {
  constructor(io) {
    spotifyController.setIo(io);
    this.router = router;

    router.post("/guests/register", usersController.registerUser);

    /**
     * Protection to the host page, password saved on .env file
     * req.body.hostPassword
     * req.body.hostName
     */
    router.post("/host", (req, res, next) => {
      try {
        if (req.body.hostPassword == hostPassword) {
          const api = spotifyController.getApi();
          const state = spotifyController.getState();
          const scopes = spotifyController.getScopes();
          var authorizeURL = api.createAuthorizeURL(scopes, state);
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
          var api = spotifyController.getApi();
          var state = spotifyController.getState();
          var scopes = spotifyController.getScopes();
          var authorizeURL = api.createAuthorizeURL(scopes, state);
          return res.redirect(authorizeURL);
        }
      } else {
        return res.render("register-guest", { layout: false });
      }
    });

    router.get("/host", (req, res) => {
      if (process.env.HOST == "null") {
        if (req.session.user != undefined && req.session.type == "host") {
          const api = spotifyController.getApi();
          const state = spotifyController.getState();
          const scopes = spotifyController.getScopes();
          var authorizeURL = api.createAuthorizeURL(scopes, state);
          return res.redirect(authorizeURL);
        } else return res.render("host-spotify", { layout: false });
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
    router.get("/getacesstoken", spotifyController.getAccessToken);

    /**
     * Get the artist albums
     * @param {string} artistId target artist id
     * @example 192.168.0.105:8080/spotify/artist/albums/f54hg64fg1s65adf
     */
    router.get("/artist/albums/:artistId", spotifyController.getArtistAlbums);

    /**
     * Renders the select device screen (only host)
     */
    router.get("/devices/select", (req, res) => {
      if (process.env.HOST == "null") {
        return res.render("host-spotify", { layout: false });
      } else {
        if (req.session.type == "host")
          return res.render("select-device", { layout: false });
        else return res.redirect("/");
      }
    });

    router.post("/devices/:deviceId", spotifyController.setDevice);

    router.get("/devices", spotifyController.getAvailableDevices);

    router.post("/player/play/:deviceId", spotifyController.play);

    router.get("/tracks/search/:trackName", spotifyController.searchTracks);

    router.post("/queue/add-to-queue", spotifyController.addTrackToQueue);
  }
}

module.exports = Spotify;
