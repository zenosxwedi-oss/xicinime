import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// AniList-style detail for nusanime.web.id (db). malId from route "mal-123" or local slug.
const JIKAN = 'https://api.jikan.moe/v4';
const STREAM = 'https://anime.nusanime.web.id';

export default function DbDetail() {
  const { animeId } = useParams();
  const malId = (animeId || '').replace(/^mal-/, '');
  const pre = (typeof window !== 'undefined' && window.history?.state?.usr) || {};
  const [a, setA] = useState(pre.title ? {
    title: pre.title, title_english: null, score: pre.score, rank: null,
    type: pre.type, episodes: pre.episodes, status: null, duration: null,
    season: null, year: pre.year, studios: [], producers: [], genres: [],
    synopsis: null, images: { jpg: { large_image_url: pre.poster, image_url: pre.poster } },
  } : null);
  const [eps, setEps] = useState([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let dead = false;
    const isNumeric = /^\d+$/.test(malId);
    (async () => {
      // 1) Jikan (MAL) if numeric
      if (isNumeric) {
        try {
          const ctl = new AbortController();
          const to = setTimeout(() => ctl.abort(), 8000);
          let r = await fetch(`${JIKAN}/anime/${malId}/full`, { signal: ctl.signal });
          clearTimeout(to);
          if (r.status === 429) { await new Promise((res) => setTimeout(res, 1200)); r = await fetch(`${JIKAN}/anime/${malId}/full`); }
          const j = await r.json();
          if (j?.data && !dead) setA(j.data);
          try {
            const c2 = new AbortController();
            const t2 = setTimeout(() => c2.abort(), 5000);
            const r2 = await fetch(`${JIKAN}/anime/${malId}/episodes`, { signal: c2.signal });
            clearTimeout(t2);
            const j2 = await r2.json();
            if (!dead) setEps(j2?.data || []);
          } catch {}
        } catch {}
      }
      // 2) fallback: samehadaku (3x, flaky)
      if (!a && !dead) {
        let got = false;
        for (let i = 0; i < 3 && !got && !dead; i++) {
          try {
            const r2 = await fetch(`https://www.sankavollerei.web.id/anime/samehadaku/anime/${malId.replace(/^mal-/, '')}`, { headers: { Accept: 'application/json' } });
            const j2 = await r2.json();
            const d = j2?.data;
            if (d) {
              got = true;
              setA({
                title: d.title, title_english: d.english || null,
                score: typeof d.score === 'object' ? d.score?.value : d.score, rank: null,
                type: d.type, episodes: d.episodes ? Number(d.episodes) : null, status: d.status,
                duration: d.duration, season: d.season, year: null,
                studios: (d.studios || '').split(',').filter(Boolean).map((s) => ({ name: s.trim() })),
                producers: (d.producers || '').split(',').filter(Boolean).map((s) => ({ name: s.trim() })),
                aired: { string: d.aired || d.releasedOn },
                genres: (d.genreList || []).map((g, i) => ({ mal_id: i, name: g.title ?? g })),
                synopsis: typeof d.synopsis === 'object' && d.synopsis !== null
                  ? (d.synopsis.paragraphs || []).join('\n\n')
                  : d.synopsis,
                images: { jpg: { large_image_url: d.poster, image_url: d.poster } },
              });
            }
          } catch {}
          if (!got) await new Promise((r) => setTimeout(r, 900));
        }
        if (!got && !dead) setErr(true);
      }
    })();
    return () => { dead = true; };
  }, [malId]);

  if (err) return (
    <div className="main-container" style={{ padding: 40, textAlign: 'center' }}>
      <p>Gagal memuat data anime.</p>
      <a href="/" className="btn btn-primary">🏠 Ke Beranda</a>
    </div>
  );
  if (!a) return (
    <div className="main-container" style={{ maxWidth: 900, margin: '0 auto', padding: '20px 12px' }}>
      <div style={{ height: 260, borderRadius: 16, background: 'linear-gradient(110deg, var(--color-surface) 30%, var(--color-surface-raised, rgba(255,255,255,0.07)) 50%, var(--color-surface) 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <p style={{ color: 'var(--color-text-dim)', fontSize: 13, textAlign: 'center', marginTop: 14 }}>Memuat detail…</p>
    </div>
  );

  const total = a.episodes || eps.length || 0;
  const banner = a.images?.jpg?.large_image_url;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 12px 40px' }}>
      {/* AniList-style banner header */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden', marginTop: 12,
        background: 'linear-gradient(135deg, var(--color-surface), rgba(0,0,0,0.5))',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', gap: 18, padding: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <img src={banner} alt={a.title}
            style={{ width: 150, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 4px', lineHeight: 1.2 }}>{a.title}</h1>
            {a.title_english && a.title_english !== a.title && (
              <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>{a.title_english}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {a.score && (
                <span style={{ ...scoreCircle, borderColor: scoreColor(a.score), color: scoreColor(a.score) }}>
                  {a.score}<small style={{ fontSize: 9, marginLeft: 1 }}>/10</small>
                </span>
              )}
              {a.type && <span style={pill}>{a.type}</span>}
              {a.episodes && <span style={pill}>{a.episodes} Episode</span>}
              {a.status && <span style={pill}>{a.status}</span>}
              {a.season && <span style={pill}>{a.season}</span>}
              {a.duration && <span style={pill}>{a.duration}</span>}
            </div>
            <a href={`${STREAM}/anime/mal-${malId}`} className="btn btn-primary"
              style={{ display: 'inline-flex', marginTop: 14, padding: '13px 30px', fontWeight: 800, fontSize: 15 }}>
              ▶ Tonton Sekarang
            </a>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 10, margin: '16px 0',
      }}>
        {a.studios?.length > 0 && <InfoBox label="Studio" value={a.studios.map((s) => s.name).join(', ')} />}
        {a.producers?.length > 0 && <InfoBox label="Producer" value={a.producers.map((s) => s.name).join(', ')} />}
        {a.aired?.string && <InfoBox label="Tayang" value={a.aired.string} />}
        {a.rank && <InfoBox label="Rank" value={'#' + a.rank} />}
        {a.popularity && <InfoBox label="Popularity" value={'#' + a.popularity} />}
        {a.members && <InfoBox label="Members" value={a.members.toLocaleString('id')} />}
      </div>

      {/* Genres */}
      {(a.genres || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {a.genres.map((g) => <span key={g.mal_id} style={genreChip}>{g.name}</span>)}
        </div>
      )}

      {/* Synopsis */}
      <section style={card}>
        <h2 style={h2}>📖 Sinopsis</h2>
        {(a.synopsis || 'Tidak ada sinopsis.').split('\n').filter(Boolean).map((p, i) => (
          <p key={i} style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>{p}</p>
        ))}
      </section>

      {/* Episodes 1..N with Tonton */}
      <section style={card}>
        <h2 style={h2}>🎬 Daftar Episode{total ? ` (${total})` : ''}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginTop: 12 }}>
          {(eps.length > 0
            ? eps.map((e) => ({ num: e.mal_id, title: e.title }))
            : Array.from({ length: total || 0 }, (_, i) => ({ num: i + 1, title: null }))
          ).map((e) => (
            <a key={e.num} href={`${STREAM}/anime/mal-${malId}`}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                padding: '11px 13px', borderRadius: 10, textDecoration: 'none',
                background: 'var(--color-surface-raised, rgba(255,255,255,0.04))',
                border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13,
              }}>
              <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Ep {e.num}{e.title ? ` — ${e.title}` : ''}
              </span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800, flexShrink: 0 }}>▶</span>
            </a>
          ))}
          {!eps.length && !total && <p style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>Belum ada info episode.</p>}
        </div>
      </section>

      <p style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 16, textAlign: 'center' }}>
        Data dari MyAnimeList (Jikan API) · Streaming di anime.nusanime.web.id
      </p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-text-dim)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginTop: 3 }}>{value}</div>
    </div>
  );
}

const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 18, marginBottom: 16 };
const h2 = { fontSize: '1.1rem', fontWeight: 800, margin: 0 };
const pill = { fontSize: 12, padding: '4px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', display: 'inline-block' };
const genreChip = { fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(var(--color-primary-rgb, 147,51,234),0.12)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 };
const scoreCircle = {
  display: 'inline-flex', alignItems: 'baseline', fontWeight: 900, fontSize: 16,
  border: '2.5px solid', borderRadius: 999, padding: '8px 14px', background: 'rgba(0,0,0,0.3)',
};
const scoreColor = (s) => (s >= 8 ? '#4CAF50' : s >= 7 ? '#8BC34A' : s >= 6 ? '#FFC107' : s >= 5 ? '#FF9800' : '#F44336');
