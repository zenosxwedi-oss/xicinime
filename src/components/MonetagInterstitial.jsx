import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Monetag interstitial (mobile fullscreen) — re-serves on every SPA navigation,
// Monetag internally frequency-caps per user (typically ~1/minute), so this is safe.
const MONETAG_ZONE = '6065794';
const MIN_INTERVAL_MS = 60 * 1000; // at most once per minute

let lastShown = 0;

const MonetagInterstitial = () => {
  const location = useLocation();

  useEffect(() => {
    const now = Date.now();
    if (now - lastShown < MIN_INTERVAL_MS) return;
    lastShown = now;
    try {
      // ensure provider script
      if (!document.querySelector('script[src*="pemsrv.com/ad-provider.js"]')) {
        const s = document.createElement('script');
        s.src = 'https://a.pemsrv.com/ad-provider.js';
        s.async = true;
        document.body.appendChild(s);
      }
      // serve interstitial
      (window.AdProvider = window.AdProvider || []).push({ serve: {} });
    } catch {}
  }, [location.pathname]);

  return null;
};

export default MonetagInterstitial;
