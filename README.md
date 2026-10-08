# Cartitas

Una pequeña web estática para escribir cartas digitales, compartirlas mediante un enlace y añadir canciones o cupones de cariño.

## Usar en local

Abre `index.html` en un navegador para probar el formulario. Para generar enlaces que otra persona pueda abrir, publica la carpeta en un servicio de hosting estático, por ejemplo GitHub Pages. Un enlace creado desde `file://` o desde un servidor local solo se puede abrir en ese mismo equipo.

## Publicar en GitHub Pages

1. Sube los archivos de este proyecto a un repositorio de GitHub.
2. En el repositorio, abre **Settings → Pages**.
3. Elige la rama y la carpeta que contienen `index.html` (normalmente la raíz) y guarda.
4. Abre la URL publicada, crea una carta y comparte el enlace generado.

El enlace apunta a `respuesta.html` en la misma carpeta que `index.html`, por lo que funciona con dominios y rutas de publicación distintas.

## Funciones

- Vista previa en vivo y cuatro estilos de carta.
- Ocasión y despedida personalizables para cada carta.
- Ramo de rosas ilustrado en CSS, opcional para cada carta.
- Ideas para inspirar el mensaje y animaciones accesibles en ambas páginas.
- Guardado, recuperación y borrado manual de borradores locales en el dispositivo.
- Enlaces de Spotify y SoundCloud con validación y reproductores integrados.
- De uno a cinco cupones personalizados.
- Compartir desde el menú nativo del dispositivo o copiar el enlace.
- Descarga de la carta como imagen diseñada (PNG) y de cada cupón por separado, o todos a la vez.
- Copiar el mensaje, compartir la carta y preparar una versión para imprimir.
- Accesos a las redes sociales de Brandon en ambas páginas.
- Enlaces cortos creados con is.gd; la carta se comprime y cifra en el navegador mediante AES-GCM (Web Crypto API).
- Compatibilidad con los enlaces largos y parámetros de cupones generados por versiones anteriores.

La carta se comprime y cifra localmente con AES-GCM usando las API nativas del navegador; no se envía a un servicio de cifrado. Para acortar el enlace, el navegador envía a is.gd la dirección que contiene solo el texto cifrado; la clave AES de 128 bits permanece en el fragmento (`#...`), que no forma parte de esa solicitud. El resultado es un enlace como `https://is.gd/AbCdEf#clave` de unos 40 caracteres. El enlace final sí incluye la clave: cualquier persona que lo reciba podrá abrir la carta, así que compártelo solo con quien corresponda. Si el acortador no está disponible, el sitio deja listo el enlace cifrado completo. Las canciones guardan solo su ruta, sin parámetros de seguimiento. No requiere una cuenta ni una base de datos.

Para generar cartas cifradas, abre el sitio mediante HTTPS o `localhost` en un navegador actual que admita Web Crypto, `CompressionStream` y `DecompressionStream` (versiones actuales de Chrome, Edge, Firefox y Safari). No se puede generar el enlace cifrado al abrir directamente el archivo con `file://`; tampoco se acortan enlaces locales porque no funcionarían para otras personas. La creación del enlace corto y los recursos visuales (Google Fonts y Bootstrap Icons) requieren conexión a internet. Las imágenes descargables se dibujan en el navegador, sin bibliotecas externas. El cifrado sigue siendo local y no usa servicios externos.
