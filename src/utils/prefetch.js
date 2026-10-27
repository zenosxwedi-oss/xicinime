// Prefetch episode data on touch so Watch opens instantly
export const prefetchEpisode = (episodeId) => {
  if (!episodeId || typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(`epq:${episodeId}`)) return;
    sessionStorage.setItem(`epq:${episodeId}`, '1');
    // Warm the real API (same base the app uses) so the response is cached by the browser
    fetch(`https://www.sankavollerei.web.id/anime/samehadaku/episode/${episodeId}`, {
      mode: 'cors',
      headers: { Accept: 'application/json' },
    }).catch(() => {});
  } catch {}
};
