// Vercel serverless function: receives bug reports from the website
// and forwards them to the owner's Telegram chat. Token stays server-side.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  try {
    const { text, page, ua } = req.body || {};
    if (!text || typeof text !== 'string' || text.length > 2000) {
      return res.status(400).json({ ok: false, error: 'invalid text' });
    }
    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID || '7777796701';
    if (!token) return res.status(500).json({ ok: false, error: 'not configured' });

    const msg =
      `🐞 *LAPOR BUG — nusanime.web.id*\n\n` +
      `${text}\n\n` +
      `_Halaman:_ ${page || '-'}\n_Time:_ ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`;

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'Markdown',
      }),
    });
    if (!r.ok) throw new Error('telegram ' + r.status);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}
