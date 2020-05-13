const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect("mongodb://localhost:27017/Musichub")
    .then((client) => {
      console.log("Connected!");
      _db = client.db("Musichub");
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database connection!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
