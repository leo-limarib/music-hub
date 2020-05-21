const SpotifyWebApi = require("spotify-web-api-node");
let api = null;
let scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-playback-state",
  "user-modify-playback-state",
];
let state = "some-state-of-my-choice";

module.exports = {
  /**
   * @returns {SpotifyWebApi} returns an object with the api access point.
   */
  getApi() {
    if (api != null) return { api: api, scopes: scopes, state: state };
    else {
      api = new SpotifyWebApi();
      api = new SpotifyWebApi({
        clientId: "be2c978836a64f48abddd38756001b7b",
        clientSecret: "8b7daffe461d4709baca8031560ceae3",
        redirectUri: `http://${process.env.IP}:${process.env.PORT}/spotify/getacesstoken`,
      });
      api.clientCredentialsGrant().then(
        function (data) {
          console.log("The access token is " + data.body["access_token"]);
          api.setAccessToken(data.body["access_token"]);
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
      return { api: api, scopes: scopes, state: state };
    }
  },
};
