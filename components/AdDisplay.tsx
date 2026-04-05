'use client';

import { useEffect, useState, useRef } from 'react';

interface Ad {
  id: string;
  type: 'banner' | 'script';
  position: 'top' | 'bottom' | 'sidebar';
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
  active: boolean;
}

interface Props {
  position: 'top' | 'bottom' | 'sidebar';
}

function ScriptAd({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const tmp = document.createElement('div');
    tmp.innerHTML = code;
    Array.from(tmp.childNodes).forEach((node) => {
      if (node instanceof HTMLElement && node.tagName === 'SCRIPT') {
        const s = document.createElement('script');
        Array.from(node.attributes).forEach((a) => s.setAttribute(a.name, a.value));
        s.textContent = node.textContent;
        ref.current!.appendChild(s);
      } else {
        ref.current!.appendChild(node.cloneNode(true));
      }
    });
  }, [code]);

  return <div ref={ref} />;
}

export default function AdDisplay({ position }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch('/api/ads')
      .then((r) => r.json())
      .then((data: Ad[]) => setAds(data.filter((a) => a.active && a.position === position)))
      .catch(() => {});
  }, [position]);

  if (ads.length === 0) return null;

  return (
    <div className={`w-full ${position === 'top' ? 'mb-4' : position === 'bottom' ? 'mt-4' : ''}`}>
      {ads.map((ad) => (
        <div key={ad.id} className="overflow-hidden">
          {ad.type === 'banner' && ad.imageUrl ? (
            ad.linkUrl ? (
              <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full max-h-24 object-cover rounded-lg"
                />
              </a>
            ) : (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full max-h-24 object-cover rounded-lg"
              />
            )
          ) : ad.type === 'script' && ad.scriptCode ? (
            <ScriptAd code={ad.scriptCode} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
