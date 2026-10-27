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

      {/* Hero banner (AniList-style featured) */}
      {items.length > 0 && !letter && (
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 18,
          minHeight: 230, border: '1px solid var(--color-border)',
        }}>
          <img src={items[0].poster} alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            filter: 'blur(14px) brightness(0.35)', transform: 'scale(1.2)',
          }} />
          <div style={{ position: 'relative', display: 'flex', gap: 18, padding: 22, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <img src={items[0].poster} alt={items[0].title}
              style={{ width: 120, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--color-primary)', fontWeight: 800 }}>✨ UNGGULAN</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0 4px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                {items[0].title}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {items[0].score && <span style={chipSmall}>⭐ {items[0].score}</span>}
                {items[0].type && <span style={chipSmall}>{items[0].type}</span>}
                {items[0].episodes && <span style={chipSmall}>{items[0].episodes} ep</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/anime/mal-${items[0].malId}`} state={{ title: items[0].title, poster: items[0].poster, score: items[0].score, type: items[0].type, episodes: items[0].episodes, year: items[0].year }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>📖 Info</Link>
                <a href={`${STREAM}/anime/mal-${items[0].malId}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>▶ Tonton</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0 16px' }}>
        <button type="button" onClick={() => setLetter(null)} style={letter === null ? chipActive : chip}>Semua</button>
        {LETTERS.map((L) => (
          <button key={L} type="button" onClick={() => setLetter(L)} style={letter === L ? chipActive : chip}>{L}</button>
        ))}
      </div>

      <div style={gridStyle}>
        {shown.map((a) => (
          <article key={a.malId} style={anilistCard}>
            <Link to={`/anime/mal-${a.malId}`} state={{ title: a.title, poster: a.poster, score: a.score, type: a.type, episodes: a.episodes, year: a.year }} style={coverWrap}>
              <img src={a.poster} alt={a.title} loading="lazy" style={coverImg} />
              {a.score && <span style={{ ...scoreBadge, background: scoreColor(a.score) }}>{a.score}</span>}
            </Link>
            <Link to={`/anime/mal-${a.malId}`} style={{ textDecoration: 'none' }}>
              <h3 style={anilistTitle}>{a.title}</h3>
            </Link>
            <div style={{ display: 'flex', gap: 5, fontSize: 11, color: 'var(--color-text-dim)', marginTop: 2 }}>
              {a.type && <span>{a.type}</span>}
              {a.episodes && <span>· {a.episodes} ep</span>}
              {a.year && <span>· {a.year}</span>}
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




const chip = { padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)' };
const chipActive = { ...chip, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' };
const chipSmall = { fontSize: 12, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' };
const btnSm = { padding: '7px 14px', fontSize: 12 };

const gridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 14,
};
const anilistCard = { position: 'relative' };
const coverWrap = { position: 'relative', display: 'block', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' };
const coverImg = { width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', display: 'block' };
const anilistTitle = {
  fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)', margin: '7px 0 0',
  lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
};
const scoreBadge = {
  position: 'absolute', top: 6, right: 6, color: '#fff', fontWeight: 800, fontSize: 11,
  padding: '3px 7px', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
};
function scoreColor(s) {
  if (s >= 8) return '#4CAF50'; // green
  if (s >= 7) return '#8BC34A';
  if (s >= 6) return '#FFC107'; // yellow
  if (s >= 5) return '#FF9800';
  return '#F44336';
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '18px 0 26px' }}>
        <span style={{ fontSize: 12, opacity: 0.6 }}>👀 Pengunjung:</span>
        <img src="https://count.getloli.com/get/@nusanime-web?theme=moebooru" alt="jumlah pengunjung" style={{ height: 28 }} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
      }
