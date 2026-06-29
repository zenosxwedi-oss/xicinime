import { useEffect, useState } from 'react';

const APK_URL = 'https://xicinime.my.id/xicinime.apk';
const APK_SIZE = '~25 MB';
const APP_VERSION = '1.0.0';

const FeatureItem = ({ icon, title, desc }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: 'var(--color-surface)', borderRadius: '12px',
    padding: '16px', border: '1px solid var(--color-border)',
  }}>
    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

const StepItem = ({ num, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: 'var(--color-primary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.85rem', color: '#fff',
    }}>{num}</div>
    <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{text}</span>
  </div>
);

const Download = () => {
  const [downloading, setDownloading] = useState(false);
  const [buildStatus, setBuildStatus] = useState(null);

  const handleDownload = () => {
    setDownloading(true);
    window.open(APK_URL, '_blank');
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="main-container" style={{ paddingTop: '24px', paddingBottom: '48px', maxWidth: '600px', margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <img src="/logo.png" alt="Xicinime" style={{ width: '90px', height: '90px', borderRadius: '22px', marginBottom: '16px', boxShadow: '0 8px 32px rgba(147,51,234,0.4)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', background: 'linear-gradient(135deg,#9333ea,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Xicinime App
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '6px' }}>
          Versi {APP_VERSION} • Android • {APK_SIZE}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
          Nonton anime sub indo gratis, lebih nyaman tanpa buka browser
        </p>
      </div>

      {/* Download button */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: downloading ? 'var(--color-surface)' : 'linear-gradient(135deg,#7c3aed,#9333ea)',
            color: '#fff', border: 'none', borderRadius: '14px',
            padding: '16px 36px', fontSize: '1.05rem', fontWeight: 800,
            cursor: downloading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(147,51,234,0.4)',
            transition: 'all 0.2s', letterSpacing: '0.3px',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>
            {downloading ? '⏳' : '⬇️'}
          </span>
          {downloading ? 'Mengunduh...' : 'Download APK Android'}
        </button>
        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
          Ukuran: {APK_SIZE} • Gratis • Tanpa iklan berlebihan
        </div>
      </div>

      {/* Install steps */}
      <div style={{ marginBottom: '32px', background: 'var(--color-surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>📋 Cara Install</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <StepItem num="1" text='Download APK dengan tombol di atas' />
          <StepItem num="2" text='Buka file manager → cari file "xicinime.apk" di folder Downloads' />
          <StepItem num="3" text='Tap file APK → jika muncul peringatan "Sumber tidak dikenal", tap Pengaturan → aktifkan "Izinkan dari sumber ini"' />
          <StepItem num="4" text='Tap Install → tunggu selesai → buka aplikasi Xicinime 🎉' />
        </div>
      </div>

      {/* Warning explanation */}
      <div style={{ marginBottom: '32px', background: 'rgba(245,158,11,0.08)', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(245,158,11,0.3)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', color: '#f59e0b' }}>
              Peringatan "File Berbahaya" dari Android
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Peringatan ini <strong>normal</strong> dan muncul untuk <strong>semua APK</strong> yang diinstall di luar Google Play Store — bukan berarti aplikasinya berbahaya.
              Kamu bisa tetap install dengan aman. Jika muncul Google Play Protect, tap <strong>"Tetap Install"</strong> atau <strong>"Install Anyway"</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>✨ Fitur Aplikasi</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <FeatureItem icon="🎬" title="Streaming Anime" desc="Nonton anime sub indo dari berbagai sumber — Otakudesu, Samehadaku, dan lainnya" />
        <FeatureItem icon="🔍" title="Pencarian Cepat" desc="Cari ribuan judul anime dengan hasil instan" />
        <FeatureItem icon="🕐" title="Riwayat Nonton" desc="Lanjut nonton dari episode yang tersimpan otomatis" />
        <FeatureItem icon="📶" title="Tanpa Login" desc="Langsung nonton tanpa perlu daftar akun" />
        <FeatureItem icon="🌙" title="Dark Mode" desc="Tema gelap yang nyaman di mata saat malam" />
        <FeatureItem icon="💜" title="Gratis Selamanya" desc="Tidak ada biaya berlangganan, selamanya gratis" />
      </div>

      {/* Minimum spec */}
      <div style={{ background: 'var(--color-surface)', borderRadius: '14px', padding: '16px 20px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>📱 Persyaratan Minimum</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <div>OS: Android 8.0+</div>
          <div>RAM: 2 GB</div>
          <div>Storage: 100 MB</div>
          <div>Internet: Diperlukan</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-dim)', lineHeight: 1.7 }}>
        Dengan mengunduh, kamu menyetujui bahwa aplikasi ini hanya untuk keperluan personal.<br />
        © 2026 Xicinime — Dibuat dengan 💜 untuk pecinta anime Indonesia
      </div>
    </div>
  );
};

export default Download;
