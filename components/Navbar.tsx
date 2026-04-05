'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Tv, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/ongoing', label: 'Ongoing' },
  { href: '/completed', label: 'Completed' },
  { href: '/movies', label: 'Movies' },
  { href: '/popular', label: 'Populer' },
  { href: '/genres', label: 'Genre' },
  { href: '/schedule', label: 'Jadwal' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d0d14]/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5'
          : 'bg-[#0d0d14]/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-500 transition-colors">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              xici<span className="text-indigo-400">nime</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Desktop search */}
            <div className="hidden md:block w-52">
              <SearchBar />
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cari"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0d0d14]">
          <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
