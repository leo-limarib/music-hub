const express = require("express");
const router = express.Router();

router.get("/guests", (req, res) => {
  if (req.session.user != undefined) {
    if (req.session.type == "guest") {
      return res.render("spotify-guests", {
        layout: false,
        ip: process.env.IP,
        port: process.env.PORT,
      });
    }
  } else {
    return res.render("register-guest", { layout: false });
  }
});

router.get("/guests/register", (req, res) => {
  if (req.session.user == undefined) {
    return res.render("register-guest", { layout: false });
  } else {
    return res.redirect("/navigation/guests");
  }
});

module.exports = router;
