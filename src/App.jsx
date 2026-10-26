import { lazy, Suspense } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Home from './components/Home'
const DbHome = lazy(() => import('./components/DbHome'))
import Header from './components/Header'
import './App.css'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import InstallBanner from './components/InstallBanner'
import MaintenancePage from './components/MaintenancePage'

const IS_MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

// Site mode: 'stream' = full streaming site (anime.nusanime.web.id)
//            'db'     = MAL-style database (nusanime.web.id) — watch buttons go to the stream site
export const SITE_MODE = import.meta.env.VITE_SITE_MODE ||
  (typeof window !== 'undefined' && window.location.hostname === 'nusanime.web.id' ? 'db' : 'stream')
export const STREAM_BASE = 'https://anime.nusanime.web.id'

function WatchRedirect() {
  const { episodeId } = useParams()
  if (typeof window !== 'undefined') {
    window.location.replace(`${STREAM_BASE}/watch/${episodeId}`)
  }
  return null
}

// Code-split the heavy / less-frequent routes. The video player
// pulls in @videojs/react which is by far the biggest dep.
const Ongoing = lazy(() => import('./components/Ongoing'))
const Completed = lazy(() => import('./components/Completed'))
const DonghuaOngoing = lazy(() => import('./components/DonghuaOngoing'))
const DonghuaCompleted = lazy(() => import('./components/DonghuaCompleted'))
const DonghuaDetail = lazy(() => import('./components/DonghuaDetail'))
const DonghuaGenres = lazy(() => import('./components/DonghuaGenres'))
const DonghuaGenreFilter = lazy(() => import('./components/DonghuaGenreFilter'))
const DonghuaAZList = lazy(() => import('./components/DonghuaAZList'))
const UnifiedSearch = lazy(() => import('./components/UnifiedSearch'))
const AnimeDetail = lazy(() => import('./components/AnimeDetail'))
const Watch = lazy(() => import('./components/Watch'))
const Genres = lazy(() => import('./components/Genres'))
const AZList = lazy(() => import('./components/AZList'))
const Schedule = lazy(() => import('./components/Schedule'))
const WatchHistory = lazy(() => import('./components/WatchHistory'))
const Download = lazy(() => import('./components/Download'))
    const Movie = lazy(() => import('./components/Movie'))
    const LiveAction = lazy(() => import('./components/LiveAction'))

const RouteFallback = () => (
  <div className="loading-container main-container" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true" />
    <p>Memuat halaman...</p>
  </div>
);

function App() {
  if (IS_MAINTENANCE) {
    return <MaintenancePage />;
  }

  return (
    <ThemeProvider>
      <a href="#main-content" className="skip-link">Lewati ke konten</a>
      <div className="app">
        <div className="floating-shapes" aria-hidden="true">
          <div className="floating-shape floating-shape--1"></div>
          <div className="floating-shape floating-shape--2"></div>
          <div className="floating-shape floating-shape--3"></div>
        </div>
        <Header />
        <InstallBanner />
        <main id="main-content">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={SITE_MODE === 'db' ? <DbHome /> : <Home />} />
                <Route path="/ongoing" element={<Ongoing />} />
                <Route path="/completed" element={<Completed />} />
                <Route path="/donghua-ongoing" element={<DonghuaOngoing />} />
                <Route path="/donghua-completed" element={<DonghuaCompleted />} />
                <Route path="/donghua-genres" element={<DonghuaGenres />} />
                <Route path="/donghua-genre/:slug" element={<DonghuaGenreFilter />} />
                <Route path="/donghua-az" element={<DonghuaAZList />} />
                <Route path="/donghua/:slug" element={<DonghuaDetail />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/az-list" element={<AZList />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/history" element={<WatchHistory />} />
                <Route path="/search" element={<UnifiedSearch />} />
                <Route path="/anime/:animeId" element={<AnimeDetail />} />
                <Route path="/anime/:provider/:animeId" element={<AnimeDetail />} />
                <Route path="/watch/:episodeId" element={SITE_MODE === 'db' ? <WatchRedirect /> : <Watch />} />
                <Route path="/download" element={<Download />} />
                  <Route path="/movie" element={<Movie />} />
                  <Route path="/live-action" element={<LiveAction />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App
