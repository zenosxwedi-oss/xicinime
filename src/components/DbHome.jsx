import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// MAL/news-style anime list for the database site (nusanime.web.id).
// Vertical entries: poster left, title/score/type/genres right, "Baca" opens the detail article.
const API = 'https://www.sankavollerei.web.id/anime/samehadaku';

export default function DbHome() {
  const [tab, setTab] = useState('ongoing');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const load = async (t, p) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/${t}?page=${p}`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      const list = (j?.data?.animeList) || [];
      setItems((prev) => (p === 1 ? list : [...prev, ...list]));
      setDone(list.length < 20);
    } catch {
      setDone(true);
    }
    setLoading(false);
  };

  useEffect(() => { setItems([]); setPage(1); setDone(false); load(tab, 1); }, [tab]);

  const more = () => {
    const np = page + 1;
    setPage(np);
    load(tab, np);
  };

  return (
    <div className="home-container main-container" style={{ maxWidth: 760 }}>
      <header className="page-header" style={{ marginBottom: 14 }}>
        <h1 className="main-title" style={{ fontSize: '1.6rem' }}>Nusanime — Database Anime</h1>
        <p className="subtitle" style={{ color: 'var(--color-text-muted)' }}>
          Info anime: skor, studio, sinopsis & daftar episode. Klik "Tonton" untuk menonton di anime.nusanime.web.id.
        </p>
        <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          {[['ongoing', 'Sedang Tayang'], ['completed', 'Selesai']].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              style={{
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                border: tab === k ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: tab === k ? 'var(--color-primary)' : 'transparent',
                color: tab === k ? '#fff' : 'var(--color-text-muted)',
              }}>{label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((a) => (
          <article key={a.animeId} style={{
            display: 'flex', gap: 14, background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 14, padding: 14,
          }}>
            <Link to={`/anime/${a.animeId}`} style={{ flexShrink: 0 }}>
              <img src={a.poster} alt={a.title} loading="lazy"
                style={{ width: 96, height: 136, objectFit: 'cover', borderRadius: 10 }} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <Link to={`/anime/${a.animeId}`} style={{ textDecoration: 'none' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
                  {a.title}
                </h2>
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {a.score && <span style={chip}>⭐ {String(a.score).replace('★ ', '')}</span>}
                {a.type && <span style={chip}>📺 {a.type}</span>}
                {a.status && <span style={chip}>{a.status}</span>}
                {a.episodes && <span style={chip}>Ep {a.episodes}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {(a.genreList || []).slice(0, 4).map((g) => (
                  <span key={g.genreId} style={{ ...chip, fontSize: 11 }}>{g.title}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/anime/${a.animeId}`} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: 12 }}>
                  📖 Info Lengkap
                </Link>
                <a href={`https://anime.nusanime.web.id/anime/${a.animeId}`} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>
                  ▶ Tonton
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Memuat…</p>}
      {!loading && !done && (
        <button type="button" onClick={more} className="btn btn-secondary"
          style={{ margin: '18px auto', display: 'block' }}>Muat lebih banyak</button>
      )}
      {!loading && done && items.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 12 }}>— Semua ditampilkan —</p>
      )}
    </div>
  );
}

const chip = {
  fontSize: 12, padding: '3px 9px', borderRadius: 999,
  background: 'var(--color-surface-raised, rgba(255,255,255,0.06))',
  border: '1px solid var(--color-border)', color: 'var(--color-text-muted)',
};
