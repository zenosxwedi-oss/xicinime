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

export default function VastAdOverlay({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vastData, setVastData] = useState<VastData | null>(null);
  const [failed, setFailed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/vast')
      .then((r) => r.json())
      .then((data: VastData) => {
        if (data.videoUrl) {
          setVastData(data);
          setCountdown(data.skipOffset > 0 ? data.skipOffset : 5);
        } else {
          onComplete();
        }
      })
      .catch(() => {
        onComplete();
      });
    return () => {
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
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    onComplete();
  }, [canSkip, onComplete]);

  const handleAdClick = useCallback(() => {
    if (vastData?.clickUrl) {
      window.open(vastData.clickUrl, '_blank', 'noopener,noreferrer');
    }
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
        {/* Progress bar */}
        <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Duration */}
        {duration > 0 && (
          <span className="text-[10px] text-white/60 shrink-0 tabular-nums">
            {formatTime((duration * progress) / 100)}/{formatTime(duration)}
          </span>
        )}

        {/* Mute toggle */}
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
