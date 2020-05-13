function selectTrack(trackName, trackUri, trackDuration, coverUrl, artist) {
  $.ajax({
    type: "POST",
    url: window.location.origin + `/spotify/queue/add-to-queue`,
    contentType: "application/json",
    data: JSON.stringify({
      songUri: trackUri,
      songName: trackName,
      durationMs: trackDuration,
      coverUrl: coverUrl,
      artist: artist,
    }),
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
            /[^a-zA-Z ]/g,
            ""
          )}', '${track.uri}', '${track.duration_ms}', '${
            track.album.images[1].url
          }', '${track.artists[0].name.replace(
            /[^a-zA-Z ]/g,
            ""
          )}')"><div class="row"><div class="col-6"><img src="${
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

function showSearch() {
  $("#main-body").empty();
  $("#main-body").append(`<div class="row">
    <div class="col-12 main" style="margin: 0 auto; background-color: gray; text-align: center;">
        <h3>Pesquisar música:</h3>
        <input type="text" placeholder="Nome da música" id="music-name">
        <div id="tracks">
        </div>
    </div>
</div>`);

  $("#music-name").on("change", () => {
    getMusicsByName($("#music-name").val());
  });
}

function showHome() {
  $("#main-body").empty();
  $("#main-body").append(`<div class="row">
    <div class="col-12 main" style="margin: 0 auto; background-color: gray;">
    <h2 style="font-size: 46px; margin: 1rem;">Tocando agora:</h2>
        <div class="container-fluid">
            <div class="row" style="padding: 2rem;">
                <div class="col-5" id="now-cover">
                </div>
                <div class="col-7" style="padding: 0; text-align: left;">
                    <h2 id="now-playing" style="font-size: 52px; margin: 0;"></h2>
                    <h2 id="now-artist" style="font-size: 52px; margin: 0;"></h2>
                    <h2 id="now-user" style="font-size: 52px; margin: 0; color: #43E4FF;"></h2>
                </div>
            </div>
        </div>
    </div>
</div><div class="row"><div class="col-12" style="margin-top: 4rem; color: white; text-align: center;"><h1 style="margin-top: 4rem; margin-bottom: 1rem; color: white;">Fila:</h1>
<div id="queue"></div></div></div>`);

  const socket = io("http://192.168.0.105:8080/"); // conectando no servidor do socketio

  socket.on("playing", (data) => {
    $("#now-playing").text(`${data.queue[0].name}`);
    $("#now-artist").text(`${data.queue[0].artist}`);
    $("#now-user").text(`${data.queue[0].user}`);
    $("#now-cover").empty();
    $("#now-cover").append(`<img src="${data.queue[0].coverUrl}">`);
    data.queue.shift();
    $("#queue").empty();
    data.queue.forEach((m) => {
      $("#queue").append(
        `<div style="border-bottom: 2px solid gray; border-top: 2px solid gray;">
            <div class="containuer-fluid" style="padding-top: 0.5rem; padding-bottom: 0.5rem;">
                <div class="row" style="padding: 0;">
                    <div class="col-5" style="width: 80%; height: 80%; margin: 0;">
                        <img src="${m.coverUrl}" style="width: 75%; height: 75%; margin: 0;">
                    </div>
                    <div class="col-7" style="width: 80%; height: 80%; margin: 0; text-align: left;">
                        <p style="font-size: 44px; margin: 0;">${m.name}</p>
                        <p style="font-size: 44px; margin: 0;">${m.artist}</p>
                        <p style="font-size: 44px; margin: 0; color: #43E4FF;">${m.user}</p>
                    </div>
                </div>
            </div>
        <div>`
      );
    });
  });
}

$(document).ready(() => {
  $("#music-name").on("change", () => {
    getMusicsByName($("#music-name").val());
  });
});
