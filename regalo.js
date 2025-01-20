function generateImage() {
  const element = document.querySelector('.sheet-content');

  if (!element) {
    console.error('No se encontró .sheet-content');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const senderName = decodeURIComponent(urlParams.get('senderName'));
  const recipientName = decodeURIComponent(urlParams.get('recipientName'));
  const message = decodeURIComponent(urlParams.get('message'));
  const soundcloudTrack = urlParams.get('soundcloudTrack');

  if (!senderName || !recipientName || !message) {
    console.error('Faltan datos necesarios para generar la imagen');
    return;
  }

  const formattedMessage = message.replace(/\n/g, '<br>');
  document.getElementById('message').innerHTML = formattedMessage;

  document.getElementById('senderName').textContent = senderName;
  document.getElementById('recipientName').textContent = recipientName;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1080;
  canvas.height = 1505;

  ctx.fillStyle = '#fa9fa2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '45px Helvetica, Arial';
  ctx.fillStyle = '#333';

  let yOffset = 150;
  const marginLeft = 50;
  const lineHeight = 50;
  const maxWidth = canvas.width - marginLeft * 2;

  ctx.font = 'bold 40px Helvetica, Arial';
  ctx.fillText(`De parte de: ${senderName}`, marginLeft, yOffset);
  yOffset += lineHeight;
  ctx.fillText(`Para ti, persona especial: ${recipientName}`, marginLeft, yOffset);
  yOffset += lineHeight;

  const lines = formattedMessage.split('<br>');
  lines.forEach((line) => {
    const words = line.split(' ');
    let currentLine = '';
    words.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth) {
        ctx.fillText(currentLine.trim(), marginLeft, yOffset);
        currentLine = word + ' ';
        yOffset += lineHeight;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) {
      ctx.fillText(currentLine.trim(), marginLeft, yOffset);
      yOffset += lineHeight;
    }
  });

  if (soundcloudTrack) {
    const audioLink = `https://w.soundcloud.com/player/?url=${soundcloudTrack}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(audioLink)}&size=800x800`;

    fetch(qrImageUrl) // Hacer una solicitud para obtener el QR en canvas limpio
      .then(response => response.blob())
      .then(imageBlob => {
        const qrImage = new Image();
        qrImage.onload = function () {
          const qrSize = 300; // Incremento considerable del tamaño del QR
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = canvas.height - 350; // Colocado más arriba en la parte inferior
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // Agregar el título justo debajo del QR
          ctx.font = 'bold 30px Helvetica, Arial';
          ctx.fillStyle = '#333';
          ctx.fillText('Escucha la canción que te dediqué', qrX, qrY + 325 ); // Ajustado ligeramente abajo del QR

          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = 'carta.png';
          link.click();
        };
        qrImage.onerror = function () {
          console.error('Error al cargar el código QR.');
        };
        qrImage.src = URL.createObjectURL(imageBlob);
      })
      .catch(error => console.error('Error al cargar el QR:', error));
  } else {
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'carta.png';
    link.click();
  }
}