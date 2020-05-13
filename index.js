const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");
const path = require("path");
const app = express();
const spotify = require("./routes/spotify");
const navigation = require("./routes/navigation");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoConnect = require("./utils/database").mongoConnect;

//Sessions store
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/Musichub",
  collection: "sessions",
});

//Set the view engine to use handlebars
app.engine("handlebars", expressHbs());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "views"));

//Parse url parameters and jsons
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Sessions storage.
app.use(
  session({
    secret: "MusicHub@2020!Local",
    store: store,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
  })
);

//Static files (css, js)
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/spotify", spotify);
app.use("/navigation", navigation);

app.use("/", (req, res) => {
  if (req.session.user != undefined) {
    if (req.session.type == "host") {
      if (process.env.DEVICE != "null") {
        return res.render("spotify-master", { layout: false });
      } else {
        return res.redirect("/spotify/master");
      }
    } else {
      return res.render("spotify-guests", { layout: false });
    }
  } else {
    return res.render("register-guest", { layout: false });
  }
});

mongoConnect(() => {
  app.listen(8080, "192.168.0.105");
});
