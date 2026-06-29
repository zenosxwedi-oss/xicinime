import { useEffect, useRef } from 'react';

/**
 * Google AdSense banner component.
 * Automatically initializes the ad slot when mounted.
 */
const AdBanner = ({ slot = '', format = 'auto', style = {} }) => {
  const ref = useRef(null);

  useEffect(() => {
    try {
      if (ref.current && ref.current.childNodes.length === 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not loaded yet (dev mode / ad-blocker), ignore silently
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '16px auto', overflow: 'hidden', ...style }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3848627834535677"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
