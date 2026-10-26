import { Link, useLocation } from 'react-router-dom';

// AniList-style slim dark top bar for the database site (nusanime.web.id).
const links = [
  ['/', 'Beranda'],
  ['/donghua-ongoing', 'Donghua'],
  ['/movie', 'Movie'],
  ['/genres', 'Genres'],
  ['/schedule', 'Jadwal'],
];

export default function DbNavbar() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(13,15,20,0.92)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '0 14px', height: 54, overflowX: 'auto',
    }}>
      <Link to="/" style={{
        fontWeight: 900, fontSize: 17, letterSpacing: 1, textDecoration: 'none',
        color: '#FF4757', marginRight: 10, flexShrink: 0,
      }}>NUSANIME</Link>
      {links.map(([to, label]) => (
        <Link key={to} to={to} style={{
          fontSize: 13.5, fontWeight: 700, textDecoration: 'none', padding: '8px 12px',
          borderRadius: 8, whiteSpace: 'nowrap',
          color: pathname === to ? '#fff' : 'rgba(255,255,255,0.6)',
          background: pathname === to ? 'rgba(255,71,87,0.18)' : 'transparent',
        }}>{label}</Link>
      ))}
      <a href="https://anime.nusanime.web.id/search" style={{
        marginLeft: 'auto', flexShrink: 0, fontSize: 13.5, fontWeight: 700,
        textDecoration: 'none', color: '#fff', background: '#FF4757',
        padding: '8px 14px', borderRadius: 8,
      }}>🔍 Cari / Nonton</a>
    </nav>
  );
}
