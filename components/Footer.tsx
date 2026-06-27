import Link from 'next/link';
import { Smartphone, Tv } from 'lucide-react';

const APK_URL = 'https://github.com/zenosxwedi-oss/xicinime/releases/latest/download/XiciNime.apk';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#0a0a10]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3 w-fit">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white">xici<span className="text-indigo-400">nime</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Nonton anime sub indo terbaru dan terlengkap. Streaming gratis berkualitas tinggi, update tercepat.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Navigasi</h3>
            <nav className="flex flex-col gap-2">
              {[['/', 'Beranda'], ['/ongoing', 'Ongoing'], ['/completed', 'Completed'], ['/movies', 'Movies'], ['/popular', 'Populer']].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">{label}</Link>
              ))}
            </nav>
          </div>

          {/* Lainnya */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Lainnya</h3>
            <nav className="flex flex-col gap-2">
              {[['/genres', 'Genre'], ['/schedule', 'Jadwal'], ['/batch', 'Batch'], ['/browse', 'Cari Anime']].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">{label}</Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Download App Banner */}
        <div className="border-t border-white/5 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Download Aplikasi Android</p>
                <p className="text-xs text-gray-400">Nonton anime lebih nyaman di HP kamu</p>
              </div>
            </div>
            <a
              href={APK_URL}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-lg shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              Download APK
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} xicinime. Semua konten adalah milik pemilik aslinya.
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">Tentang & Kontak</Link>
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms-of-service" className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">Syarat & Ketentuan</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
