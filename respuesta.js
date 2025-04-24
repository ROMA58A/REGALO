

        
  
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






// Eliminar "intl-es" de la URL de Spotify si existe
if (spotifyTrack) {
    spotifyTrack = removeIntlFromSpotifyURL(spotifyTrack);
    // Extraer solo el ID del track de Spotify


    spotifyTrack = extractSpotifyTrackId(spotifyTrack);

}

function extractSpotifyTrackId(url) {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
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

  
        async function getSpotifyToken() {
            const clientId = 'd76d118354304ac595e26bfb19be3596'; // Tu clientId
            const clientSecret = '3fdfeeb778a948e0bd51a5af4fb3c4dd'; // Tu clientSecret
        
            const credentials = btoa(`${clientId}:${clientSecret}`); // Corrección en la interpolación
        
            try {
                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${credentials}`, // Corrección en la interpolación
                    },
                    body: 'grant_type=client_credentials',
                });
        
                if (!response.ok) {
                    throw new Error('Error al obtener el token de Spotify');
                }
        
                const data = await response.json();
                const accessToken = data.access_token;
        
               
                return accessToken;
            } catch (error) {
                console.error('Error al obtener el token de Spotify:', error);
                return null;
            }
        }
        
        async function fetchSpotifyTrackImage(trackUrl, accessToken) {
            const apiUrl = `https://api.spotify.com/v1/tracks/${spotifyTrack}`; // Corrección en la interpolación
        
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`, // Corrección en la interpolación
                    },
                });
        
                if (!response.ok) {
                    throw new Error('Error al obtener la información de la pista');
                }
        
                const trackData = await response.json();
                const albumImageUrl = trackData.album.images[0].url;
                const trackName = trackData.name;
                const artistName = trackData.artists.map(artist => artist.name).join(', ');
        
              
        
                return {
                    albumImageUrl,
                    trackName,
                    artistName
                };
            } catch (error) {
                console.error('Error al obtener la imagen de la pista:', error);
                return null;
            }
        }
        
        
      
        
        // Uso de las funciones
        (async () => {
            const token = await getSpotifyToken();
            if (token && spotifyTrack) {
                const trackInfo = await fetchSpotifyTrackImage(spotifyTrack, token);
                if (trackInfo) {
                   
                }
            }
        })();

        async function generateImage() {
            const content = document.getElementById("capture-content");
            const spotifyContainer = document.getElementById("spotify-container");
        
            if (!content) {
                console.error("El elemento con ID 'capture-content' no existe.");
                return;
            }
        
            const urlParams = new URLSearchParams(window.location.search);
            const soundcloudTrack = urlParams.get('soundcloudTrack');
        
            let songTitle = "Desconocido";
            if (soundcloudTrack) {
                const urlSegments = soundcloudTrack.split('/');
                songTitle = urlSegments[urlSegments.length - 1].split('?')[0].replace(/-/g, ' ');
            } else {
                console.warn("No se encontró el parámetro 'soundcloudTrack' en la URL.");
            }
        
            const songTitleContainer = document.getElementById("song-title-container");
            songTitleContainer.innerHTML = ''; // Limpiar el contenedor
        
            const spotifyTrack = urlParams.get('spotifyTrack');
            let albumImageUrl = "";
            let trackName = songTitle;
            let artistName = "Desconocido";
        
            if (spotifyTrack) {
                const token = await getSpotifyToken();
                if (token) {
                    const trackInfo = await fetchSpotifyTrackImage(spotifyTrack, token);
                    if (trackInfo) {
                        albumImageUrl = trackInfo.albumImageUrl;
                        trackName = trackInfo.trackName;
                        artistName = trackInfo.artistName;
                    }
                }
            }
        
            // Solo mostrar el contenedor si hay información de Spotify
            if (spotifyTrack && albumImageUrl) {
                songTitleContainer.innerHTML = `
                    <div id="capture-only" class="hidden-for-web" style="border: 4px solid black; border-radius: 8px; padding: 20px;">
                        <img src="${albumImageUrl}" alt="Portada del Álbum" style="width: 200px; height: 200px; display: block; margin: auto; border: 4px solid black; border-radius: 8px;">
                        
                        <div style="border: 4px solid black; border-radius: 8px; padding: 10px; text-align: center; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 36px;">
                            <i class="bi bi-skip-backward" style="font-size: 36px; cursor: pointer;"></i>
                            <i class="bi bi-play" style="font-size: 36px; cursor: pointer;"></i>
                            <i class="bi bi-skip-forward" style="font-size: 36px; cursor: pointer;"></i>
                        </div>
                        
                        <p style="font-size: 36px; font-weight: bold; text-align: center;">
                            ${trackName} 
                        </p>
                        
                        <p style="font-size: 24px; text-align: center;">
                            ${artistName} 
                            <i class="bi bi-spotify" style="font-size: 24px; margin-left: 10px; cursor: pointer;"></i>
                        </p>
                    </div>
                `;
            }
        
            if (spotifyContainer) {
                spotifyContainer.style.display = "none";
            }
        
            setTimeout(() => {
                const captureOnly = document.getElementById("capture-only");
                if (captureOnly) {
                    captureOnly.classList.remove("hidden-for-web");
                }
        
                const scaleFactor = window.devicePixelRatio || 1;
                html2canvas(content, {
                    useCORS: true,
                    scale: scaleFactor,
                }).then(canvas => {
                    if (spotifyContainer) {
                        spotifyContainer.style.display = "block";
                    }
                    if (captureOnly) {
                        captureOnly.classList.add("hidden-for-web");
                    }
        
                    const margin = 20;
                    const canvasWithMargin = document.createElement("canvas");
                    const ctx = canvasWithMargin.getContext("2d");
        
                    canvasWithMargin.width = canvas.width + margin * 2;
                    canvasWithMargin.height = canvas.height + margin * 2;
        
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvasWithMargin.width, canvasWithMargin.height);
                    ctx.drawImage(canvas, margin, margin);
        
                    const link = document.createElement("a");
                    link.download = "captura_con_margen.png";
                    link.href = canvasWithMargin.toDataURL("image/png");
        
                    setTimeout(() => {
                        link.click();
                        location.reload();
                    }, 0);
                }).catch(error => {
                    console.error("Error al generar la imagen:", error);
                });
            }, 300);
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