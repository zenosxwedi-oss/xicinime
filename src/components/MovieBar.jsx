import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonAnimeGrid } from './Skeleton';
import './MovieBar.css';

const API = '/javapi-proxy';
const CATS = [
  { kind: 'popular', label: '🔥 Populer' },
  { kind: 'trending', label: '📈 Trending' },
  { kind: 'top_rated', label: '⭐ Terbaik' },
  { kind: 'now_playing', label: '🆕 Baru' },
  { kind: 'upcoming', label: '📅 Segera' },
];

export default function MovieBar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cat, setCat] = useState('popular');
  const [genreId, setGenreId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetch(API + '/movie2/genres').then(r => r.json()).then(d => setGenres(d.items || d.genres || [])).catch(() => {}); }, []);

  const load = useCallback(async (kind, gid, query, pageNum) => {
    try {
      if (pageNum === 1) { setLoading(true); setError(null); } else setLoadingMore(true);
      let url;
      if (query) url = `${API}/movie2/search?q=${encodeURIComponent(query)}&page=${pageNum}`;
      else if (gid) url = `${API}/movie2/genre?id=${gid}&page=${pageNum}`;
      else url = `${API}/movie2/list?kind=${kind}&page=${pageNum}`;
      const d = await (await fetch(url)).json();
      const arr = d.items || [];
      setItems(prev => pageNum === 1 ? arr : [...prev, ...arr]);
      setHasMore(arr.length >= 18);
    } catch { setError('Gagal memuat. Coba lagi.'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { setQ(''); load(cat, genreId, '', 1); setPage(1); }, [cat, genreId, load]);

  const onSearch = (e) => {
    e.preventDefault();
    const v = q.trim();
    if (v) { load(null, null, v, 1); setPage(1); }
  };

  return (
    <div className="moviebar-page main-container">
      <header className="page-header section section-neo">
        <h1 className="main-title text-gradient">🎬 Movie Bar</h1>
        <p className="subtitle">Nonton movie sub Indonesia — katalog lengkap, player tanpa iklan.</p>
        <form onSubmit={onSearch} className="moviebar-search">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari movie… (mis. Batman)" />
          <button type="submit">Cari</button>
        </form>
        <div className="moviebar-chips">
          {CATS.map(c => (
            <button key={c.kind} className={c.kind === cat && !genreId && !q ? 'chip active' : 'chip'} onClick={() => { setQ(''); setGenreId(null); setCat(c.kind); }}>{c.label}</button>
          ))}
        </div>
        <div className="moviebar-chips moviebar-genres">
          {genres.map(g => (
            <button key={g.id} className={g.id === genreId ? 'chip active' : 'chip'} onClick={() => { setQ(''); setGenreId(g.id === genreId ? null : g.id); }}>{g.name}</button>
          ))}
        </div>
      </header>
      {error && <div className="section section-neo"><p>{error}</p></div>}
      {loading ? (
        <section className="section section-neo"><SkeletonAnimeGrid count={12} /></section>
      ) : (
        <section className="section section-neo">
          <div className="anime-grid">
            {items.map(it => (
              <Link to={`/moviebar/${it.tmdbId}`} key={it.tmdbId} className="anime-card">
                <div className="anime-card-poster">
                  <img src={it.poster} alt={it.title} loading="lazy" />
                  {it.rating ? <span className="moviebar-rating">★ {Number(it.rating).toFixed(1)}</span> : null}
                </div>
                <div className="anime-card-info">
                  <h3>{it.title}</h3>
                  <span>{it.year || ''}</span>
                </div>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="moviebar-more">
              <button className="btn-primary" disabled={loadingMore} onClick={() => { const n = page + 1; setPage(n); load(cat, genreId, q.trim() || null, n); }}>
                {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
