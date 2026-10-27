import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Beranda mode database: jadwal anime hari ini (cepat & relevan) + fallback A-Z list.
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const API = 'https://www.sankavollerei.web.id/anime/samehadaku/schedule';

function todayName() {
  const names = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const js = new Date().getDay(); // 0=Sunday
  return names[(js + 6) % 7];
}

const DbSchedule = () => {
  const [days, setDays] = useState(null);
  const [sel, setSel] = useState(todayName());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let dead = false;
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 10000);
    fetch(API, { signal: ctl.signal, headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        if (dead) return;
        const list = j?.data?.days || [];
        if (!list.length) throw new Error('empty');
        setDays(list);
        setLoading(false);
      })
      .catch(() => { if (!dead) { setError('Gagal memuat jadwal'); setLoading(false); } })
      .finally(() => clearTimeout(to));
    return () => { dead = true; };
  }, []);

  const today = (days || []).find((d) => d.day === sel) || { animeList: [] };
  const list = today.animeList || [];

  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>📅 Jadwal Anime</h1>
      <p style={{ color: 'var(--color-text-muted, #999)', margin: '0 0 16px' }}>
        Hari ini: <b style={{ color: 'var(--color-text, #fff)' }}>{todayName()}</b> — anime yang tayang hari ini.
      </p>

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSel(d)}
            style={{
              flexShrink: 0, border: 'none', cursor: 'pointer', borderRadius: 999,
              padding: '8px 16px', fontSize: 13, fontWeight: 700,
              background: d === sel ? 'var(--color-primary, #e11d48)' : 'rgba(255,255,255,0.07)',
              color: '#fff',
            }}
          >
            {d}{d === todayName() ? ' •' : ''}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#999' }}>Memuat jadwal…</p>}
      {error && <p style={{ color: '#f66' }}>{error} — coba muat ulang.</p>}

      {!loading && !error && (
        list.length === 0 ? (
          <p style={{ color: '#999' }}>Tidak ada anime yang tayang hari ini.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
            {list.map((a, i) => {
              const slug = a.animeId || (a.href || '').split('/').filter(Boolean).pop();
              return (
                <Link
                  key={i}
                  to={slug ? `/anime/${slug}` : '#'}
                  state={{ item: a }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#15151d' }}>
                    <img
                      src={a.poster}
                      alt={a.title}
                      loading="lazy"
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>{a.episodes ? `Ep ${a.episodes}` : (a.releasedOn || '')}</div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* keep A-Z discoverable */}
      <div style={{ marginTop: 28 }}>
        <Link to="/list" style={{ color: 'var(--color-primary, #e11d48)', fontWeight: 700, fontSize: 14 }}>
          Lihat semua anime A-Z →
        </Link>
      </div>
      <VisitorCounter inline />
    </div>
  );
};

export default DbSchedule;
