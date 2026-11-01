import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchHdPoster, getCachedHdPoster } from '../utils/hdPoster';

// Browse by genre (db mode): samehadaku real API. Genre grid -> anime list with type filter (TV/Movie/OVA) -> detail -> stream.
const BASE = 'https://www.sankavollerei.web.id/anime/samehadaku';
const TYPES = [
  { key: 'all', label: 'Semua' },
  { key: 'TV', label: 'TV' },
  { key: 'Movie', label: 'Movie' },
  { key: 'OVA', label: 'OVA' },
  { key: 'ONA', label: 'ONA' },
  { key: 'Special', label: 'Special' },
];

async function fetchJson(url, timeout = 10000) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const txt = JSON.stringify(j);
    if (!txt || txt.length < 20) throw new Error('empty');
    return j;
  } finally {
    clearTimeout(to);
  }
}

async function fetchWithFallback(url) {
  try {
    return await fetchJson(url);
  } catch {
    const t = await fetch('https://r.jina.ai/' + url).then((r) => (r.ok ? r.text() : Promise.reject(r.status)));
    const s = t.indexOf('{');
    const e = t.lastIndexOf('}');
    if (s < 0) throw new Error('no json');
    return JSON.parse(t.slice(s, e + 1));
  }
}

function Poster({ url, title }) {
  const [src, setSrc] = useState(() => (url && !/otakudesu|anichin/.test(url)) ? url : null);
  useEffect(() => {
    let dead = false;
    if (!src && title) {
      const cached = getCachedHdPoster(title);
      if (cached) { setSrc(cached); return; }
      fetchHdPoster(title).then((u) => { if (!dead && u) setSrc(u); });
    }
    return () => { dead = true; };
  }, [src, title]);
  if (!src) {
    return (
      <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8, fontSize: 12, color: '#aaa', background: 'linear-gradient(135deg,#1b1b26,#23232f)' }}>
        🎬<br />{title}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: 10, background: '#15151d' }}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
  );
}

const DbGenres = () => {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const [genres, setGenres] = useState(null);
  const [type, setType] = useState('all');
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let dead = false;
    fetchWithFallback(`${BASE}/genres`)
      .then((j) => { if (!dead) setGenres(j?.data?.genreList || []); })
      .catch(() => { if (!dead) setGenres([]); });
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    if (!genreId) { setList(null); setError(null); return; }
    let dead = false;
    setLoading(true); setError(null); setList(null);
    fetchWithFallback(`${BASE}/genres/${encodeURIComponent(genreId)}`)
      .then((j) => { if (!dead) setList(j?.data?.animeList || []); })
      .catch(() => { if (!dead) setError('Gagal memuat genre ini — coba lagi.'); })
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, [genreId]);

  const filtered = (list || []).filter((a) => type === 'all' || (a.type || '').toLowerCase() === type.toLowerCase());

  return (
    <div style={{ padding: '20px 16px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {!genreId ? (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>🎭 Genre Anime</h1>
          <p style={{ color: '#999', margin: '0 0 16px' }}>Pilih genre — klik untuk melihat daftar anime, lanjut sampai episode streaming.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(genres || []).map((g) => (
              <button
                key={g.genreId}
                onClick={() => navigate(`/genre/${g.genreId}`)}
                style={{
                  border: 'none', cursor: 'pointer', borderRadius: 999, padding: '8px 16px',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                {g.title}
              </button>
            ))}
            {genres && genres.length === 0 && <p style={{ color: '#f66' }}>Gagal memuat daftar genre.</p>}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <button onClick={() => navigate('/genre')} style={{ border: 'none', background: 'none', color: 'var(--color-primary,#e11d48)', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>← Genre</button>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>{genreId.replace(/-/g, ' ')}</h1>
          </div>

          {/* Type filter tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 0 14px', scrollbarWidth: 'none' }}>
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                style={{
                  flexShrink: 0, border: 'none', cursor: 'pointer', borderRadius: 999,
                  padding: '7px 14px', fontSize: 12.5, fontWeight: 700,
                  background: type === t.key ? 'var(--color-primary,#e11d48)' : 'rgba(255,255,255,0.07)',
                  color: '#fff',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && <p style={{ color: '#999' }}>Memuat anime…</p>}
          {error && <p style={{ color: '#f66' }}>{error}</p>}
          {!loading && !error && (
            filtered.length === 0 ? (
              <p style={{ color: '#999' }}>Tidak ada judul untuk filter ini di genre {genreId.replace(/-/g, ' ')}.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
                {filtered.map((a, i) => {
                  const slug = a.animeId || (a.href || '').split('/').filter(Boolean).pop();
                  return (
                    <Link
                      key={i}
                      to={slug ? `/anime/${slug}` : '#'}
                      state={{ item: a }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Poster url={a.poster} title={a.title} />
                      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>
                        {[a.type, (a.score || '').replace('★ ', '⭐ ')].filter(Boolean).join(' · ')}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default DbGenres;
