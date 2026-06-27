'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import VideoAdOverlay from './VideoAdOverlay';

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
}

export default function WatchPlayer({
  defaultStreamingUrl,
  servers,
  prevEpisode,
  nextEpisode,
  animeId,
}: Props) {
  const [iframeSrc, setIframeSrc] = useState(defaultStreamingUrl);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const showAdThen = useCallback((action: () => void) => {
    setPendingAction(() => action);
    setShowAd(true);
  }, []);

  const handleAdClose = useCallback(() => {
    setShowAd(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const switchServer = useCallback(async (serverId: string, idx: number) => {
    if (activeIdx === idx) return;
    showAdThen(async () => {
      setLoadingIdx(idx);
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
    });
  }, [activeIdx, showAdThen]);

  const useDefault = () => {
    showAdThen(() => {
      setIframeSrc(defaultStreamingUrl);
      setActiveIdx(null);
    });
  };

  return (
    <>
      {showAd && <VideoAdOverlay onClose={handleAdClose} />}

      <div className="flex flex-col gap-4">
        {/* Player */}
        <div
          className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black"
          style={{ paddingTop: '56.25%' }}
        >
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-fullscreen allow-forms allow-presentation"
          />
        </div>

        {/* Server Selector */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 mr-1">Pilih Server:</span>

          {/* Server 1 = default */}
          <button
            onClick={useDefault}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeIdx === null
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[#111118] border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300'
            }`}
          >
            Server 1
          </button>

          {/* Server 2, 3, dst */}
          {servers.map((s, i) => (
            <button
              key={s.serverId}
              onClick={() => switchServer(s.serverId, i)}
              disabled={loadingIdx === i}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
                activeIdx === i
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-[#111118] border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300'
              }`}
            >
              {loadingIdx === i && <Loader2 className="w-3 h-3 animate-spin" />}
              Server {i + 2}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111118] border border-white/10 hover:border-indigo-500/50 text-sm text-gray-300 hover:text-indigo-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg bg-[#0a0a10] border border-white/5 text-sm text-gray-600 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 inline" /> Sebelumnya
              </span>
            )}
            {nextEpisode ? (
              <Link
                href={`/watch/${nextEpisode.episodeId}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700/80 border border-indigo-600/50 hover:bg-indigo-600 text-sm text-white transition-all"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg bg-[#0a0a10] border border-white/5 text-sm text-gray-600 cursor-not-allowed">
                Selanjutnya <ChevronRight className="w-4 h-4 inline" />
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
