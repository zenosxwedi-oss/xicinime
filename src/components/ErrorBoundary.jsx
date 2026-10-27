import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    try { window.__reactErr = String(error && (error.stack || error.message || error)); } catch {}
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      console.error('[ErrorBoundary] Render error:', error, errorInfo);
    }
    // Auto-recover from stale deploy: old JS chunk missing after a new release.
    const msg = String((error && (error.message || error)) || '');
    if (/Loading chunk|dynamically imported module|Importing a module script|Failed to fetch dynamically/i.test(msg)) {
      try {
        if (!sessionStorage.getItem('__chunkReloaded')) {
          sessionStorage.setItem('__chunkReloaded', '1');
          if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.update()));
          window.location.reload();
        }
      } catch {}
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-container main-container" role="alert">
        <div className="error-icon" aria-hidden="true">💥</div>
        <h2>Ada yang Salah</h2>
        <p className="error-message">
          Halaman ini gagal dimuat. Coba muat ulang atau kembali ke beranda.
        </p>
        <p className="error-hint">
          Kalau masalahnya terus muncul, kabarin kami lewat tombol "Laporkan Bug" di footer.
        </p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={this.handleReload}>
            🔄 Muat Ulang
          </button>
          <Link to="/" className="btn btn-secondary" onClick={this.handleReset}>
            🏠 Ke Beranda
          </Link>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
