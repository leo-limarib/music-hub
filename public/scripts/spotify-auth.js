function authorizeApp(hostPassword, hostName) {
  $.ajax({
    type: "POST",
    url: window.location.origin + `/spotify/host`,
    contentType: "application/json",
    data: JSON.stringify({ hostName: hostName, hostPassword: hostPassword }),
    dataType: "json",
    success: (data) => {
      window.location.replace(data.url);
    },
    error: (err) => {
      console.log(err);
    },
  });
}

$(document).ready(() => {
  $("#host-password").on("change", () => {
    authorizeApp($("#host-password").val(), $("#host-name").val());
  });
});
