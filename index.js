const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");
const path = require("path");
const app = express();
const spotify = require("./routes/spotify");

//Set the view engine to use handlebars
app.engine("handlebars", expressHbs());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "views"));

//Parse url parameters and jsons
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static files (css, js)
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/spotify", spotify);

app.use("/controller", (req, res) => {
  return res.render("controller", { layout: false });
});

app.use("/hostspotify", (req, res) => {
  console.log(req.cookies);
  if (process.env.HOST == "null") {
    return res.render("host-spotify", { layout: false });
  } else {
    return res.render("spotify", { layout: false });
  }
});

app.use("/selectdevice", (req, res) => {
  if (process.env.HOST == "null") {
    return res.render("host-spotify", { layout: false });
  } else {
    return res.render("select-device", { layout: false });
  }
});

app.listen(8080, "192.168.0.105");
