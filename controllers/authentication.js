exports.authLogged = (req, res, next) => {
  if (req.session.user != undefined) return next();
  else return res.status(401).json({ message: "Não autorizado." });
};

exports.authHost = (req, res, next) => {
  if (req.session.type == "host") return next();
  else return res.status(401).json({ message: "Não autorizado." });
};
