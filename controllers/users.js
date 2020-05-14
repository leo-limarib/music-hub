const getDb = require("../utils/database").getDb;

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
