function deleteSong(songUri) {
  $.ajax({
    type: "POST",
    url: window.location.origin + `/spotify/queue/remove-from-queue`,
    contentType: "application/json",
    data: JSON.stringify({
      songUri: songUri,
    }),
    dataType: "json",
    success: (data) => {
      alert(data.message);
    },
    error: (err) => {
      alert(err.responseJSON.message);
    },
  });
}

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
      alert(err.responseJSON.message);
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
          `<div class="container-fluid"><div class="row"><div class="col-4"><img src="${
            track.album.images[1].url
          }"></div><div class="col-6" style="font-size: 40px; text-align: left;">${
            track.name
          } <br>${
            track.artists[0].name
          }</div><div class="col-2"><button class="queue-button" onclick="selectTrack('${track.name.replace(
            /[&\/\\#,+()$~%.'":*?<>{}]/g,
            ""
          )}', '${track.uri}', '${track.duration_ms}', '${
            track.album.images[1].url
          }', '${track.artists[0].name.replace(
            /[&\/\\#,+()$~%.'":*?<>{}]/g,
            ""
          )}')"><i class="far fa-share-square"></i></button></div></div><hr></div>`
        );
      });
    },
    error: (err) => {
      console.log(err);
    },
  });
}

function getInviteUrl() {
  $("#guests-url").text(window.location.origin + `/navigation/guests`);
}

//fa-cogs
//fa-search
//fa-home
function focusIcon(focus, notfocus) {
  notfocus.forEach((nf) => {
    nf.css("color", "#EFECEC");
  });
  focus.css("color", "#43E4FF");
}

function showConfiguration() {
  $("#main-body").empty();
  $("#main-body").append(`
  <p style="font-size: 52px; color: white; margin: 0; margin-left: 1rem;">Link para convidados:</p>
  <p id="guests-url" style="font-size: 40px; color: white; margin: 0; margin-left: 1rem;"></p>
  <a style="font-size: 40px; color: white;" href="${
    window.location.origin + "/spotify/refreshtoken"
  }">Atualizar token de acesso.</a>`);
  getInviteUrl();
  focusIcon($(".fa-cogs"), [$(".fa-search"), $(".fa-home")]);
}

function skipSong() {
  $.ajax({
    type: "PUT",
    url: window.location.origin + `/spotify/skipsong`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      console.log(data.message);
    },
  });
}

function showHome() {
  focusIcon($(".fa-home"), [$(".fa-search"), $(".fa-cogs")]);
  $("#main-body").empty();
  $("#main-body").append(`<div class="row">
    <div class="col-12 main" style="margin: 0 auto; background-color: gray;">
    <h2 style="font-size: 46px; margin: 1rem;">Tocando agora:</h2>
        <div class="container-fluid">
            <div class="row" style="padding: 2rem;">
                <div class="col-5" id="now-cover">
                </div>
                <div class="col-5" style="padding: 0; text-align: left;">
                    <h2 id="now-playing" style="font-size: 48px; margin: 0;"></h2>
                    <h2 id="now-artist" style="font-size: 48px; margin: 0;"></h2>
                    <h2 id="now-user" style="font-size: 48px; margin: 0; color: #43E4FF;"></h2>
                </div>
                <div>
                    <button onclick="skipSong()" class="skip-button"><i class="fas fa-forward"></i></button>
                </div>
            </div>
        </div>
    </div>
</div><div class="row"><div class="col-12" style="margin-top: 4rem; color: white; text-align: center;"><h1 style="margin-top: 4rem; margin-bottom: 1rem; color: white;">Fila:</h1>
<div id="queue"></div></div></div>`);

  const socket = io(window.location.origin); // conectando no servidor do socketio

  socket.on("playing", (data) => {
    $("#now-playing").text(`${data.queue[0].name}`);
    $("#now-artist").text(`${data.queue[0].artist}`);
    $("#now-user").text(`${data.queue[0].user}`);
    $("#now-cover").empty();
    $("#now-cover").append(`<img src="${data.queue[0].coverUrl}">`);
    data.queue.shift();
    $("#queue").empty();
    data.queue.forEach((m) => {
      if (m.status == "ok") {
        $("#queue").append(
          `<div style="border-bottom: 2px solid gray; border-top: 2px solid gray;">
              <div class="containuer-fluid" style="padding-top: 0.5rem; padding-bottom: 0.5rem;">
                  <div class="row" style="padding: 0;">
                      <div class="col-4" style="width: 70%; height: 70%; margin: 0;">
                          <img src="${m.coverUrl}" style="width: 75%; height: 75%; margin: 0;">
                      </div>
                      <div class="col-6" style="width: 80%; height: 80%; margin: 0; text-align: left;">
                          <p style="font-size: 44px; margin: 0;">${m.name}</p>
                          <p style="font-size: 44px; margin: 0;">${m.artist}</p>
                          <p style="font-size: 44px; margin: 0; color: #43E4FF;">${m.user}</p>
                      </div>
                      <div class="col-2">
                          <button class="queue-button" onclick="deleteSong('${m.uri}')"><i class="fas fa-trash"></i></button>
                      </div>
                  </div>
              </div>
          <div>`
        );
      }
    });
  });
}

function showSearch() {
  focusIcon($(".fa-search"), [$(".fa-home"), $(".fa-cogs")]);
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

$(document).ready(() => {
  $("#music-name").on("change", () => {
    getMusicsByName($("#music-name").val());
  });
});
