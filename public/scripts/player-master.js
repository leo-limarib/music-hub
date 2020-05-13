function getInviteUrl() {
  $.ajax({
    type: "GET",
    url: window.location.origin + `/spotify/getinviteurl`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      $("#invite-url").text(
        window.location.origin + `/spotify/guests/${data.passport}`
      );
    },
    error: (err) => {
      console.log(err);
    },
  });
}

function selectTrack(trackUri) {
  $.ajax({
    type: "POST",
    url: window.location.origin + `/spotify/queue/add-to-queue/${trackUri}`,
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
          `<div style="margin: 1rem;" onclick="selectTrack('${track.uri}')"><img src="${track.album.images[2].url}"> <br>Nome: ${track.name} <br>Artista: ${track.artists[0].name}<hr></div>`
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
  getInviteUrl();
});
