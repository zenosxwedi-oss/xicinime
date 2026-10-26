import { useEffect, useRef, useState } from 'react';

// Pre-roll video ad (VAST) for the Watch page.
// Plays the ad video BEFORE the episode player; a "Lewati Iklan" button appears at SKIP_AFTER seconds.
// On finish/skip/error the ad disappears and the real player takes over.
// Session-capped: max one ad per SESSION minutes per browser (so users are not spammed).

// Alternate between horizontal (in-stream) and vertical (fullscreen mobile) ad zones
const VAST_URLS = [
  'https://s.magsrv.com/v1/vast.php?idz=6065738&ex-av=name',
  'https://s.magsrv.com/v1/vast.php?idzone=6065846&ex-av=name',
];
const pickVast = () => VAST_URLS[Math.floor(Math.random() * VAST_URLS.length)];
const SKIP_AFTER = 15;          // seconds until the skip button appears
const AD_CAP_MINUTES = 20;      // show at most one ad per this many minutes
const CAP_KEY = 'nusanime_ad_last';

export const adDue = () => true; // always show pre-roll (user request); ExoClick caps server-side

const parseVastMediaFile = (xml) => {
  try {
    const m = xml.match(/<MediaFile[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/MediaFile>/s);
    const dur = xml.match(/<Duration>([^<]+)<\/Duration>/);
    const imp = xml.match(/<Impression[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/Impression>/s);
    let seconds = 0;
    if (dur) { const p = dur[1].split(':').map(Number); seconds = p[0] * 3600 + p[1] * 60 + p[2]; }
    return { media: m ? m[1].trim() : null, duration: seconds, impression: imp ? imp[1].trim() : null };
  } catch { return { media: null, duration: 0, impression: null }; }
};

const AdPreRoll = ({ onDone }) => {
  const videoRef = useRef(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [gone, setGone] = useState(false);
  const fired = useRef(false);

  const shownRef = useRef(0);
  const finish = () => {
    if (fired.current) return;
    fired.current = true;
    setGone(true);
    if (onDone) onDone();
  };

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch(pickVast(), { headers: { Accept: 'application/xml' } });
        if (!r.ok) throw new Error('vast ' + r.status);
        const xml = await r.text();
        const { media, impression } = parseVastMediaFile(xml);
        if (!media) throw new Error('no media');
        if (impression) { try { fetch(impression, { mode: 'no-cors' }).catch(() => {}); } catch {} }
        if (!dead) setMediaUrl(media);
      } catch { finish(); }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mediaUrl) return;
    const t0 = Date.now();
    shownRef.current = 0;
    const tick = setInterval(() => { shownRef.current = Date.now() - t0; setElapsed(e => e + 1); }, 1000);
    // hard cap: ad stuck/not playing? dismiss after 20s total
    const kill = setTimeout(finish, 20000);
    return () => { clearInterval(tick); clearTimeout(kill); };
  }, [mediaUrl]);

  if (gone) return null;

  const remaining = Math.max(0, SKIP_AFTER - elapsed);
  const canSkip = remaining <= 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {mediaUrl && (
        <video
          ref={videoRef}
          src={mediaUrl}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onEnded={finish}
          onError={finish}
        />
      )}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 41,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {!canSkip ? (
          <span style={{
            background: 'rgba(0,0,0,0.75)', color: '#fff', borderRadius: 6,
            padding: '6px 12px', fontSize: 13, fontFamily: 'sans-serif',
          }}>Iklan · Lewati dalam {remaining}s</span>
        ) : (
          <button
            type="button"
            onClick={finish}
            style={{
              background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'sans-serif',
            }}
          >Lewati Iklan ⏭</button>
        )}
      </div>
      <span style={{
        position: 'absolute', bottom: 10, left: 10, color: 'rgba(255,255,255,0.6)',
        fontSize: 11, fontFamily: 'sans-serif',
      }}>Iklan · Nusanime</span>
      <button
        type="button"
        onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}
        style={{
          position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)',
          color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px',
          fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif',
        }}
      >🔊 Suara</button>
    </div>
  );
};

export default AdPreRoll;
