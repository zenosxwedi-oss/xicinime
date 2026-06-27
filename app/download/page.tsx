import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Download, Shield, Zap, Smartphone, Wifi, Star,
  AlertCircle, GitBranch, RefreshCw, CheckCircle2, ArrowUpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download Aplikasi Android | XiciNime',
  description: 'Download aplikasi XiciNime untuk Android — nonton anime sub indo gratis, tampilan elegan, dan update otomatis.',
};

const GITHUB_REPO = 'zenosxwedi-oss/xicinime';
const APK_FILENAME = 'XiciNime.apk';
const APK_FALLBACK = `https://github.com/${GITHUB_REPO}/releases/latest/download/${APK_FILENAME}`;
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;

interface GithubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  assets: Array<{ name: string; size: number; browser_download_url: string }>;
}

async function getLatestRelease(): Promise<GithubRelease | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const features = [
  { icon: Zap,        label: 'Cepat & Ringan',      desc: 'APK ringan dengan ProGuard — streaming lancar tanpa lag di semua HP' },
  { icon: Shield,     label: 'Aman & Terverifikasi', desc: 'Dibangun otomatis via GitHub Actions. Tidak ada malware atau virus.' },
  { icon: Wifi,       label: 'Multi Server',         desc: 'Pilih server terbaik untuk streaming tanpa buffering' },
  { icon: Smartphone, label: 'Support Semua Android',desc: 'Kompatibel Android 5.0 (Lollipop) ke atas — semua HP Android' },
  { icon: RefreshCw,  label: 'Auto Update',          desc: 'Aplikasi otomatis cek pembaruan saat dibuka — download langsung dari notifikasi' },
  { icon: Star,       label: 'UI Elegan',            desc: 'Tampilan modern, dark mode, player video fullscreen dengan wake lock' },
];

const steps = [
  { num: '1', title: 'Download APK',       desc: 'Klik tombol download di bawah untuk mengunduh file XiciNime.apk.' },
  { num: '2', title: 'Izinkan Instalasi',  desc: 'Buka Pengaturan → Keamanan → aktifkan "Sumber Tidak Dikenal" / "Install from unknown sources".' },
  { num: '3', title: 'Install Aplikasi',   desc: 'Buka file APK yang sudah didownload dan ketuk "Install".' },
  { num: '4', title: 'Nikmati Anime!',     desc: 'Buka XiciNime dan mulai nonton. Update tersedia otomatis!' },
];

export default async function DownloadPage() {
  const release = await getLatestRelease();
  const apkAsset  = release?.assets.find((a) => a.name === APK_FILENAME);
  const uniAsset  = release?.assets.find((a) => a.name === 'XiciNime-universal.apk');
  const version   = release?.tag_name ?? 'v1.0.0';
  const apkSize   = apkAsset ? formatBytes(apkAsset.size) : '~30–90 MB';
  const uniSize   = uniAsset ? formatBytes(uniAsset.size) : null;
  const publishedAt = release?.published_at ? formatDate(release.published_at) : null;
  const downloadUrl = apkAsset?.browser_download_url ?? APK_FALLBACK;
  const uniUrl    = uniAsset?.browser_download_url ?? null;

  /* Changelog: ambil 5 baris pertama dari body release */
  const changelogLines = release?.body
    ?.split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
    .slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-[#0d0d14] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ── Hero ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-pink-300 bg-pink-900/30 border border-pink-700/50 px-3 py-1.5 rounded-full mb-6">
            <Smartphone className="w-3.5 h-3.5" />
            Aplikasi Android Resmi
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            XiciNime untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-400">
              Android
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Nonton anime sub indo langsung dari genggaman tangan. Gratis, cepat, dan aman.
          </p>

          {/* Version + date badge */}
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-8">
            <GitBranch className="w-3 h-3" />
            <span>Versi terbaru: <strong className="text-pink-400">{version}</strong></span>
            {publishedAt && <span className="text-gray-600">·</span>}
            {publishedAt && <span>{publishedAt}</span>}
            {apkAsset && (
              <>
                <span className="text-gray-600">·</span>
                <span>{apkSize}</span>
              </>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 active:scale-95 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-pink-900/40 hover:shadow-pink-900/60 hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download APK {apkAsset ? `(${apkSize})` : ''}
            </a>
            {uniUrl && (
              <a
                href={uniUrl}
                download
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm px-5 py-4 rounded-2xl transition-all border border-white/10"
              >
                <Smartphone className="w-4 h-4" />
                Universal APK {uniSize ? `(${uniSize})` : ''}
              </a>
            )}
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm px-5 py-4 rounded-2xl transition-all border border-white/10"
            >
              <GitBranch className="w-4 h-4" />
              Semua Rilis
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">Android 5.0+ · Build otomatis via GitHub Actions</p>
        </div>

        {/* ── Auto-update notice ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-950/60 to-fuchsia-950/40 border border-pink-800/40 rounded-2xl p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
          <div className="flex items-start gap-4 relative">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <p className="text-pink-200 font-bold text-sm mb-1">🔔 Update Otomatis Tersedia</p>
              <p className="text-pink-300/70 text-xs leading-relaxed">
                Aplikasi XiciNime otomatis memeriksa versi terbaru setiap kali dibuka.
                Jika ada pembaruan, kamu akan langsung mendapat notifikasi dan bisa download
                tanpa harus buka website ini.
              </p>

              {/* Changelog mini */}
              {changelogLines.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-bold text-pink-400/80 uppercase tracking-widest mb-2">
                    Yang baru di {version}:
                  </p>
                  {changelogLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-pink-300/60">
                      <CheckCircle2 className="w-3 h-3 text-pink-500 shrink-0 mt-0.5" />
                      <span>{line.replace(/^[-*•]\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── APK choice guide ── */}
        {uniUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#13131f] border border-pink-800/30 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <span className="text-lg">⭐</span> XiciNime.apk <span className="text-[10px] text-pink-400 bg-pink-900/40 px-2 py-0.5 rounded-full">Disarankan</span>
              </p>
              <p className="text-gray-500 text-xs">Untuk HP 64-bit (arm64) — lebih kecil, lebih cepat. Cocok untuk hampir semua HP Android keluaran 2016 ke atas.</p>
            </div>
            <div className="bg-[#13131f] border border-white/8 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <span className="text-lg">🌐</span> XiciNime-universal.apk
              </p>
              <p className="text-gray-500 text-xs">Untuk semua HP Android (32-bit & 64-bit). Ukuran lebih besar, tapi kompatibel dengan semua perangkat.</p>
            </div>
          </div>
        )}

        {/* ── Safety notice ── */}
        <div className="flex items-start gap-4 bg-green-900/20 border border-green-800/40 rounded-2xl p-5">
          <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-bold text-sm mb-1">APK Aman & Terverifikasi</p>
            <p className="text-green-400/70 text-xs leading-relaxed">
              File APK dibangun otomatis dengan <strong>GitHub Actions</strong> menggunakan Expo / React Native —
              teknologi resmi dari Meta &amp; Expo Inc. Tidak mengandung malware, virus, atau kode berbahaya.{' '}
              <a
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300 transition-colors"
              >
                Lihat source code di GitHub.
              </a>
            </p>
          </div>
        </div>

        {/* ── Features ── */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-start gap-4 bg-[#13131f] border border-[#1e1e35] rounded-2xl p-4 hover:border-pink-800/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-pink-900/40 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Install steps ── */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Cara Install</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center shrink-0 font-black text-white text-sm shadow-lg shadow-pink-900/30">
                  {step.num}
                </div>
                <div className="bg-[#13131f] border border-[#1e1e35] rounded-2xl p-4 flex-1">
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Unknown sources warning ── */}
        <div className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-800/30 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-yellow-400/80 text-xs leading-relaxed">
            Android mungkin menampilkan peringatan <strong className="text-yellow-300">&quot;App dari sumber tidak dikenal&quot;</strong> —
            ini normal untuk APK di luar Play Store. APK XiciNime <strong className="text-yellow-300">100% aman</strong>.
            Aktifkan izin instalasi di pengaturan untuk melanjutkan.
          </p>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="text-center pt-2">
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-pink-900/40"
          >
            <Download className="w-5 h-5" />
            Download Sekarang
          </a>
          <p className="text-gray-600 text-xs mt-4">
            Dengan mendownload, kamu setuju dengan{' '}
            <Link href="/terms-of-service" className="text-pink-400 hover:underline">Syarat &amp; Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy-policy" className="text-pink-400 hover:underline">Kebijakan Privasi</Link> kami.
          </p>
        </div>

      </div>
    </div>
  );
}
