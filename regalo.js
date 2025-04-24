document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const includeSoundCloudCheckbox = document.getElementById('include-soundcloud');
  const soundcloudContainer = document.getElementById('soundcloud-container');
  const includeSpotifyCheckbox = document.getElementById('include-spotify');
  const spotifyContainer = document.getElementById('spotify-container');

  // Verificar que los elementos existen antes de agregar los event listeners
  if (includeSoundCloudCheckbox && soundcloudContainer) {
    includeSoundCloudCheckbox.addEventListener('change', function() {
      if (includeSoundCloudCheckbox.checked) {
        soundcloudContainer.style.display = 'block';  // Muestra el campo de SoundCloud
      } else {
        soundcloudContainer.style.display = 'none';  // Oculta el campo de SoundCloud
      }
    });
  }

  if (includeSpotifyCheckbox && spotifyContainer) {
    includeSpotifyCheckbox.addEventListener('change', function() {
      if (includeSpotifyCheckbox.checked) {
        spotifyContainer.style.display = 'block';  // Muestra el campo de Spotify
      } else {
        spotifyContainer.style.display = 'none';  // Oculta el campo de Spotify
      }
    });
  }

  // Elementos del DOM
  const includeCuponCheckbox = document.getElementById('include-cupon');  // Verifica que el id coincida
  const cuponContainer = document.getElementById('cupon-container');

  // Mostrar u ocultar el contenedor de cupones al cambiar la casilla
  includeCuponCheckbox.addEventListener('change', function() {
    if (includeCuponCheckbox.checked) {
      cuponContainer.style.display = 'block';  // Muestra el contenedor de cupones
    } else {
      cuponContainer.style.display = 'none';  // Oculta el contenedor de cupones
    }
  });

  // Generar campos de cupones dinámicamente
  document.getElementById('num-cupones').addEventListener('change', function() {
    const numCupones = parseInt(this.value);

    // Eliminar los campos anteriores si existen
    const couponFieldsContainer = document.getElementById('coupon-fields-container');
    couponFieldsContainer.innerHTML = '';  // Limpiar los campos generados previamente

    // Crear los campos de cupones según el número seleccionado
    for (let i = 1; i <= numCupones; i++) {
      const label = document.createElement('label');
      label.setAttribute('for', `CUPON${i}`);
      label.innerText = `Cupón ${i}:`;

      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('id', `CUPON${i}`);
      input.setAttribute('name', `CUPON${i}`);

      const br = document.createElement('br');

      couponFieldsContainer.appendChild(label);
      couponFieldsContainer.appendChild(input);
      couponFieldsContainer.appendChild(br);
    }
  });

  // Asegurarse de que solo se cree 1 campo al principio
  document.getElementById('num-cupones').value = 1;  // Establecer el valor inicial a 1
  document.getElementById('num-cupones').dispatchEvent(new Event('change'));  // Disparar el evento para generar el campo inicial

  const form = document.getElementById('unified-form');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const senderNameInput = document.getElementById('sender-name');
      const recipientNameInput = document.getElementById('recipient-name');
      const messageInput = document.getElementById('message');
      const soundcloudTrackInput = document.getElementById('soundcloud-track');
      const spotifyTrackInput = document.getElementById('spotify-track');
      const includeSoundCloudCheckbox = document.getElementById('include-soundcloud'); // Asegúrate de que este checkbox exista
      const includeSpotifyCheckbox = document.getElementById('include-spotify'); // Asegúrate de que este checkbox exista

      let soundcloudTrack = '';
      let spotifyTrack = '';

      // Función para validar enlaces de SoundCloud
      function isValidSoundCloudURL(url) {
        const soundcloudPattern = /^(https?:\/\/)?(www\.)?(soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)$/;
        return soundcloudPattern.test(url);
      }

      // Verificar si SoundCloud está incluido
      if (includeSoundCloudCheckbox && includeSoundCloudCheckbox.checked) {
        soundcloudTrack = soundcloudTrackInput.value;

        // Validar el enlace de SoundCloud
        if (!isValidSoundCloudURL(soundcloudTrack)) {
          console.log('SoundCloud URL ingresado:', soundcloudTrack);
          alert('Por favor, introduce un enlace válido de SoundCloud.');
          return;
        }

        // Conversión automática de enlace móvil a PC solo para SoundCloud
        if (soundcloudTrack.startsWith('https://m.soundcloud.com/')) {
          soundcloudTrack = soundcloudTrack.replace('https://m.soundcloud.com/', 'https://soundcloud.com/');
        }
      }

      // Si solo se selecciona Spotify, no se realiza validación
      if (includeSpotifyCheckbox && includeSpotifyCheckbox.checked) {
        spotifyTrack = spotifyTrackInput.value;
        console.log('Spotify URL ingresado:', spotifyTrack);
      }

      document.querySelector('.loading-box').style.display = 'block';

      const linkContainer = document.getElementById('link-container');
      if (!linkContainer) {
        console.error('No se encontró el contenedor de enlaces.');
        return;
      }

      setTimeout(() => {
        const cupons = [];
        for (let i = 1; i <= 5; i++) {
          const cupónInput = document.getElementById(`CUPON${i}`);
          if (cupónInput) {
            cupons.push(cupónInput.value);
          }
        }


         // Función para validar el enlace de SoundCloud
 function isValidSoundCloudURL(url) {
  const pattern = /^(https?:\/\/)?(www\.)?soundcloud\.com\/.+/;
  return pattern.test(url);
}

// Función para validar el enlace de Spotify
function isValidSpotifyURL(url) {
  const pattern = /^(https?:\/\/)?(www\.)?spotify\.com\/.+/;
  return pattern.test(url);
}

// Función para obtener el token de acceso de Spotify
async function getSpotifyToken() {
  const clientId = 'd76d118354304ac595e26bfb19be3596';
  const clientSecret = '3fdfeeb778a948e0bd51a5af4fb3c4dd';

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Error al obtener el token de Spotify');
  }

  const data = await response.json();
  console.log('Token de acceso:', data.access_token);
  return data.access_token;
}

        // Formatear cupones como una cadena separada por comas
        const cuponesStr = cupons.join(',');

        const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5500/respuesta.html'  // URL local
        : 'https://roma58a.github.io/REGALO/respuesta.html';  // URL en GitHub Pages
      
      const url = `${baseUrl}?senderName=${encodeURIComponent(senderNameInput.value)}&recipientName=${encodeURIComponent(recipientNameInput.value)}&message=${encodeURIComponent(messageInput.value)}&soundcloudTrack=${encodeURIComponent(soundcloudTrack)}&spotifyTrack=${encodeURIComponent(spotifyTrack)}&cupons=${encodeURIComponent(cuponesStr)}`;
      
      fetch(`https://api.tinyurl.com/create?url=${encodeURIComponent(url)}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eij03zhBEwUwC7ZXHcXq6IIxzteaDHSjyXjEzYmL5rj8Vxufrdb9lBFVNwdN'
        }
      })
      .then(response => response.json())
      .then(data => {
        const shortenedUrl = data.data.tiny_url;
      
        // Creamos el botón de compartir y configuramos su acción
        const shareButton = document.createElement('button');
        shareButton.textContent = 'Compartir enlace';
        shareButton.addEventListener('click', function() {
          const shareText = `¡Disfruta esta canción!\nTe envío esta canción como un abrazo musical. ¡Haz clic para escucharla! ${shortenedUrl}`;
          
          if (navigator.share) {
            // Si el navegador soporta navigator.share, utilizamos el texto y el enlace
            navigator.share({
              title: '¡Disfruta esta canción!',  // Título para la parte compartida
              text: shareText,  // El texto que acompañará el enlace
              url: shortenedUrl  // El enlace acortado
            }).then(() => {
              console.log('Enlace compartido correctamente.');
              location.reload();
            }).catch((error) => {
              console.error('Error al compartir el enlace:', error);
              location.reload();
            });
          } else {
            // Si el navegador no es compatible, mostramos un enlace para copiar
            const textArea = document.createElement('textarea');
            textArea.value = shareText;  // El texto que queremos que se copie
            document.body.appendChild(textArea);
            textArea.select();  // Selecciona el texto
            document.execCommand('copy');  // Copia el texto al portapapeles
            document.body.removeChild(textArea);  // Elimina el área de texto
      
            alert('Texto copiado al portapapeles. Ahora puedes pegarlo donde desees compartirlo.');
            location.reload();
          }
        });
      
        linkContainer.appendChild(document.createElement('br')); // Salto de línea
        linkContainer.appendChild(shareButton);
      }) 
        .catch(error => {
          console.error('Error al acortar el enlace:', error);
        }); // Cierre del catch
      }, 1000);
    });
  }
}); 



