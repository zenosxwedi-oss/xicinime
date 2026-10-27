import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeAPI, APIError } from '../services/api';

const PROVIDER_ORDER = ['otakudesu', 'samehadaku', 'stream'];
const BATCH_SIZE = 100;

const AnimeDetail = () => {
  const { animeId, provider: providerParam } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchUrl, setBatchUrl] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [providerUsed, setProviderUsed] = useState(null);
  const [episodeBatch, setEpisodeBatch] = useState(0);

  useEffect(() => {
    setEpisodeBatch(0);
    const fetchAnimeData = async () => {
      setLoading(true);
      setError(null);
      setAnime(null);

      const initialProvider = (providerParam || 'otakudesu').toLowerCase();
      const startIndex = PROVIDER_ORDER.indexOf(initialProvider);
      const orderedProviders = startIndex >= 0
        ? [...PROVIDER_ORDER.slice(startIndex), ...PROVIDER_ORDER.slice(0, startIndex)]
        : PROVIDER_ORDER;

      const fetchByProvider = async (prov, id) => {
        // hard 10s timeout so a slow provider never hangs the page
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
        let res;
        if (prov === 'samehadaku') res = await Promise.race([animeAPI.getAnimeDetailSamehadaku(id), timeout]);
        else if (prov === 'stream') res = await Promise.race([animeAPI.getAnimeDetailStream(id), timeout]);
        else res = await Promise.race([animeAPI.getAnimeDetail(id), timeout]);
        return res;
      };

      let found = false;
      try {
        for (const prov of orderedProviders) {
          try {
            const data = await fetchByProvider(prov, animeId);
            const payload = data?.data || null;
            if (payload) {
              setAnime({ ...payload, __provider: prov });
              setProviderUsed(prov);
              found = true;
              break;
            }
          } catch (err) {
            // 404 = try next provider; network/timeout errors also try next provider
            continue;
          }
        }
        if (!found && !error) { setAnime(null); setError(null); }
      } finally { setLoading(false); }
    };
    fetchAnimeData();
  }, [animeId, providerParam]);

  useEffect(() => {
    if ((providerUsed || (providerParam || 'otakudesu').toLowerCase()) !== 'otakudesu') return;
    const extractBatchUrl = (val) => {
      if (!val) return null;
      if (typeof val === 'string' && val.startsWith('http')) return val;
      if (typeof val === 'object') {
        const u = val.url || val.batchUrl || val.downloadUrl || val.href;
        if (typeof u === 'string' && u.startsWith('http')) return u;
        if (Array.isArray(val)) {
          const first = val[0];
          if (typeof first === 'string') return first;
          if (first?.url) return first.url;
        }
        if (Array.isArray(val.list) && val.list[0]?.url) return val.list[0].url;
      }
      return null;
    };

    if (anime?.batch) {
      const url = extractBatchUrl(anime.batch);
      if (url) { setBatchUrl(url); return; }
    }
    const slugOrId = anime?.slug ?? anime?.animeId ?? animeId;
    if (!slugOrId) return;
    setBatchLoading(true);
    animeAPI.getBatch(slugOrId)
      .then((res) => {
        const url = extractBatchUrl(res?.data) || extractBatchUrl(res);
        if (url) setBatchUrl(url);
      })
      .catch(() => {})
      .finally(() => setBatchLoading(false));
  }, [anime?.slug, anime?.animeId, anime?.batch, animeId, providerUsed, providerParam]);

  if (loading) {
    return (
      <div className="loading-container main-container">
        <div className="spinner" aria-hidden />
        <p>Memuat detail anime...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-container main-container">
        <p className="error-message">Gagal memuat detail anime: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>Kembali ke Beranda</Link>
      </div>
    );
  }
  if (!anime) {
    return (
      <div className="error-container main-container">
        <div className="error-icon">🔍</div>
        <h2>Anime tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary">← Kembali ke Beranda</Link>
      </div>
    );
  }

  const batchLink = (typeof batchUrl === 'string' && batchUrl.startsWith('http')) ? batchUrl
    : (typeof anime?.batch === 'string' && anime.batch.startsWith('http')) ? anime.batch
    : null;
  const providerLabel = (() => {
    const p = (providerUsed || providerParam || 'otakudesu').toLowerCase();
    if (p === 'samehadaku') return 'Samehadaku';
    if (p === 'stream') return 'Stream';
    return 'Otakudesu';
  })();

  const episodeList = anime.episodeList ?? [];
  const totalEpisodes = anime.episodes ?? anime.episodeCount ?? episodeList.length;
  const getEpisodeNum = (ep) => {
    const num = ep.eps ?? ep.episodeNumber ?? ep.number ?? ep.title;
    const parsed = parseInt(num, 10);
    return isNaN(parsed) ? 999 : parsed;
  };
  const sortedEpisodeList = episodeList.slice().sort((a, b) => getEpisodeNum(a) - getEpisodeNum(b));
  const firstEpisode = sortedEpisodeList.length > 0 ? sortedEpisodeList[0] : null;
  const latestEpisode = sortedEpisodeList.length > 0 ? sortedEpisodeList[sortedEpisodeList.length - 1] : null;

  // Episode batch pagination
  const totalBatches = Math.ceil(sortedEpisodeList.length / BATCH_SIZE);
  const currentBatchEpisodes = sortedEpisodeList.slice(
    episodeBatch * BATCH_SIZE,
    (episodeBatch + 1) * BATCH_SIZE
  );

  return (
    <div className="anime-detail main-container" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link>
        <span> / </span>
        <span>{anime.title}</span>
      </nav>

      {/* Detail Header */}
      <div className="detail-header">
        <div className="detail-poster">
          <img
            src={anime.poster ?? anime.poster_url ?? ''}
            alt={anime.title ?? 'Poster'}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300/1a1a26/ff3e9a?text=No+Poster'; }}
          />
        </div>
        <div className="detail-info">
          <h1>{anime.title}</h1>
          <div className="detail-meta">
            <span className="detail-meta-item">📡 {providerLabel}</span>
            {anime.type && <span className="detail-meta-item">📺 {anime.type}</span>}
            {totalEpisodes > 0 && <span className="detail-meta-item">🎬 {totalEpisodes} Episode</span>}
            {anime.status && <span className="detail-meta-item">📊 {anime.status}</span>}
            {anime.duration && <span className="detail-meta-item">⏱️ {anime.duration}</span>}
            {anime.studios && <span className="detail-meta-item">🏢 {anime.studios}</span>}
            {anime.aired && <span className="detail-meta-item">📅 {anime.aired}</span>}
          </div>

          {anime.genreList?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {anime.genreList.map((genre, idx) => (
                <Link key={idx} to={`/genres?genre=${genre.genreId}`} className="detail-meta-item" style={{ textDecoration: 'none', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                  {genre.title}
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {firstEpisode?.episodeId && (
              <Link to={`/watch/${firstEpisode.episodeId}`} className="btn btn-secondary">
                ▶ Episode 1
              </Link>
            )}
            {latestEpisode?.episodeId && latestEpisode.episodeId !== firstEpisode?.episodeId && (
              <Link to={`/watch/${latestEpisode.episodeId}`} className="btn btn-primary">
                ▶ Episode Terbaru
              </Link>
            )}
            {(batchLink || batchLoading) && (
              batchLink ? (
                <a href={batchLink} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                  ⬇ Download Batch
                </a>
              ) : (
                <span className="btn btn-secondary" style={{ opacity: 0.6 }}>⬇ Memuat batch...</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div style={{ background: 'var(--color-surface)', border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Sinopsis</h2>
        {anime.synopsis?.paragraphs?.length > 0 ? (
          anime.synopsis.paragraphs.map((para, idx) => (
            <p key={idx} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: '1.7', marginBottom: '8px' }}>{para}</p>
          ))
        ) : (
          <p style={{ color: 'var(--color-text-dim)' }}>Sinopsis tidak tersedia.</p>
        )}
      </div>

      {/* Episode List */}
      {sortedEpisodeList.length > 0 && (
        <div className="episode-list">
          <div className="episode-list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>Daftar Episode ({sortedEpisodeList.length})</span>
            {latestEpisode?.episodeId && (
              <Link
                to={`/watch/${latestEpisode.episodeId}`}
                state={{ provider: providerUsed }}
                style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', background: 'rgba(var(--color-primary-rgb, 147,51,234),0.12)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--color-primary)' }}
              >
                ▶ Tonton Terbaru
              </Link>
            )}
          </div>

          {/* Batch navigation tabs — only show if > 100 episodes */}
          {totalBatches > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 12px', borderBottom: 'var(--border-width) solid var(--color-border)', background: 'var(--color-surface)' }}>
              {Array.from({ length: totalBatches }, (_, i) => {
                const start = i * BATCH_SIZE + 1;
                const end = Math.min((i + 1) * BATCH_SIZE, sortedEpisodeList.length);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEpisodeBatch(i)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: episodeBatch === i ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      background: episodeBatch === i ? 'var(--color-primary)' : 'transparent',
                      color: episodeBatch === i ? '#fff' : 'var(--color-text-muted)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: episodeBatch === i ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {start}–{end}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {currentBatchEpisodes.map((episode, idx) => (
              <Link
                key={episode.episodeId ?? idx}
                to={`/watch/${episode.episodeId}`}
                className="episode-item"
                state={{ provider: providerUsed }}
              >
                <span className="episode-title">
                  Episode {episode.eps ?? episode.episodeNumber ?? episode.title ?? (episodeBatch * BATCH_SIZE + idx + 1)}
                </span>
                {episode.date && <span className="episode-date">{episode.date}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeDetail;
