const GITHUB_REPO = 'zenosxwedi-oss/xicinime';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const ALLOWED_ORIGINS = new Set([
  'https://www.xicinime.my.id',
  'https://xicinime.my.id',
]);
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.add('http://localhost:5173');
  ALLOWED_ORIGINS.add('http://localhost:4173');
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const headers = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'xicinime-web' };
    if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;

    const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, { headers });
    if (!resp.ok) return res.status(502).json({ error: 'GitHub API error', status: resp.status });

    const data = await resp.json();
    const apk = (data.assets || []).find(a => a.name.endsWith('.apk'));
    if (!apk) return res.status(404).json({ error: 'No APK asset found in latest release' });

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).json({
      version: data.tag_name || 'v1.0',
      name: apk.name,
      size: apk.size,
      sizeMB: (apk.size / 1024 / 1024).toFixed(1) + ' MB',
      date: apk.updated_at || data.published_at,
      assetId: apk.id,
      downloadUrl: `/api/download?asset_id=${apk.id}`,
    });
  } catch {
    return res.status(502).json({ error: 'Upstream error' });
  }
}
