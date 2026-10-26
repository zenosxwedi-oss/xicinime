import { useState } from 'react';

// Floating "Lapor Bug" widget: instant AI auto-reply (pollinations, no key)
// + forwards the report to the owner's Telegram via /api/report.
const PAGE = () => window.location.pathname;

export default function BugReport() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setReply(null);
    // 1) forward to Telegram (fire and forget)
    try {
      fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, page: PAGE(), ua: navigator.userAgent.slice(0, 120) }),
      }).catch(() => {});
    } catch {}
    // 2) instant AI auto-reply (no key needed)
    try {
      const prompt = encodeURIComponent(
        `Kamu asisten AI website nonton anime "Nusanime". Seorang pengguna melapor bug/kesalahan. Balas singkat (maks 3 kalimat), bahasa santai Indonesia: akui laporannya, katakan laporan sudah diteruskan ke tim dan akan segera dicek/diperbaiki, minta detail (halaman, screenshot) jika perlu. JANGAN berikan solusi teknis yang belum diverifikasi.\nLaporan: ${t}`
      );
      const r = await fetch(`https://text.pollinations.ai/${prompt}`);
      const ai = await r.text();
      setReply((ai || '').slice(0, 600));
    } catch {
      setReply('Laporanmu sudah diteruskan ke tim. Cek Telegram untuk balasan lebih lanjut. 🙏');
    }
    setSent(true);
    setBusy(false);
  };

  const close = () => { setOpen(false); setSent(false); setText(''); setReply(null); };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Lapor Bug"
          style={{
            position: 'fixed', bottom: 76, right: 14, zIndex: 60,
            background: '#FF4757', color: '#fff', border: 'none', borderRadius: 999,
            padding: '10px 16px', fontWeight: 700, fontSize: 13,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)', cursor: 'pointer',
          }}
        >🐞 Lapor Bug</button>
      )}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: '#14161d', borderRadius: 14, padding: 18, width: '100%', maxWidth: 420,
            color: '#eee', fontFamily: 'sans-serif',
          }}>
            {!sent ? (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🐞 Lapor Bug</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                  Ceritakan masalahnya — AI akan menjawab langsung dan laporanmu diteruskan ke tim.
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Contoh: video tidak bisa diputar di halaman episode..."
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box', background: '#0d0f14',
                    color: '#eee', border: '1px solid #2a2d38', borderRadius: 10,
                    padding: 10, fontSize: 14, resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    type="button" onClick={submit} disabled={busy || !text.trim()}
                    style={{
                      flex: 1, background: '#FF4757', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14,
                      cursor: busy ? 'wait' : 'pointer', opacity: text.trim() ? 1 : 0.5,
                    }}
                  >{busy ? 'Mengirim…' : 'Kirim'}</button>
                  <button
                    type="button" onClick={close}
                    style={{
                      background: 'transparent', color: '#999', border: '1px solid #2a2d38',
                      borderRadius: 10, padding: '10px 16px', fontSize: 14, cursor: 'pointer',
                    }}
                  >Batal</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>💬 Balasan AI</div>
                <div style={{
                  background: '#0d0f14', borderRadius: 10, padding: 12, fontSize: 14,
                  lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: 10,
                }}>{reply || '…'}</div>
                <div style={{ fontSize: 12, color: '#7ec97e', marginBottom: 12 }}>
                  ✅ Laporan diteruskan ke tim — perbaikan akan diumumkan.
                </div>
                <button
                  type="button" onClick={close}
                  style={{
                    width: '100%', background: '#FF4757', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >Tutup</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
