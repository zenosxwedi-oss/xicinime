import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const VisitorCounter = ({ inline = false }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let dead = false;
    const hit = () => {
      fetch('https://stats.nusanime.web.id/hit', { mode: 'cors' }).catch(() => {});
    };
    try {
      if (!sessionStorage.getItem('__vcHit')) {
        sessionStorage.setItem('__vcHit', '1');
        hit();
      }
    } catch { hit(); }
    fetch('https://stats.nusanime.web.id/get', { mode: 'cors' })
      .then((r) => r.json())
      .then((d) => { if (!dead) setStats(d); })
      .catch(() => {});
    return () => { dead = true; };
  }, []);
  if (!stats) return null;
  return (
    <div style={{ fontSize: 12, color: 'var(--color-text-muted, #888)', marginTop: inline ? 0 : 10, display: 'flex', justifyContent: inline ? 'center' : 'flex-start', gap: 4, padding: inline ? '18px 0 26px' : 0 }}>
      👀 Pengunjung hari ini: <b style={{ color: 'var(--color-text, #eee)' }}>{stats.today ?? 0}</b>
      {' · '}Total: <b style={{ color: 'var(--color-text, #eee)' }}>{stats.total ?? 0}</b>
    </div>
  );
};

const Footer = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const year = new Date().getFullYear();

  const handleSendReport = () => {
    const subject = encodeURIComponent('[Nusanime] Laporan Bug');
    const body = encodeURIComponent(`Bug:\n\n${reportText || '(Jelaskan masalah)'}\n\n---\nURL: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowReport(false);
    setReportText('');
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-glow" />
        <div className="footer-inner">
          {/* Brand */}
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand-link">
              <img src="/logo.png" alt="Nusanime" className="footer-logo-img" />
              <span className="footer-brand-name">Nusanime</span>
            </Link>
            <p className="footer-tagline">
              Tempat nonton anime & donghua sub Indo paling lengkap. Gratis, kualitas terbaik.
            </p>
            <a href="https://trakteer.id/nusanime/tip" target="_blank" rel="noopener noreferrer" className="footer-donate-btn">
              ☕ Dukung Kami
            </a>
            <VisitorCounter />
          </div>

          {/* Links */}
          <div className="footer-links-section">
            <div className="footer-col">
              <h4 className="footer-col-title">Jelajahi</h4>
              <Link to="/ongoing" className="footer-link">Anime Ongoing</Link>
              <Link to="/completed" className="footer-link">Anime Completed</Link>
              <Link to="/donghua-ongoing" className="footer-link">Donghua</Link>
              <Link to="/schedule" className="footer-link">Jadwal Tayang</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Lainnya</h4>
              <Link to="/genres" className="footer-link">Genre</Link>
              <Link to="/az-list" className="footer-link">A-Z List</Link>
              <Link to="/search" className="footer-link">Pencarian</Link>
              <Link to="/history" className="footer-link">Riwayat</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Bantuan</h4>
              <button type="button" className="footer-link footer-link-btn" onClick={() => setShowReport(true)}>Lapor Bug</button>
              <a href="https://trakteer.id/nusanime/tip" target="_blank" rel="noopener noreferrer" className="footer-link">Donasi</a>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p className="footer-copy" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/privacy" className="footer-link">Kebijakan Privasi</Link>
              <Link to="/disclaimer" className="footer-link">Disclaimer</Link>
              <Link to="/about" className="footer-link">Tentang</Link>
              <span>© {year} Nusanime</span>
            </p>
            <p className="footer-disclaimer">Nusanime adalah platform streaming anime gratis. Kami tidak menyimpan file video di server kami.</p>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      {showReport && (
        <div className="report-modal-overlay" onClick={() => setShowReport(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <button className="report-modal-close" onClick={() => setShowReport(false)}>✕</button>
            <h2 className="report-modal-title">🐛 Lapor Bug</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '12px' }}>Jelaskan error yang kamu temukan.</p>
            <textarea
              className="report-modal-textarea"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Contoh: Video tidak bisa diputar di halaman..."
              rows={4}
            />
            <div className="report-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReport(false)}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSendReport}>📧 Kirim via Email</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
