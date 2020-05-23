const getDb = require("../utils/database").getDb;
const spotifyApi = require("../singletons/spotify-api").getApi();

/**
 * Function that runs after the usser is redirected to the auth url.
 */
exports.getAccessToken = (req, res) => {
  spotifyApi.api.authorizationCodeGrant(req.query.code).then(
    function (data) {
      console.log("The token expires in " + data.body["expires_in"]);
      console.log("The access token is " + data.body["access_token"]);
      console.log("The refresh token is " + data.body["refresh_token"]);

      // Set the access token on the API object to use it in later calls
      spotifyApi.api.setAccessToken(data.body["access_token"]);
      spotifyApi.api.setRefreshToken(data.body["refresh_token"]);

      spotifyApi.api.refreshAccessToken().then(
        function (data) {
          console.log("The access token has been refreshed!");

          // Save the access token so that it's used in future calls
          spotifyApi.api.setAccessToken(data.body["access_token"]);
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

/**
 * Refresh the spotify api access token
 */
exports.refreshToken = (req, res) => {
  spotifyApi.api
    .refreshAccessToken()
    .then((data) => {
      spotifyApi.api.setAccessToken(data.body["access_token"]);
      return res.redirect("/spotify/master");
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/spotify/master");
    });
};

/**
 * Register a guest user.
 * @param {string} req.body.guestname the name of the new guest
 * @returns redirect to "/navigation/guests" if no error occurs
 */
exports.registerUser = (req, res) => {
  try {
    req.session.user = req.body["guest-name"];
    req.session.type = "guest";
    return res.redirect("/navigation/guests");
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Erro ao tentar registrar-se na sala." });
  }
};

/**
 * @param {string} req.body.hostPassword the host password (in settings)
 * @param {string} req.body.name the host name
 * @returns {string} returns the authorizeurl from spotify
 */
exports.registerHost = (req, res) => {
  try {
    if (req.body.hostPassword == process.env.HOST_PASSWORD) {
      var authorizeURL = spotifyApi.api.createAuthorizeURL(
        spotifyApi.scopes,
        spotifyApi.state
      );
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
};

/**
 * Verify if the user exists.
 * @param {string} type the req type
 * @param {string} name the req name
 * @example req.body.user -> userExist("body", "user");
 * @returns next() if the user dont exist, res.status(500) if exist.
 */
exports.userExist = (type, name) => {
  return (req, res, next) => {
    const db = getDb();
    db.collection(process.env.SESSIONS_DB_NAME)
      .find({ "session.user": req[type][name] })
      .project()
      .toArray()
      .then((user) => {
        if (user.length == 0) return next();
        else
          return res
            .status(500)
            .json({ message: "Já existe um usuário com esse nome na sala." });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ message: "Erro ao tentar se cadastrar na sala." });
      });
  };
};
