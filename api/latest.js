export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const r = await fetch('https://www.sankavollerei.web.id/anime/samehadaku/ongoing?page=1', {
      headers: { 'Accept': 'application/json', 'User-Agent': 'okhttp/4.12.0' },
      cf: { cacheTtl: 600 },
    });
    const j = await r.json();
    return new Response(JSON.stringify(j), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
}
