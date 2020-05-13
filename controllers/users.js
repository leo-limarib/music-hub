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
