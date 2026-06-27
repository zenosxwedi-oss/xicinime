'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, Monitor, Wifi, Play, Volume2 } from 'lucide-react';

interface ServerItem {
  label: string;
  serverId: string;
}

interface Props {
  defaultStreamingUrl: string;
  servers: ServerItem[];
  prevEpisode: { episodeId: string } | null;
  nextEpisode: { episodeId: string } | null;
  animeId: string;
  episodeTitle?: string;
}

export default function WatchPlayer({
  defaultStreamingUrl,
  servers,
  prevEpisode,
  nextEpisode,
  animeId,
  episodeTitle,
}: Props) {
  const [iframeSrc, setIframeSrc] = useState(defaultStreamingUrl);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  /* ── Wake Lock: cegah layar mati saat nonton ── */
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // wakeLock tidak didukung browser ini
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock, releaseWakeLock]);

  const switchServer = useCallback(async (serverId: string, idx: number) => {
    if (activeIdx === idx) return;
    setLoadingIdx(idx);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/server/${serverId}`);
      const data = await res.json() as { url?: string };
      if (data.url) {
        setIframeSrc(data.url);
        setActiveIdx(idx);
      }
    } finally {
      setLoadingIdx(null);
    }
  }, [activeIdx]);

  const useDefault = () => {
    setIframeSrc(defaultStreamingUrl);
    setActiveIdx(null);
    setIsLoading(true);
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Player container ── */}
      <div className="relative w-full bg-black rounded-t-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/8"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a14] gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <Play className="absolute inset-0 m-auto w-5 h-5 text-indigo-400 fill-indigo-400" />
            </div>
            <p className="text-xs text-gray-500 animate-pulse">Memuat video...</p>
          </div>
        )}

        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; screen-wake-lock"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-fullscreen allow-forms allow-presentation"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* ── Player footer: info + controls ── */}
      <div className="bg-[#0f0f1a] border border-t-0 border-white/8 rounded-b-2xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-400 min-w-0 flex-1">
          <Monitor className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{episodeTitle ?? 'Streaming'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-900/20 border border-green-800/30 px-2 py-1 rounded-full">
          <Wifi className="w-3 h-3" />
          <span>Wake Lock aktif</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 bg-indigo-900/20 border border-indigo-800/30 px-2 py-1 rounded-full">
          <Volume2 className="w-3 h-3" />
          <span>Fullscreen tersedia</span>
        </div>
      </div>

      {/* ── Server Selector ── */}
      <div className="mt-4 bg-[#0f0f1a] border border-white/8 rounded-2xl p-4">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Pilih Server</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={useDefault}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeIdx === null
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-indigo-900/30 hover:border-indigo-700/50 hover:text-indigo-300'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            Server 1
          </button>

          {servers.map((s, i) => (
            <button
              key={s.serverId}
              onClick={() => switchServer(s.serverId, i)}
              disabled={loadingIdx === i}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeIdx === i
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-indigo-900/30 hover:border-indigo-700/50 hover:text-indigo-300'
              }`}
            >
              {loadingIdx === i
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Play className="w-3 h-3 fill-current opacity-70" />
              }
              Server {i + 2}
            </button>
          ))}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <Link
          href={`/anime/${animeId}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Semua Episode
        </Link>
        <div className="flex gap-2">
          {prevEpisode ? (
            <Link
              href={`/watch/${prevEpisode.episodeId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111118] border border-white/10 hover:border-indigo-500/50 text-sm text-gray-300 hover:text-indigo-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-[#0a0a10] border border-white/5 text-sm text-gray-700 cursor-not-allowed select-none">
              <ChevronLeft className="w-4 h-4 inline" /> Sebelumnya
            </span>
          )}
          {nextEpisode ? (
            <Link
              href={`/watch/${nextEpisode.episodeId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 border border-indigo-600/50 hover:bg-indigo-600 text-sm text-white font-semibold transition-all shadow-lg shadow-indigo-900/30"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-[#0a0a10] border border-white/5 text-sm text-gray-700 cursor-not-allowed select-none">
              Selanjutnya <ChevronRight className="w-4 h-4 inline" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
