// Cloudflare Worker: guarda solo el texto ya cifrado. La clave nunca llega aquí.
const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_BYTES = 24000;
const TTL_SECONDS = 60 * 60 * 24 * 365;

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
});

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGINS.split(',');
    const origin = request.headers.get('Origin');
    const headers = cors(allowed.includes(origin) ? origin : allowed[0]);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    if (request.method === 'POST') {
      if (!allowed.includes(origin)) return new Response('Origen no permitido', { status: 403, headers });
      const body = await request.text();
      if (!/^[A-Za-z0-9_-]+$/.test(body) || body.length > MAX_BYTES) {
        return new Response('Contenido no válido', { status: 400, headers });
      }
      const id = Array.from(crypto.getRandomValues(new Uint8Array(10)), (n) => ALPHABET[n % ALPHABET.length]).join('');
      await env.LETTERS.put(id, body, { expirationTtl: TTL_SECONDS });
      return Response.json({ id }, { headers });
    }

    if (request.method === 'GET') {
      const id = url.pathname.slice(1);
      const value = /^[A-Za-z0-9]{10}$/.test(id) ? await env.LETTERS.get(id) : null;
      if (!value) return new Response('No existe', { status: 404, headers });
      return new Response(value, { headers: { ...headers, 'Cache-Control': 'public, max-age=3600' } });
    }

    return new Response('Método no permitido', { status: 405, headers });
  }
};
