'use client';

import { useEffect, useRef } from 'react';

interface Props {
  /** 'leaderboard' = 728x90 desktop  |  'rectangle' = 300x250  |  'mobile' = 300x100 */
  size?: 'leaderboard' | 'rectangle' | 'mobile';
  className?: string;
}

const sizeMap = {
  leaderboard: { w: 728, h: 90 },
  rectangle:   { w: 300, h: 250 },
  mobile:      { w: 300, h: 100 },
};

export default function NativeBanner({ size = 'rectangle', className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { w, h } = sizeMap[size];

  useEffect(() => {
    if (!ref.current) return;
    // Re-trigger HilltopAds MultiTag for dynamically mounted slots
    const s = document.createElement('script');
    s.src = '//shameful-farm.com/bgX.V/sidVGfl-0OYJWhcN/Ke/mp9/uXZtUhlokLPYTfc/x/NazQQgy/MgDPECtrNIz/Eo3CNVDDIYwYNMQI';
    s.async = true;
    s.referrerPolicy = 'no-referrer-when-downgrade';
    ref.current.appendChild(s);
  }, []);

  return (
    <div
      ref={ref}
      className={`hilltopads-slot overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: w, height: h, maxWidth: '100%' }}
      data-size={size}
    />
  );
}
