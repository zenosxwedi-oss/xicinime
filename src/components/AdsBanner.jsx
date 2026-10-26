import { useEffect, useRef } from 'react';

// Google AdSense display unit. Create ad units in the AdSense dashboard,
// then pass the 10-digit slot id: <AdsBanner slot="1234567890" />
export default function AdsBanner({ slot, format = 'auto', style = {} }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  if (!slot) return null; // no slot yet — render nothing
  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-3946939950557724"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
