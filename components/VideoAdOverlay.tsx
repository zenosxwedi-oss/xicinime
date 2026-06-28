'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Loader2 } from 'lucide-react';

const VAST_URL =
  'https://smooth-survey.com/dpm.FIzodpGON/v/ZeGlUw/Ge_m/9RuVZkUElPk/P/TJcgxZNTzWMp3OOTDYkXtFNLzQE/3/MBzJcc5iMmwf';
const SKIP_AFTER = 5;

interface Props {
  onClose: () => void;
}

type AdState = 'loading' | 'playing' | 'fallback' | 'error';

export default function VideoAdOverlay({ onClose }: Props) {
  const [state, setState] = useState<AdState>('loading');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [muted, setMuted] = useState(true);
  const [skipLeft, setSkipLeft] = useState(SKIP_AFTER);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setSkipLeft(SKIP_AFTER);
    timerRef.current = setInterval(() => {
      setSkipLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVast() {
      try {
        const res = await fetch(VAST_URL, {
          mode: 'cors',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('fetch failed');
        const text = await res.text();

        if (cancelled) return;

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const parseErr = xml.querySelector('parsererror');
        if (parseErr) throw new Error('not xml');

        const mediaFiles = Array.from(xml.querySelectorAll('MediaFile'));
        let chosen = '';

        for (const mf of mediaFiles) {
          const type = (mf.getAttribute('type') || '').toLowerCase();
          const delivery = (mf.getAttribute('delivery') || '').toLowerCase();
          if (type.includes('mp4') || delivery === 'progressive') {
            chosen = mf.textContent?.trim() ?? '';
            if (chosen) break;
          }
        }
        if (!chosen) {
          const anyMf = mediaFiles[0];
          chosen = anyMf?.textContent?.trim() ?? '';
        }

        if (chosen && !cancelled) {
          setVideoUrl(chosen);
          setState('playing');
          startCountdown();
        } else if (!cancelled) {
          setState('fallback');
          startCountdown();
        }
      } catch {
        if (!cancelled) {
          setState('fallback');
          startCountdown();
        }
      }
    }

    loadVast();
    return () => {
      cancelled = true;
    };
  }, [startCountdown]);

  const handleVideoError = () => {
    setState('fallback');
    if (skipLeft === SKIP_AFTER) startCountdown();
  };

  const canSkip = skipLeft === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95">
      {/* ——— Loading ——— */}
      {state === 'loading' && (
        <div className="flex flex-col items-center gap-3 text-gray-300">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm">Memuat iklan…</span>
        </div>
      )}

      {/* ——— Video player ——— */}
      {state === 'playing' && videoUrl && (
        <div className="relative w-full max-w-2xl mx-4">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted={muted}
            playsInline
            className="w-full rounded-2xl border border-white/10 shadow-2xl"
            onEnded={onClose}
            onError={handleVideoError}
          />
          {/* Bottom bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              aria-label="Toggle mute"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-gray-400 bg-black/60 px-2 py-1 rounded">Iklan</span>
            <button
              onClick={canSkip ? onClose : undefined}
              disabled={!canSkip}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                canSkip
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {canSkip ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  Lewati Iklan
                </>
              ) : (
                `Lewati dalam ${skipLeft}s`
              )}
            </button>
          </div>
        </div>
      )}

      {/* ——— Fallback banner (VAST unavailable or error) ——— */}
      {(state === 'fallback' || state === 'error') && (
        <div className="flex flex-col items-center gap-6 px-6 text-center w-full max-w-lg">
          {/* Ad banner placeholder — HilltopAds MultiTag fills this */}
          <div
            className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#111118] flex items-center justify-center"
            style={{ minHeight: 250 }}
          >
            <div id="hilltopads-overlay-banner" className="w-full flex items-center justify-center" style={{ minHeight: 250 }}>
              <span className="text-gray-600 text-xs">Iklan</span>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={canSkip ? onClose : undefined}
            disabled={!canSkip}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              canSkip
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {canSkip ? 'Tutup & Lanjutkan' : `Tutup dalam ${skipLeft}s`}
          </button>
        </div>
      )}

      {/* Label bottom */}
      {state !== 'loading' && (
        <p className="absolute bottom-4 text-xs text-gray-600">
          Iklan mendukung keberlangsungan website ini
        </p>
      )}
    </div>
  );
}
