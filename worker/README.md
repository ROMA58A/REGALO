# Enlaces cortos propios (Cloudflare Worker)

Guarda solo el texto cifrado; la clave va en el `#` y nunca llega al servidor.

1. Crea una cuenta gratuita en https://dash.cloudflare.com
2. En esta carpeta: `npx wrangler login`
3. `npx wrangler kv namespace create LETTERS` y pega el `id` en `wrangler.toml`
4. `npx wrangler deploy` y copia la URL `https://cartitas-links.<usuario>.workers.dev`
5. Pégala en `config.js` (`window.CARTITAS_STORE_URL`), haz commit y push.

El enlace queda como `respuesta.html?XXXXXXXXXX#clave15`. Si añades otro dominio al sitio, inclúyelo en `ALLOWED_ORIGINS`.
