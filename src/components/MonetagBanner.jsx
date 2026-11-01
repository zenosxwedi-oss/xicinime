import { useEffect } from 'react';

// Monetag banner container (streaming site only). The zone script loaded in
// index.html (5gvci.com tag.min.js) fills formats enabled for the zone.
export default function MonetagBanner({ style = {} }) {
  useEffect(() => {
    const h = location.hostname;
    if (h !== 'anime.nusanime.web.id') return;
    // notify zone script a new banner slot is available (Monetag re-scans DOM)
    try { window.dispatchEvent(new Event('monetag:refresh')); } catch {}
  }, []);
  if (location.hostname !== 'anime.nusanime.web.id') return null;
  return (
    <div
      className="monetag-banner"
      style={{ margin: '16px auto', minHeight: 120, maxWidth: 480, textAlign: 'center', ...style }}
    />
  );
}
