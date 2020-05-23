const spotifyApi = require("../singletons/spotify-api").getApi();

/**
 * Get a the artist albums list
 * @param {string} req.params.artistId the artist spotify id
 * @returns a array with the albums objects
 */
exports.getArtistAlbums = (req, res) => {
  spotifyApi.api
    .getArtistAlbums(req.params.artistId)
    .then((albums) => {
      return res.send(albums);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        message: "Erro ao tentar retornar lista de álbuns do artista.",
      });
    });
};

/**
 * Search a track by name (limit = 10)
 * @param {string} trackName The track name.
 * @example 192.168.0.105:8080/spotify/track/search/mirror
 * @returns {Object} Returns a json with a message (error or sucess).
 */
exports.searchTracks = (req, res) => {
  spotifyApi.api
    .searchTracks(req.params.trackName, { limit: 10 })
    .then((tracks) => {
      return res.send(tracks);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Erro ao pesquisar música." });
    });
};
