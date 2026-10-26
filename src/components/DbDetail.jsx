import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// MAL-style detail article for the database site. malId from route "mal-123".
const JIKAN = 'https://api.jikan.moe/v4';
const STREAM = 'https://anime.nusanime.web.id';

export default function DbDetail() {
  const { animeId } = useParams();
  const malId = (animeId || '').replace(/^mal-/, '');
  const [a, setA] = useState(null);
  const [eps, setEps] = useState([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      const isNumeric = /^\d+$/.test(malId);
      if (!isNumeric) {
        // not a MAL id — go straight to samehadaku fallback path
        // (reuse the catch block by triggering it)
      }
      try {
        if (!isNumeric) throw new Error('non-mal');
        const ctl = new AbortController();
        const to = setTimeout(() => ctl.abort(), 8000);
        const r = await fetch(`${JIKAN}/anime/${malId}/full`, { signal: ctl.signal });
        clearTimeout(to);
        const j = await r.json();
        if (!dead) setA(j?.data ?? null);
      } catch {
        // Jikan unreachable/invalid — fallback: samehadaku detail (retry 3x, API is flaky)
        const slug = malId.replace(/^mal-/, '');
        let got = false;
        for (let i = 0; i < 3; i++) {
          try {
            const r2 = await fetch(`https://www.sankavollerei.web.id/anime/samehadaku/anime/${slug}`, { headers: { Accept: 'application/json' } });
            const j2 = await r2.json();
            const d = j2?.data;
            if (d && !dead) {
            setA({
              title: d.title, title_english: null, score: d.score?.toString?.(), rank: null,
              type: d.type, episodes: d.episodes ? Number(d.episodes) : null, status: d.status,
              duration: d.duration, studios: d.studios ? d.studios.split(',').map((s) => ({ name: s.trim() })) : [],
              aired: { string: d.aired || d.releasedOn },
              genres: (d.genreList || []).map((g, i) => ({ mal_id: i, name: g.title ?? g })),
              synopsis: d.synopsis,
              images: { jpg: { large_image_url: d.poster, image_url: d.poster } },
            });
            } else if (!dead && i === 2) setErr(true);
            got = !!d;
          } catch { if (!dead && i === 2) setErr(true); }
          if (got) break;
          await new Promise((r) => setTimeout(r, 900));
        }
      }
      try {
        const r2 = await fetch(`${JIKAN}/anime/${malId}/episodes`);
        const j2 = await r2.json();
        if (!dead) setEps(j2?.data || []);
      } catch {}
    })();
    return () => { dead = true; };
  }, [malId]);

  if (err) return <div className="main-container"><p style={{ padding: 24 }}>Gagal memuat data.</p></div>;
  if (!a) return <div className="main-container"><p style={{ padding: 24, color: 'var(--color-text-muted)' }}>Memuat…</p></div>;

  const total = a.episodes || eps.length || 0;

  return (
    <div className="home-container main-container" style={{ maxWidth: 780 }}>
      {/* Article header */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <img src={a.images?.jpg?.large_image_url || a.images?.jpg?.image_url}
          alt={a.title} style={{ width: 180, borderRadius: 14 }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 8px' }}>{a.title}</h1>
          {a.title_english && a.title_english !== a.title && (
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, marginTop: -4 }}>{a.title_english}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
            {a.score && <span style={chip}>⭐ {a.score} / 10</span>}
            {a.rank && <span style={chip}>🏅 Rank #{a.rank}</span>}
            {a.type && <span style={chip}>📺 {a.type}</span>}
            {a.episodes && <span style={chip}>🎬 {a.episodes} Episode</span>}
            {a.status && <span style={chip}>{a.status}</span>}
            {a.duration && <span style={chip}>⏱️ {a.duration}</span>}
          </div>
          {a.studios?.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0' }}>
              🏢 Studio: {a.studios.map((s) => s.name).join(', ')}
            </p>
          )}
          {a.aired?.string && (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0' }}>📅 {a.aired.string}</p>
          )}
          {(a.genres || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
              {a.genres.map((g) => <span key={g.mal_id} style={{ ...chip, fontSize: 11 }}>{g.name}</span>)}
            </div>
          )}
          <a href={`${STREAM}/anime/mal-${malId}`} className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 10, padding: '12px 26px', fontWeight: 800 }}>
            ▶ Tonton Sekarang
          </a>
        </div>
      </div>

      {/* Synopsis article */}
      <section style={section}>
        <h2 style={h2}>Sinopsis</h2>
        {(a.synopsis || 'Tidak ada sinopsis.').split('\n').filter(Boolean).map((p, i) => (
          <p key={i} style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>{p}</p>
        ))}
      </section>

      {/* Episode list 1..N */}
      <section style={section}>
        <h2 style={h2}>Daftar Episode{total ? ` (${total})` : ''}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(eps.length > 0
            ? eps.map((e) => ({ num: e.mal_id, title: e.title, date: e.aired }))
            : Array.from({ length: total || 0 }, (_, i) => ({ num: i + 1, title: null, date: null }))
          ).map((e) => (
            <a key={e.num} href={`${STREAM}/anime/mal-${malId}`}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Episode {e.num}{e.title ? ` — ${e.title}` : ''}</span>
              <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>▶ Tonton</span>
            </a>
          ))}
          {!eps.length && !total && <p style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>Belum ada info episode.</p>}
        </div>
      </section>

      <p style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 16 }}>
        Data dari MyAnimeList (Jikan API) · Streaming di anime.nusanime.web.id
      </p>
    </div>
  );
}

const section = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 18, marginBottom: 16 };
const h2 = { fontSize: '1.1rem', fontWeight: 800, margin: 0 };
const chip = { fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', display: 'inline-block', margin: 2 };
