'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const VIDEO_AD_URL =
  'https://smooth-survey.com/dpm.FIzodpGON/v/ZeGlUw/Ge_m/9RuVZkUElPk/P/TJcgxZNTzWMp3OOTDYkXtFNLzQE/3/MBzJcc5iMmwf';

const COUNTDOWN = 5;

interface Props {
  onClose: () => void;
}

export default function VideoAdOverlay({ onClose }: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleClose = useCallback(() => {
    if (seconds > 0) return;
    onClose();
  }, [seconds, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* card */}
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d0d15]">
        {/* header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111118] border-b border-white/5">
          <span className="text-xs text-gray-400 font-medium">Iklan — mendukung website ini</span>
          <button
            onClick={handleClose}
            disabled={seconds > 0}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              seconds > 0
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
            }`}
          >
            {seconds > 0 ? (
              <>
                <span className="tabular-nums w-4 text-center">{seconds}</span>
                <span>detik</span>
              </>
            ) : (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </>
            )}
          </button>
        </div>

        {/* ad iframe */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={VIDEO_AD_URL}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Advertisement"
          />
        </div>
      </div>
    </div>
  );
}
