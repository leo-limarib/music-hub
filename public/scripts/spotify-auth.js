function authorizeApp(hostPassword) {
  $.ajax({
    type: "GET",
    url: window.location.origin + `/spotify/getuseracess/${hostPassword}`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      window.location.replace(data.url);
    },
    error: (err) => {
      alert(err.responseJSON.message);
    },
  });
}

$(document).ready(() => {
  $("#host-password").on("change", () => {
    authorizeApp($("#host-password").val());
  });
});
