function selectTrack(trackName, trackUri, trackDuration) {
  $.ajax({
    type: "POST",
    url:
      window.location.origin +
      `/spotify/queue/add-to-queue/${trackName}/${trackUri}/${trackDuration}`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      alert(data.message);
    },
    error: (err) => {
      console.log(err);
    },
  });
}

function getMusicsByName(musicName) {
  $.ajax({
    type: "GET",
    url: window.location.origin + `/spotify/tracks/search/${musicName}`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      $("#tracks").empty();
      data.body.tracks.items.forEach((track) => {
        console.log(track);
        $("#tracks").append(
          `<div style="margin: 1rem;" onclick="selectTrack('${track.name}', '${track.uri}', '${track.duration_ms}')"><img src="${track.album.images[2].url}"> <br>Nome: ${track.name} <br>Artista: ${track.artists[0].name}<hr></div>`
        );
      });
    },
    error: (err) => {
      console.log(err);
    },
  });
}

$(document).ready(() => {
  $("#music-name").on("change", () => {
    getMusicsByName($("#music-name").val());
  });
});
