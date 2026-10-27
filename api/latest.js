export const config = { runtime: 'edge' };

export default async function handler() {
  const attempts = [
    ['https://www.sankavollerei.web.id/anime/samehadaku/ongoing?page=1', 'okhttp/4.12.0'],
  ];
  for (const [url, ua] of attempts) {
    try {
      const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': ua } });
      const text = await r.text();
      if (r.ok && text.trim().startsWith('{')) {
        return new Response(text, { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
      }
    } catch (e) { /* next */ }
  }
  return new Response(JSON.stringify({ error: 'upstream blocked' }), { status: 502, headers: { 'content-type': 'application/json' } });
}
