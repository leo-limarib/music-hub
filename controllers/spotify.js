const SpotifyWebApi = require("spotify-web-api-node");

var spotifyApi = new SpotifyWebApi({
  clientId: "b2a6860195204e8c89ea8cc1241b836d",
  clientSecret: "a84a59a1ecaf42a1aa805706139a943d",
  redirectUri: "http://localhost:8080",
});

exports.getArtistAlbum;
