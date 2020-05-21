const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");
const path = require("path");
const app = express();
const spotify = require("./routes/new-spotify");
const navigation = require("./routes/navigation");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoConnect = require("./utils/database").mongoConnect;
const socketio = require("socket.io");
const http = require("http");

//Sessions store
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/Musichub",
  collection: process.env.SESSIONS_DB_NAME,
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

//Socket
const server = http.createServer(app); // a biblioteca http entra exatamente aqui
io = socketio(server); // associando a instância do socketio com o seu servidor

//Routes
app.use("/spotify", new spotify(io).router);
app.use("/navigation", navigation);

app.use("/", (req, res) => {
  if (req.session.user != undefined) {
    if (req.session.type == "host") {
      if (process.env.DEVICE != "null") {
        return res.redirect("/spotify/master");
      } else {
        return res.redirect("/spotify/master");
      }
    } else {
      return res.redirect("/navigation/guests");
    }
  } else {
    return res.render("register-guest", { layout: false });
  }
});

mongoConnect(() => {
  server.listen(process.env.PORT, process.env.IP);
  console.log(`Server running on: ${process.env.IP}:${process.env.PORT}`);
});
