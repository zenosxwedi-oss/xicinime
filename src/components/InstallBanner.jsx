import { useState, useEffect } from 'react';

/**
 * App Download Banner — shows on mobile, links to native Xicinime app download.
 */
const InstallBanner = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('app_banner_dismissed')) return;
    // Only show on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;
    // Don't show if already in standalone/installed mode
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone) return;

    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('app_banner_dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 998,
      padding: '12px 16px',
      background: 'var(--color-surface)',
      borderTop: '2px solid var(--color-primary)',
      boxShadow: '0 -4px 20px rgba(147, 51, 234, 0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'fadeInUp 0.4s ease-out',
      backdropFilter: 'blur(12px)',
    }}>
      <img
        src="/logo.png"
        alt="Xicinime"
        style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>
          📱 Download App Xicinime
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
          Nonton lebih nyaman tanpa buka browser
        </div>
      </div>
      <a
        href="/download"
        style={{
          padding: '8px 16px',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.75rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Download
      </a>
      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none',
          color: 'var(--color-text-dim)',
          fontSize: '1.1rem', cursor: 'pointer',
          padding: '4px', lineHeight: 1, flexShrink: 0,
        }}
        aria-label="Tutup"
      >✕</button>
    </div>
  );
};

export default InstallBanner;
