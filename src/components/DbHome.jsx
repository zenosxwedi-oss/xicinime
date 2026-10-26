import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Nusanime.web.id — database site powered by MyAnimeList data (Jikan API).
// News-style list A-Z + MAL-style detail; Tonton → anime.nusanime.web.id
const JIKAN = 'https://api.jikan.moe/v4';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const STREAM = 'https://anime.nusanime.web.id';

const letterOf = (t) => {
  const c = (t || '?').trim().toUpperCase()[0] || '#';
  return /[A-Z]/.test(c) ? c : '#';
};

export default function DbHome() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [letter, setLetter] = useState(null);

  const load = async (p) => {
    setLoading(true);
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(`${JIKAN}/anime?order_by=title&sort=asc&sfw=true&page=${p}&limit=25`, { signal: ctl.signal });
      clearTimeout(to);
      const j = await r.json();
      const list = (j?.data || []).map((x) => ({
        malId: x.mal_id,
        title: x.title,
        poster: x.images?.jpg?.image_url,
        score: x.score,
        type: x.type,
        episodes: x.episodes,
        year: x.year ?? x.aired?.prop?.from?.year,
        genres: (x.genres || []).slice(0, 3).map((g) => g.name),
        synopsis: x.synopsis,
        studios: (x.studios || []).map((s) => s.name).join(', '),
      }));
      setItems((prev) => (p === 1 ? list : [...prev, ...list]));
      setDone(!j?.pagination?.has_next_page);
    } catch {
      // Jikan unreachable — fall back to local feed so the page is never empty
      try {
        const r = await fetch(`${'https://www.sankavollerei.web.id/anime/samehadaku'}/ongoing?page=${p}`, { headers: { Accept: 'application/json' } });
        const j = await r.json();
        const list = (j?.data?.animeList || []).map((x) => ({
          malId: x.animeId, title: x.title, poster: x.poster, score: x.score,
          type: x.type, episodes: x.episodes, year: null,
          genres: (x.genreList || []).slice(0, 3).map((g) => g.title),
          synopsis: null, studios: null,
        }));
        setItems((prev) => (p === 1 ? list : [...prev, ...list]));
        setDone(list.length < 20);
      } catch { setDone(true); }
    }
    setLoading(false);
  };
  useEffect(() => { setItems([]); setPage(1); setDone(false); load(1); }, []);

  const shown = letter ? items.filter((a) => letterOf(a.title) === letter) : items;

  return (
    <div className="home-container main-container" style={{ maxWidth: 780 }}>
      <header className="page-header" style={{ marginBottom: 12 }}>
        <h1 className="main-title" style={{ fontSize: '1.6rem' }}>Nusanime — Anime List (A-Z)</h1>
        <p className="subtitle" style={{ color: 'var(--color-text-muted)' }}>
          Berita & info anime dari MyAnimeList: studio, skor, sinopsis & episode. ▶ Tonton menuju anime.nusanime.web.id.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0 16px' }}>
        <button type="button" onClick={() => setLetter(null)} style={letter === null ? chipActive : chip}>Semua</button>
        {LETTERS.map((L) => (
          <button key={L} type="button" onClick={() => setLetter(L)} style={letter === L ? chipActive : chip}>{L}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shown.map((a) => (
          <article key={a.malId} style={cardStyle}>
            <Link to={`/anime/mal-${a.malId}`} style={{ flexShrink: 0 }}>
              <img src={a.poster} alt={a.title} loading="lazy" style={posterStyle} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <Link to={`/anime/mal-${a.malId}`} style={{ textDecoration: 'none' }}>
                <h2 style={titleStyle}>{a.title}</h2>
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {a.score && <span style={chipSmall}>⭐ {a.score}</span>}
                {a.type && <span style={chipSmall}>📺 {a.type}</span>}
                {a.episodes && <span style={chipSmall}>Ep {a.episodes}</span>}
                {a.year && <span style={chipSmall}>📅 {a.year}</span>}
              </div>
              {a.studios && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>🏢 {a.studios}</div>
              )}
              {a.synopsis && (
                <p style={{
                  fontSize: 13, color: 'var(--color-text-dim)', margin: '0 0 10px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  lineHeight: 1.5,
                }}>{a.synopsis}</p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/anime/mal-${a.malId}`} className="btn btn-secondary" style={btnSm}>📖 Baca Selengkapnya</Link>
                <a href={`${STREAM}/anime/mal-${a.malId}`} className="btn btn-primary" style={btnSm}>▶ Tonton</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Memuat…</p>}
      {!loading && !done && (
        <button type="button" onClick={() => { const np = page + 1; setPage(np); load(np); }}
          className="btn btn-secondary" style={{ margin: '18px auto', display: 'block' }}>Muat lebih banyak</button>
      )}
      {letter && !loading && shown.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>Tidak ada untuk huruf {letter} di halaman yang dimuat.</p>
      )}
    </div>
  );
}

const cardStyle = { display: 'flex', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 14 };
const posterStyle = { width: 96, height: 136, objectFit: 'cover', borderRadius: 10 };
const titleStyle = { fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' };
const chip = { padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)' };
const chipActive = { ...chip, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' };
const chipSmall = { fontSize: 12, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' };
const btnSm = { padding: '7px 14px', fontSize: 12 };
