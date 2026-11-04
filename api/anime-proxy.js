const UPSTREAMS = ['https://www.sankavollerei.web.id', 'https://xyz-api.animein.net'];

export default async function handler(req, res) {
  const path = String(req.query.path || '');
  const base = Number(req.query.base || 0);
  if (!/^[\w\/\-\.&=?%]+$/.test(path)) return res.status(400).json({ error: 'bad path' });
  const upstream = UPSTREAMS[base] + (path.startsWith('/') ? path : '/' + path);
  try {
    const r = await fetch(upstream, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mi 8 Lite) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'id-ID,id;q=0.9',
        'Referer': 'https://www.google.com/',
      },
    });
    const text = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(r.status).type('application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
