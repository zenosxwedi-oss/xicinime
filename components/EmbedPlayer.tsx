'use client';

import { useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import VideoAdOverlay from './VideoAdOverlay';

interface Server { serverId: string; title: string; }
interface Quality { title: string; serverList: Server[]; }

interface Props {
  defaultUrl: string;
  qualities: Quality[];
}

export default function EmbedPlayer({ defaultUrl, qualities }: Props) {
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  const switchServer = (serverId: string) => {
    if (activeId === serverId) return;
    showAdThen(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/server/${serverId}`);
        const data = await res.json() as { url?: string };
        if (data.url) {
          setCurrentUrl(data.url);
          setActiveId(serverId);
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      {showAd && <VideoAdOverlay onClose={handleAdClose} />}

      <div className="flex flex-col gap-4">
        {/* iframe player */}
        <div
          className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black"
          style={{ paddingTop: '56.25%' }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            </div>
          )}
          <iframe
            key={currentUrl}
            src={currentUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-fullscreen allow-forms allow-presentation"
          />
        </div>

        {/* Server & quality selector */}
        {qualities.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Pilih Server & Kualitas</h2>
            {qualities.map((q) => (
              <div key={q.title} className="bg-[#111118] border border-white/5 rounded-2xl p-4">
                <div className="mb-3">
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-900/50 border border-indigo-700/50 px-3 py-1 rounded-full">
                    {q.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.serverList.map((s) => (
                    <button
                      key={s.serverId}
                      onClick={() => switchServer(s.serverId)}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        activeId === s.serverId
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-indigo-600/80 hover:border-indigo-500 hover:text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
