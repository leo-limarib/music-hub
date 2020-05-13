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
          //(\'' + $valuationId + '\',\'' + $user + '\')
          `<div class="container-fluid" onclick="selectTrack('${track.name.replace(
            "'",
            ""
          )}', '${track.uri}', '${
            track.duration_ms
          }')"><div class="row"><div class="col-6"><img src="${
            track.album.images[1].url
          }"></div><div class="col-6" style="font-size: 46px;">Nome: ${
            track.name
          } <br>Artista: ${track.artists[0].name}</div></div><hr></div>`
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
