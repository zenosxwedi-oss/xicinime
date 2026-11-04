import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './MovieBar.css';

const API = '/javapi-proxy';

export default function MovieBarWatch() {
  const { tmdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [state, setState] = useState('idle'); // idle|resolving|playing|error
  const [err, setErr] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    setMovie(null); setState('idle'); setShowPlayer(false);
    fetch(`${API}/movie2/detail?id=${tmdbId}`).then(r => r.json()).then(setMovie).catch(() => setErr('Gagal memuat detail'));
  }, [tmdbId]);

  const play = async () => {
    setState('resolving'); setErr('');
    try {
      const d = await (await fetch(`${API}/movie/play?imdb=${movie.imdbId}`)).json();
      if (!d.m3u8) throw new Error('Stream tidak tersedia');
      setState('playing');
      setShowPlayer(true);
      const src = `${API}${d.m3u8}`;
      setTimeout(async () => {
        const v = boxRef.current?.querySelector('video');
        if (!v) return;
        if (v.canPlayType('application/vnd.apple.mpegurl')) {
          v.src = src; v.play().catch(() => {});
          return;
        }
        const { default: Hls } = await import('hls.js');
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(v);
          hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}));
          hls.on(Hls.Events.ERROR, (_e, data) => { if (data.fatal) { setErr('Stream terputus, coba lagi.'); setState('error'); } });
        } else {
          v.src = src;
        }
      }, 80);
    } catch (e) {
      setState('error'); setErr(e?.message || 'Gagal memuat stream');
    }
  };

  useEffect(() => () => { hlsRef.current?.destroy?.(); playerRef.current?.dispose?.(); }, []);

  if (err && !movie) return <div className="moviebar-page main-container"><p>Gagal memuat.</p></div>;
  if (!movie) return <div className="moviebar-page main-container"><p>Memuat…</p></div>;

  return (
    <div className="moviebar-watch main-container">
      <div className="moviebar-hero" style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}>
        <div className="moviebar-hero-inner">
          <img className="moviebar-poster" src={movie.poster} alt={movie.title} />
          <div className="moviebar-meta">
            <h1>{movie.title}</h1>
            <p className="moviebar-sub">{[movie.year, movie.runtime ? movie.runtime + ' menit' : null, movie.rating ? '★ ' + Number(movie.rating).toFixed(1) : null].filter(Boolean).join(' • ')}</p>
            <div className="moviebar-tags">{(movie.genres || []).map(g => <span key={g}>{g}</span>)}</div>
            {!showPlayer && (
              <button className="btn-primary moviebar-playbtn" onClick={play} disabled={state === 'resolving'}>
                {state === 'resolving' ? 'Menyiapkan stream…' : '▶ Tonton Sekarang'}
              </button>
            )}
            {state === 'error' && <p className="moviebar-err">{err} — coba lagi nanti.</p>}
          </div>
        </div>
      </div>
      <div ref={boxRef} className="section section-neo">
        {showPlayer && (
          <div className="moviebar-player-box">
            <video controls playsInline style={{ width: '100%', borderRadius: 12, background: '#000' }} />
          </div>
        )}
      </div>
      <div className="section section-neo">
        <p className="moviebar-overview">{movie.overview}</p>
        <Link to="/moviebar" className="moviebar-back">← Kembali ke Movie Bar</Link>
      </div>
    </div>
  );
}
