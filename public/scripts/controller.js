var muted = false;
var paused = false;

function changeVolume(volume) {
  const url = window.location + `volume/change`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: JSON.stringify({ newVolume: volume }),
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

function muteVolume() {
  $("#mute-sound-button").html(`<i class="fas fa-volume-mute"></i>`);
  muted = true;
  const url = window.location + `volume/mute`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

function unmuteVolume() {
  $("#mute-sound-button").html(`<i class="fas fa-volume-up"></i>`);
  muted = false;
  const url = window.location + `volume/unmute`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

function previousSong() {
  const url = window.location + `media/previoussong`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

function nextSong() {
  const url = window.location + `media/nextsong`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

function playPauseSong() {
  if (paused == false) {
    paused = true;
    $("#pause-song-button").html(`<i class="fas fa-play"></i>`);
  } else {
    paused = false;
    $("#pause-song-button").html(`<i class="fas fa-pause"></i>`);
  }
  const url = window.location + `media/playpause`;
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {},
    error: (err) => {
      console.log(err);
    },
  });
}

$(document).ready(() => {
  //Slider event to change volume
  $("#volume-range").on("change", () => {
    changeVolume($("#volume-range").val());
  });

  //Mute/unmute sound button event
  $("#mute-sound-button").on("click", () => {
    muted == false ? muteVolume() : unmuteVolume();
  });

  $("#previous-song-button").on("click", () => {
    previousSong();
  });

  $("#next-song-button").on("click", () => {
    nextSong();
  });

  $("#pause-song-button").on("click", () => {
    playPauseSong();
  });
});
