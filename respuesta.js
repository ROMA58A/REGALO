

        
  
// Función para eliminar la parte "intl-es" de la URL de Spotify
function removeIntlFromSpotifyURL(url) {
    return url.replace(/\/intl-[a-zA-Z]+/, ''); // Elimina cualquier parte que comience con /intl-[idioma]
}

// Función para extraer el ID de la URL de Spotify
function extractSpotifyTrackId(url) {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}


// Obtener parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const senderName = decodeURIComponent(urlParams.get('senderName'));
const recipientName = decodeURIComponent(urlParams.get('recipientName'));
const message = decodeURIComponent(urlParams.get('message'));
const soundcloudTrack = decodeURIComponent(urlParams.get('soundcloudTrack')); // Decodificar URL de SoundCloud
let spotifyTrack = decodeURIComponent(urlParams.get('spotifyTrack')); // Decodificar URL de Spotify
const cupons = decodeURIComponent(urlParams.get('cupons')); // Decodificar lista de cupones como string
// Guardar el método XMLHttpRequest original
const originalXHR = XMLHttpRequest.prototype.open;

// Sobrescribir el método open de XMLHttpRequest
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  // Verificar si la solicitud está relacionada con la URL de Spotify
  if (url.includes('spotifycdn.com/image')) {
    console.log('Solicitud de recurso de Spotify capturada:', url);
  }

  // Llamar al método original open
  return originalXHR.apply(this, arguments);
};


// Eliminar "intl-es" de la URL de Spotify si existe
if (spotifyTrack) {
    spotifyTrack = removeIntlFromSpotifyURL(spotifyTrack);
    // Extraer solo el ID del track de Spotify
    spotifyTrack = extractSpotifyTrackId(spotifyTrack);
    console.log('Spotify Track después de eliminar intl-es y extraer el ID:', spotifyTrack);
}

// Mostrar el nombre del remitente y destinatario
document.getElementById('senderName').textContent = senderName;
document.getElementById('recipientName').textContent = recipientName;

// Convertir los saltos de línea en el mensaje a <br>
const formattedMessage = message.replace(/\n/g, '<br>');
document.getElementById('message').innerHTML = formattedMessage;

// Mostrar cupones si existen
const couponContainer = document.getElementById('coupon-container');
const couponCodes = cupons ? cupons.split(',') : [];
const bossContainer = document.querySelector('.boss');

// Verificar si hay cupones
if (couponCodes.length > 0) {
    couponContainer.style.display = 'block';
    couponContainer.innerHTML = '';

    couponCodes.forEach((coupon, index) => {
        let container = document.createElement('div');
        container.className = 'd-flex flex-column flex-sm-row align-items-center border p-3 mb-3';

        container.innerHTML = `
            <h1>¡Disfruta de tu Cupón!</h1>
            <div class="flex-shrink-0 me-3 mb-3 mb-sm-0">
                <img id="couponImage-${index}" src="cupon 1.png" alt="Imagen del cupón ${index + 1}" class="img-fluid rounded" style="width: 100px; height: auto;">
            </div>
            <div>
                <p class="mb-1"><strong>Tu cupón está listo para ser utilizado</strong></p>
                <h2 class="mb-0">Cupón válido por: <strong><span id="couponCode-${index}">${coupon}</span></strong></h2>
                <p class="mb-1"><strong>No olvides validar tu cupón para disfrutar</strong></p>
            </div>
        `;

        couponContainer.appendChild(container);
    });

    if (bossContainer) {
        bossContainer.style.display = 'block';
    }
} else {
    couponContainer.style.display = 'none';
    const box1Container = document.querySelector('.box1');
    if (box1Container) {
        box1Container.style.display = 'none';
    }

    if (bossContainer) {
        bossContainer.style.display = 'none';
    }
}

// Lógica para mostrar reproductores de SoundCloud y Spotify
document.addEventListener('DOMContentLoaded', function () {
    const audioContainer = document.getElementById('audio-container');
    const songContainer = document.getElementById('song-container');
    const songTitleContainer = document.getElementById('song-title-container');
    const spotifyContainer = document.getElementById('spotify-container');

    // Reproductor de SoundCloud
    if (soundcloudTrack && audioContainer) {
        const audioPlayer = document.createElement('iframe');
        audioPlayer.src = `https://w.soundcloud.com/player/?url=${soundcloudTrack}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
        audioPlayer.width = '100%';
        audioPlayer.height = '150';
        audioPlayer.scrolling = 'no';
        audioPlayer.frameborder = 'no';
        audioPlayer.allow = 'autoplay';
        audioContainer.appendChild(audioPlayer);

        if (songTitleContainer) {
            const songTitle = soundcloudTrack.split('/').pop().replace(/-/g, ' ');
            songTitleContainer.textContent = songTitle;
        }
    } else if (!soundcloudTrack && audioContainer) {
        audioContainer.style.display = 'none';
    }

    // Reproductor de Spotify
    if (spotifyTrack && spotifyContainer) {
        const spotifyPlayer = document.createElement('iframe');
        spotifyPlayer.src = `https://open.spotify.com/embed/track/${spotifyTrack}?utm_source=generator`;
        spotifyPlayer.width = '100%';
        spotifyPlayer.height = '80';
        spotifyPlayer.frameborder = '0';
        spotifyPlayer.allow = 'encrypted-media';
        spotifyContainer.appendChild(spotifyPlayer);
    } else if (!spotifyTrack && spotifyContainer) {
        spotifyContainer.style.display = 'none';
    }

    // Control de visibilidad de contenedores según la URL
    if (window.location.href.includes('imagen')) {
        if (songContainer) songContainer.style.display = 'block';
        if (audioContainer) audioContainer.style.display = 'block';
        if (spotifyContainer) spotifyContainer.style.display = 'block';

        if (songTitleContainer) songTitleContainer.style.display = 'none';
        const songDescription = songContainer ? songContainer.querySelector('p') : null;
        if (songDescription) songDescription.style.display = 'none';

        const spotifyText = songContainer ? songContainer.querySelector('strong p') : null;
        if (spotifyText) spotifyText.style.display = 'none';
    } else {
        if (songContainer) songContainer.style.display = 'none';
        if (audioContainer && !soundcloudTrack) audioContainer.style.display = 'none';
        if (spotifyContainer && !spotifyTrack) spotifyContainer.style.display = 'none';
    }
});


        function openEnvelope() {
            const image = document.getElementById('envelope-image');
            const details = document.getElementById('envelope-details');

            image.style.display = 'none'; // Ocultar la imagen del sobre
            details.classList.remove('hidden'); // Mostrar el contenido del sobre
        }

        function openSheet(element) {
            element.classList.toggle('opened');
        }

        function generateImage() {
    const content = document.getElementById("capture-content");

    if (!content) {
        console.error("El elemento con ID 'capture-content' no existe.");
        return;
    }

    // Obtener el título de la canción desde la URL
    const soundcloudTrack = urlParams.get('soundcloudTrack');

    if (soundcloudTrack) {
        const urlSegments = soundcloudTrack.split('/');
        let songTitle = urlSegments[urlSegments.length - 1];
        songTitle = songTitle.split('?')[0].replace(/-/g, ' ');

        const songTitleContainer = document.getElementById("song-title-container");
        if (songTitleContainer) {
            songTitleContainer.innerHTML = `<p style="font-size: 36px; font-weight: bold; text-align: center;">${songTitle}</p>`;
        }
    } else {
        console.warn("No se encontró el parámetro 'soundcloudTrack' en la URL.");
    }

    // Ocultar el contenedor del reproductor de audio solo para la captura
    const audioContainer = document.getElementById("audio-container");
    if (audioContainer) {
        audioContainer.style.display = "none";
    }

    // Ocultar el contenedor de Spotify solo para la captura
    const spotifyContainer = document.getElementById("spotify-container");
    if (spotifyContainer) {
        spotifyContainer.style.display = "none";
    }

    // Ajustar el contenido antes de capturar
    document.body.style.overflow = "hidden"; // Evitar desplazamientos durante la captura

    // Obtener la URL de la canción de Spotify desde los parámetros de la URL
    const spotifyTrack = urlParams.get('spotifyTrack');
    console.log("spotifyTrack:", spotifyTrack);  // Log para verificar el parámetro

    if (spotifyTrack) {
        const spotifyUrl = spotifyTrack; // Usamos directamente la URL de Spotify desde la query
        console.log("spotifyUrl:", spotifyUrl);  // Log para verificar la URL

        // Validar la URL de Spotify
        if (spotifyUrl && spotifyUrl.startsWith("https://open.spotify.com")) {
            console.log("URL de Spotify válida");  // Log si la URL es válida

            // Crear la URL para generar el código de Spotify
            const spotifyCodeUrl = `https://www.spotifycodes.com/generate?url=${encodeURIComponent(spotifyUrl)}`;
            console.log("spotifyCodeUrl:", spotifyCodeUrl);  // Log para verificar la URL de la API

            // Crear una imagen del código de Spotify y mostrarla
            const spotifyCodeImg = document.createElement('img');
            spotifyCodeImg.src = spotifyCodeUrl;
            spotifyCodeImg.alt = "Spotify Code";
            spotifyCodeImg.style.width = '200px'; // Tamaño opcional para la imagen

            // Agregar la imagen del código de Spotify al contenedor de la página
            const spotifyCodeContainer = document.getElementById("spotifyCodeContainer");
            if (spotifyCodeContainer) {
                spotifyCodeContainer.innerHTML = '';  // Limpiar el contenedor antes de agregar el nuevo código
                spotifyCodeContainer.appendChild(spotifyCodeImg);
            }
        } else {
            console.warn("No se encontró un enlace válido de Spotify.");
        }
    } else {
        console.warn("No se encontró el parámetro 'spotifyTrack' en la URL.");
    }

    // Esperar un breve tiempo antes de capturar la imagen
    setTimeout(() => {
        // Ajuste de escala basado en el dispositivo
        const scaleFactor = window.devicePixelRatio || 1; // Ajusta según la densidad de píxeles del dispositivo

        html2canvas(content, {
            useCORS: true,
            scale: scaleFactor,
        }).then(canvas => {
            // Agregar margen al canvas
            const margin = 20;
            const canvasWithMargin = document.createElement("canvas");
            const ctx = canvasWithMargin.getContext("2d");

            canvasWithMargin.width = canvas.width + margin * 2;
            canvasWithMargin.height = canvas.height + margin * 2;

            ctx.fillStyle = "#ffffff"; // Fondo blanco
            ctx.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
            ctx.drawImage(canvas, margin, margin);

            // Crear un enlace para descargar la imagen
            const link = document.createElement("a");
            link.download = "captura_con_margen.png";
            link.href = canvasWithMargin.toDataURL("image/png");
            link.click();

            // Restaurar el contenedor de audio y Spotify después de la captura
            if (audioContainer) {
                audioContainer.style.display = "block";
            }
            if (spotifyContainer) {
                spotifyContainer.style.display = "block";
            }

            // Restaurar el desplazamiento
            document.body.style.overflow = "";
        }).catch(error => {
            console.error("Error al generar la imagen:", error);
            document.body.style.overflow = "";
        });
    }, 300); // Agregar un pequeño retraso para asegurar que los cambios de diseño se apliquen
}

        function generateImage1() {
            // Obtener el contenedor del cupón
            const content = document.getElementById("coupon-container");

            if (!content) {
                console.error("El elemento con ID 'coupon-container' no existe.");
                return;
            }

            // Ajustar el contenido antes de capturar
            document.body.style.overflow = "hidden"; // Evitar desplazamientos durante la captura

            // Esperar un breve tiempo antes de capturar la imagen
            setTimeout(() => {
                // Ajuste de escala basado en el dispositivo
                const scaleFactor = window.devicePixelRatio || 1; // Ajusta según la densidad de píxeles del dispositivo

                html2canvas(content, {
                    useCORS: true,
                    scale: scaleFactor,
                }).then(canvas => {
                    // Agregar margen al canvas
                    const margin = 20;
                    const canvasWithMargin = document.createElement("canvas");
                    const ctx = canvasWithMargin.getContext("2d");

                    canvasWithMargin.width = canvas.width + margin * 2;
                    canvasWithMargin.height = canvas.height + margin * 2;

                    ctx.fillStyle = "#ffffff"; // Fondo blanco
                    ctx.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
                    ctx.drawImage(canvas, margin, margin);

                    // Crear un enlace para descargar la imagen
                    const link = document.createElement("a");
                    link.download = "captura_cupon.png";
                    link.href = canvasWithMargin.toDataURL("image/png");
                    link.click();

                    // Restaurar el desplazamiento
                    document.body.style.overflow = "";
                }).catch(error => {
                    console.error("Error al generar la imagen:", error);
                    document.body.style.overflow = "";
                });
            }, 300); // Agregar un pequeño retraso para asegurar que los cambios de diseño se apliquen
        }