import { useState, useEffect, useCallback } from 'react';
    import { animeAPI } from '../services/api';
    import { SkeletonAnimeGrid } from './Skeleton';
    import AnimeCard from './AnimeCard';
    import Footer from './Footer';

    const normalizeAnimekompi = (item) => ({
    ...item, animeId: item.slug, episodes: item.episode || item.type || 'Movie', provider: 'animekompi',
    });
    const normalizeSamehadaku = (item) => ({ ...item, provider: 'samehadaku' });

    const Movie = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchMovies = useCallback(async (pageNum) => {
      try {
        if (pageNum === 1) setLoading(true); else setLoadingMore(true);
        const [animekompiRes, sameRes] = await Promise.all([
          animeAPI.getAnimekompiMovie(pageNum).catch(() => null),
          pageNum === 1 ? animeAPI.getSamehadakuMovies().catch(() => null) : Promise.resolve(null),
        ]);
        const animekompiItems = (animekompiRes?.data || []).map(normalizeAnimekompi);
        const sameItems = pageNum === 1 ? (sameRes?.data?.animeList || []).map(normalizeSamehadaku) : [];
        const merged = [...animekompiItems, ...sameItems].filter(
          (item, i, arr) => arr.findIndex(x => x.animeId === item.animeId) === i
        );
        setMovies(prev => pageNum === 1 ? merged : [...prev, ...animekompiItems]);
        setHasMore(animekompiRes?.pagination?.hasNextPage ?? animekompiItems.length >= 12);
      } catch (err) {
        setError(err?.message ?? 'Gagal memuat movie');
      } finally {
        setLoading(false); setLoadingMore(false);
      }
    }, []);

    useEffect(() => { fetchMovies(1); }, [fetchMovies]);
    const loadMore = () => { const next = page + 1; setPage(next); fetchMovies(next); };

    if (loading) return (
      <div className="anime-list-page main-container">
        <header className="page-header section section-neo">
          <h1 className="main-title text-gradient">Movie Anime</h1>
          <p className="subtitle">Movie anime terbaru dari AnimeKompi &amp; Samehadaku.</p>
        </header>
        <section className="section section-neo"><SkeletonAnimeGrid count={12} /></section>
      </div>
    );

    if (error && movies.length === 0) return (
      <div className="anime-list-page main-container">
        <section className="section section-neo">
          <div className="error-container">
            <div className="error-icon" aria-hidden>⚠️</div>
            <p className="error-message">Gagal memuat movie: {error}</p>
            <button type="button" className="btn btn-primary" onClick={() => fetchMovies(1)}>Coba Lagi</button>
          </div>
        </section>
      </div>
    );

    return (
      <div className="anime-list-page main-container">
        <header className="page-header section section-neo">
          <h1 className="main-title text-gradient">Movie Anime</h1>
          <p className="subtitle">Movie anime terbaru dari AnimeKompi &amp; Samehadaku.</p>
          {error && <p className="error-message">{error}</p>}
        </header>
        <section className="section section-neo">
          <div className="anime-grid">
            {movies.map((anime, idx) => (
              <AnimeCard
                key={anime.animeId ?? idx} anime={anime} index={idx}
                statusOverride="Completed"
                providerHint={anime.provider === 'samehadaku' ? 'Samehadaku' : 'AnimeKompi'}
              />
            ))}
          </div>
        </section>
        {loadingMore && <div className="loading-more"><div className="spinner" aria-hidden /><p>Memuat lebih banyak...</p></div>}
        {hasMore && !loadingMore && movies.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <button type="button" className="btn btn-primary" onClick={loadMore}>Muat Lebih Banyak</button>
          </div>
        )}
        {!hasMore && movies.length > 0 && <div className="end-message"><p>Tidak ada lagi movie untuk dimuat</p></div>}
        <Footer />
      </div>
    );
    };

    export default Movie;
    