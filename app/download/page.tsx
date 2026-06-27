import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Download, Shield, Zap, Smartphone, Wifi, Star,
  AlertCircle, GitBranch, RefreshCw, CheckCircle2, ArrowUpCircle,
  Monitor, Apple, Share, PlusSquare, Chrome,
} from 'lucide-react';
import { DownloadTabs } from '@/components/DownloadTabs';

export const metadata: Metadata = {
  title: 'Download Aplikasi | XiciNime',
  description: 'Download atau install aplikasi XiciNime untuk Android, iOS, dan PC — nonton anime sub indo gratis di semua perangkat.',
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

const androidFeatures = [
  { icon: Zap,        label: 'Cepat & Ringan',        desc: 'Streaming lancar tanpa lag — WebView native ringan dan responsif' },
  { icon: Shield,     label: 'Aman & Terverifikasi',   desc: 'Dibangun otomatis via GitHub Actions. Tidak ada malware atau virus.' },
  { icon: Wifi,       label: 'Multi Server',           desc: 'Pilih server terbaik untuk streaming tanpa buffering' },
  { icon: Smartphone, label: 'Support Semua Android',  desc: 'Kompatibel Android 5.0 (Lollipop) ke atas' },
  { icon: RefreshCw,  label: 'Tarik untuk Refresh',    desc: 'Swipe ke bawah untuk reload halaman secara instan' },
  { icon: Star,       label: 'Layar Tidak Redup',      desc: 'Wake Lock aktif otomatis saat nonton — layar tetap menyala' },
];

const androidSteps = [
  { num: '1', title: 'Download APK',       desc: 'Klik tombol download di bawah untuk mengunduh file XiciNime.apk.' },
  { num: '2', title: 'Izinkan Instalasi',  desc: 'Buka Pengaturan → Keamanan → aktifkan "Sumber Tidak Dikenal" / "Install from unknown sources".' },
  { num: '3', title: 'Install Aplikasi',   desc: 'Buka file APK yang sudah didownload dan ketuk "Install".' },
  { num: '4', title: 'Nikmati Anime!',     desc: 'Buka XiciNime dan mulai nonton. Update tersedia otomatis di halaman ini.' },
];

const iosSteps = [
  { num: '1', title: 'Buka Safari',         desc: 'Buka Safari (bukan Chrome/Firefox) dan pergi ke xicinime.my.id' },
  { num: '2', title: 'Ketuk Tombol Share',   desc: 'Ketuk ikon berbagi (kotak dengan panah ke atas) di bawah layar.' },
  { num: '3', title: 'Add to Home Screen',   desc: 'Scroll ke bawah dan pilih "Add to Home Screen" (Tambahkan ke Layar Utama).' },
  { num: '4', title: 'Install & Buka',       desc: 'Ketuk "Add" — ikon XiciNime akan muncul di layar utama iPhone/iPad kamu.' },
];

const pcSteps = [
  { num: '1', title: 'Buka Chrome / Edge',   desc: 'Pergi ke xicinime.my.id menggunakan Google Chrome atau Microsoft Edge.' },
  { num: '2', title: 'Klik Ikon Install',    desc: 'Di pojok kanan address bar, klik ikon "Install app" (komputer kecil dengan tanda +).' },
  { num: '3', title: 'Konfirmasi Install',   desc: 'Klik "Install" pada dialog yang muncul.' },
  { num: '4', title: 'Buka dari Desktop',    desc: 'XiciNime akan tersedia sebagai aplikasi di desktop & Start menu — bisa dibuka offline.' },
];

export default async function DownloadPage() {
  const release     = await getLatestRelease();
  const apkAsset    = release?.assets.find((a) => a.name === APK_FILENAME);
  const version     = release?.tag_name ?? 'v1.0.0';
  const apkSize     = apkAsset ? formatBytes(apkAsset.size) : '~15–30 MB';
  const publishedAt = release?.published_at ? formatDate(release.published_at) : null;
  const downloadUrl = apkAsset?.browser_download_url ?? APK_FALLBACK;

  const changelogLines = release?.body
    ?.split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
    .slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-[#0d0d14] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Hero ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-pink-300 bg-pink-900/30 border border-pink-700/50 px-3 py-1.5 rounded-full mb-6">
            <Download className="w-3.5 h-3.5" />
            Tersedia di Semua Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Install{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-fuchsia-400">
              XiciNime
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tersedia untuk Android, iOS, dan PC. Gratis, cepat, dan tanpa iklan di app.
          </p>
        </div>

        {/* ── Platform Tabs ── */}
        <DownloadTabs>
          {(platform) => (
            <>
              {/* ─── ANDROID ─── */}
              {platform === 'android' && (
                <div className="space-y-6">
                  {/* Version badge */}
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                    <div className="inline-flex items-center gap-2 text-gray-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <GitBranch className="w-3 h-3" />
                      <span>Versi: <strong className="text-pink-400">{version}</strong></span>
                      {publishedAt && <><span className="text-gray-700">·</span><span>{publishedAt}</span></>}
                      {apkAsset && <><span className="text-gray-700">·</span><span>{apkSize}</span></>}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={downloadUrl}
                      download
                      className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 active:scale-95 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-pink-900/40 hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      Download APK {apkAsset ? `(${apkSize})` : ''}
                    </a>
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
                  <p className="text-center text-gray-600 text-xs">Android 5.0+ · Build otomatis via GitHub Actions</p>

                  {/* Update notice */}
                  {changelogLines.length > 0 && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-pink-950/60 to-fuchsia-950/40 border border-pink-800/40 rounded-2xl p-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
                      <div className="flex items-start gap-4 relative">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                          <ArrowUpCircle className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-pink-200 font-bold text-sm mb-1">Yang baru di {version}:</p>
                          <div className="space-y-1 mt-2">
                            {changelogLines.map((line, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-pink-300/70">
                                <CheckCircle2 className="w-3 h-3 text-pink-500 shrink-0 mt-0.5" />
                                <span>{line.replace(/^[-*•]\s*/, '')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Safety */}
                  <div className="flex items-start gap-4 bg-green-900/20 border border-green-800/40 rounded-2xl p-5">
                    <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-bold text-sm mb-1">APK Aman & Terverifikasi</p>
                      <p className="text-green-400/70 text-xs leading-relaxed">
                        File APK dibangun otomatis dengan <strong>GitHub Actions</strong> — teknologi CI/CD resmi.
                        Tidak mengandung malware atau kode berbahaya.{' '}
                        <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer"
                          className="underline hover:text-green-300">
                          Lihat source code →
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Fitur Aplikasi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {androidFeatures.map((f) => (
                        <div key={f.label} className="flex items-start gap-4 bg-[#13131f] border border-[#1e1e35] rounded-2xl p-4">
                          <div className="w-9 h-9 rounded-xl bg-pink-900/40 flex items-center justify-center shrink-0">
                            <f.icon className="w-4.5 h-4.5 text-pink-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{f.label}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Install steps */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Cara Install</h2>
                    <div className="space-y-3">
                      {androidSteps.map((step) => (
                        <div key={step.num} className="flex items-start gap-4">
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

                  {/* Unknown sources warning */}
                  <div className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-800/30 rounded-2xl p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-yellow-400/80 text-xs leading-relaxed">
                      Android mungkin menampilkan peringatan <strong className="text-yellow-300">&quot;App dari sumber tidak dikenal&quot;</strong> —
                      ini normal untuk APK di luar Play Store. APK XiciNime <strong className="text-yellow-300">100% aman</strong>.
                    </p>
                  </div>

                  {/* Bottom CTA */}
                  <div className="text-center">
                    <a href={downloadUrl} download
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-pink-900/40">
                      <Download className="w-5 h-5" />
                      Download Sekarang
                    </a>
                  </div>
                </div>
              )}

              {/* ─── iOS ─── */}
              {platform === 'ios' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-pink-900/40">
                      <Apple className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">XiciNime untuk iPhone & iPad</h2>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                      Install sebagai PWA (Progressive Web App) langsung dari Safari — tanpa App Store, gratis, tidak ada peringatan.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border border-blue-800/40 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-200 font-bold text-sm mb-1">Kenapa PWA, bukan App Store?</p>
                        <p className="text-blue-300/70 text-xs leading-relaxed">
                          Distribusi iOS di luar App Store tidak diizinkan oleh Apple tanpa Enterprise Certificate ($299/tahun).
                          PWA memberikan pengalaman yang sama persis — icon di home screen, bisa dibuka fullscreen, dan update otomatis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Cara Install di iPhone / iPad</h2>
                    <div className="space-y-3">
                      {iosSteps.map((step) => (
                        <div key={step.num} className="flex items-start gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Share,      title: 'Ikon Share di Safari',   desc: 'Kotak dengan panah ke atas di toolbar bawah' },
                      { icon: PlusSquare, title: 'Add to Home Screen',     desc: 'Scroll ke bawah di menu Share untuk menemukannya' },
                      { icon: Smartphone, title: 'Buka Seperti App',       desc: 'XiciNime terbuka fullscreen tanpa browser bar' },
                    ].map((item) => (
                      <div key={item.title} className="bg-[#13131f] border border-[#1e1e35] rounded-2xl p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-pink-900/40 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-pink-400" />
                        </div>
                        <p className="text-white font-semibold text-xs mb-1">{item.title}</p>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <a
                      href="https://xicinime.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-pink-900/40"
                    >
                      <Apple className="w-5 h-5" />
                      Buka di Safari untuk Install
                    </a>
                    <p className="text-gray-600 text-xs mt-3">Requires iOS 14.0+ · Harus dibuka di Safari</p>
                  </div>
                </div>
              )}

              {/* ─── PC ─── */}
              {platform === 'pc' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-900/40">
                      <Monitor className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">XiciNime untuk PC & Mac</h2>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                      Install sebagai PWA dari Chrome atau Edge — tampil seperti aplikasi desktop, tidak ada browser bar, bisa di-pin ke taskbar.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-950/60 to-emerald-950/40 border border-green-800/40 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-200 font-bold text-sm mb-1">Keunggulan PWA vs EXE</p>
                        <p className="text-green-300/70 text-xs leading-relaxed">
                          File EXE dari luar Microsoft Store selalu dipindai Windows Defender dan sering diblokir SmartScreen.
                          PWA tidak butuh signing, tidak ada peringatan, dan tetap update otomatis setiap kali dibuka.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Cara Install di PC / Mac</h2>
                    <div className="space-y-3">
                      {pcSteps.map((step) => (
                        <div key={step.num} className="flex items-start gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Chrome,  title: 'Chrome (Windows/Mac/Linux)', desc: 'Klik ikon komputer di address bar kanan atas → Install' },
                      { icon: Monitor, title: 'Edge (Windows)',              desc: 'Klik ··· → Apps → Install this site as an app' },
                    ].map((item) => (
                      <div key={item.title} className="bg-[#13131f] border border-[#1e1e35] rounded-2xl p-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-pink-900/40 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <a
                      href="https://xicinime.my.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-900/40"
                    >
                      <Monitor className="w-5 h-5" />
                      Buka di Chrome / Edge untuk Install
                    </a>
                    <p className="text-gray-600 text-xs mt-3">Windows · macOS · Linux · Chromebook</p>
                  </div>
                </div>
              )}
            </>
          )}
        </DownloadTabs>

        {/* ── Footer note ── */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-gray-600 text-xs">
            Dengan menggunakan aplikasi, kamu setuju dengan{' '}
            <Link href="/terms-of-service" className="text-pink-400 hover:underline">Syarat &amp; Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/privacy-policy" className="text-pink-400 hover:underline">Kebijakan Privasi</Link> kami.
          </p>
        </div>

      </div>
    </div>
  );
}
