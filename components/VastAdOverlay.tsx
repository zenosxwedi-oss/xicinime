'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

interface VastData {
  videoUrl: string;
  skipOffset: number;
  clickUrl: string;
}

interface Props {
  onComplete: () => void;
}

function parseSeconds(timeStr: string): number {
  if (!timeStr) return 5;
  const parts = timeStr.split(':');
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  return parseFloat(timeStr) || 5;
}

export default function VastAdOverlay({ onComplete }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const [vastData, setVastData]   = useState<VastData | null>(null);
  const [failed,   setFailed]     = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canSkip,  setCanSkip]    = useState(false);
  const [muted,    setMuted]      = useState(true);
  const [progress, setProgress]   = useState(0);
  const [duration, setDuration]   = useState(0);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVast() {
      try {
        /* Step 1: get VAST tag URL from our API */
        const apiRes = await fetch('/api/vast');
        const { vastUrl } = (await apiRes.json()) as { vastUrl?: string };
        if (!vastUrl || cancelled) { onComplete(); return; }

        /* Step 2: fetch VAST XML client-side so the browser sends real browser headers
           — ad servers block server-side requests, not browser requests */
        const vastRes = await fetch(vastUrl, { mode: 'cors' });
        if (!vastRes.ok || cancelled) { onComplete(); return; }

        const xml = await vastRes.text();

        /* Step 3: parse VAST XML with DOMParser */
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        /* MediaFile – prefer progressive delivery */
        let videoUrl = '';
        const mediaFiles = Array.from(doc.querySelectorAll('MediaFile'));
        for (const mf of mediaFiles) {
          const raw = mf.textContent?.trim() ?? '';
          const url = raw.startsWith('<![CDATA[') ? raw.slice(9, raw.length - 3).trim() : raw;
          if (url.startsWith('http')) {
            videoUrl = url;
            if (mf.getAttribute('delivery') === 'progressive') break;
          }
        }
        /* fallback: plain regex if DOMParser returned empty */
        if (!videoUrl) {
          const m1 = xml.match(/<MediaFile[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/MediaFile>/i);
          const m2 = xml.match(/<MediaFile[^>]*>\s*(https?:\/\/[^\s<]+)\s*<\/MediaFile>/i);
          videoUrl = (m1?.[1] ?? m2?.[1] ?? '').trim();
        }

        /* skipoffset */
        const linear    = doc.querySelector('Linear');
        const skipAttr  = linear?.getAttribute('skipoffset') ?? '00:00:05';
        const skipOffset = parseSeconds(skipAttr);

        /* ClickThrough */
        const clickEl  = doc.querySelector('ClickThrough');
        let clickUrl   = clickEl?.textContent?.trim() ?? '';
        if (clickUrl.startsWith('<![CDATA[')) clickUrl = clickUrl.slice(9, clickUrl.length - 3).trim();

        if (cancelled) return;

        if (videoUrl) {
          setVastData({ videoUrl, skipOffset, clickUrl });
          setCountdown(skipOffset > 0 ? skipOffset : 5);
        } else {
          onComplete();
        }
      } catch {
        if (!cancelled) onComplete();
      }
    }

    loadVast();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, [onComplete]);

  const startCountdown = useCallback((skipSec: number) => {
    let remaining = skipSec;
    setCountdown(remaining);
    countRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countRef.current) clearInterval(countRef.current);
        setCanSkip(true);
        setCountdown(0);
      }
    }, 1000);
  }, []);

  const handleVideoReady = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    video.play().catch(() => {});
    if (vastData) startCountdown(vastData.skipOffset > 0 ? vastData.skipOffset : 5);
  }, [vastData, startCountdown]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  const handleVideoError = useCallback(() => {
    setFailed(true);
    timerRef.current = setTimeout(onComplete, 500);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (!canSkip) return;
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    onComplete();
  }, [canSkip, onComplete]);

  const handleAdClick = useCallback(() => {
    if (vastData?.clickUrl) window.open(vastData.clickUrl, '_blank', 'noopener,noreferrer');
  }, [vastData]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  }, [muted]);

  if (failed || !vastData) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-20 bg-black flex flex-col">
      <video
        ref={videoRef}
        src={vastData.videoUrl}
        className="flex-1 w-full object-contain cursor-pointer"
        muted={muted}
        playsInline
        onLoadedData={handleVideoReady}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onComplete}
        onError={handleVideoError}
        onClick={handleAdClick}
      />

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-center gap-3">
        <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        {duration > 0 && (
          <span className="text-[10px] text-white/60 shrink-0 tabular-nums">
            {formatTime((duration * progress) / 100)}/{formatTime(duration)}
          </span>
        )}
        <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors p-1">
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Ad label */}
      <div className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/60 border border-white/20 px-2 py-1 rounded-md">
        IKLAN
      </div>

      {/* Skip / countdown */}
      <div className="absolute top-3 right-3">
        {canSkip ? (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-md hover:bg-gray-200 active:scale-95 transition-all shadow-lg"
          >
            Lewati <X className="w-3 h-3" />
          </button>
        ) : (
          <div className="text-[11px] text-white bg-black/70 border border-white/20 px-3 py-1.5 rounded-md">
            Lewati dalam {countdown}s
          </div>
        )}
      </div>
    </div>
  );
}
