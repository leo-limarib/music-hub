function selectDevice(deviceId) {
  $.ajax({
    type: "POST",
    url: window.location.origin + `/spotify/setdevice/${deviceId}`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: () => {
      window.location.replace(window.location.origin + "/spotify/master");
    },
    error: (err) => {
      console.log(err);
    },
  });
}

$(document).ready(() => {
  $.ajax({
    type: "GET",
    url: window.location.origin + `/spotify/getmydevices`,
    contentType: "application/json",
    data: null,
    dataType: "json",
    success: (data) => {
      if (data.body.devices.length > 0) {
        data.body.devices.forEach((device) => {
          $("#devices").append(
            `<div class="device-tab" onclick="selectDevice('${device.id}')">Nome: ${device.name} <br> Tipo: ${device.type}</div>`
          );
        });
      } else {
        alert(
          "Nenhum dispositivo encontrado. Por favor, abra o Spotify no dispositivo desejado e atualize a página."
        );
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
});
