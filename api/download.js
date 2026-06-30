const GITHUB_REPO = 'zenosxwedi-oss/xicinime';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  const assetId = String(req.query.asset_id || '');
  if (!assetId || !/^\d+$/.test(assetId)) {
    return res.status(400).json({ error: 'Missing or invalid asset_id' });
  }
  if (!GITHUB_TOKEN) return res.status(503).json({ error: 'Service unavailable' });

  try {
    const resp = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${assetId}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/octet-stream',
          'User-Agent': 'xicinime-web',
        },
        redirect: 'manual',
      }
    );
    const s3Url = resp.headers.get('location');
    if (!s3Url) return res.status(502).json({ error: 'No redirect URL from GitHub' });
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, s3Url);
  } catch {
    return res.status(502).json({ error: 'Upstream error' });
  }
}
