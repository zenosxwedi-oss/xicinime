import { useState, useEffect, useCallback } from 'react';
    import { animeAPI } from '../services/api';
    import { SkeletonAnimeGrid } from './Skeleton';
    import AnimeCard from './AnimeCard';
    import Footer from './Footer';

    const normalizeAnimekompi = (item) => ({
    ...item, animeId: item.slug, episodes: item.episode || item.type || '', provider: 'animekompi',
    });

    const LiveAction = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = useCallback(async (pageNum) => {
      try {
        if (pageNum === 1) setLoading(true); else setLoadingMore(true);
        const res = await animeAPI.getAnimekompiTokusatsu(pageNum).catch(() => null);
        const fetched = (res?.data || []).map(normalizeAnimekompi);
        setItems(prev => pageNum === 1 ? fetched : [...prev, ...fetched]);
        setHasMore(res?.pagination?.hasNextPage ?? fetched.length >= 12);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat live action');
      } finally {
        setLoading(false); setLoadingMore(false);
      }
    }, []);

    useEffect(() => { fetchData(1); }, [fetchData]);
    const loadMore = () => { const next = page + 1; setPage(next); fetchData(next); };

    if (loading) return (
      <div className="anime-list-page main-container">
        <header className="page-header section section-neo">
          <h1 className="main-title text-gradient">Live Action &amp; Tokusatsu</h1>
          <p className="subtitle">Daftar live action &amp; tokusatsu dari AnimeKompi.</p>
        </header>
        <section className="section section-neo"><SkeletonAnimeGrid count={12} /></section>
      </div>
    );

    if (error && items.length === 0) return (
      <div className="anime-list-page main-container">
        <section className="section section-neo">
          <div className="error-container">
            <div className="error-icon" aria-hidden>⚠️</div>
            <p className="error-message">Gagal memuat: {error}</p>
            <button type="button" className="btn btn-primary" onClick={() => fetchData(1)}>Coba Lagi</button>
          </div>
        </section>
      </div>
    );

    return (
      <div className="anime-list-page main-container">
        <header className="page-header section section-neo">
          <h1 className="main-title text-gradient">Live Action &amp; Tokusatsu</h1>
          <p className="subtitle">Live action &amp; tokusatsu dari AnimeKompi.</p>
          {error && <p className="error-message">{error}</p>}
        </header>
        <section className="section section-neo">
          <div className="anime-grid">
            {items.map((anime, idx) => (
              <AnimeCard key={anime.animeId ?? idx} anime={anime} index={idx} providerHint="AnimeKompi" />
            ))}
          </div>
        </section>
        {loadingMore && <div className="loading-more"><div className="spinner" aria-hidden /><p>Memuat lebih banyak...</p></div>}
        {hasMore && !loadingMore && items.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <button type="button" className="btn btn-primary" onClick={loadMore}>Muat Lebih Banyak</button>
          </div>
        )}
        {!hasMore && items.length > 0 && <div className="end-message"><p>Tidak ada lagi live action untuk dimuat</p></div>}
        <Footer />
      </div>
    );
    };

    export default LiveAction;
    