const BASE = 'https://www.sankavollerei.web.id/anime';

const fetchJSON = async (path: string, signal?: AbortSignal) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'XiciNime-App/1.0' },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const api = {
  home: (signal?: AbortSignal) => fetchJSON('/otakudesu/home', signal),
  search: (q: string, signal?: AbortSignal) =>
    fetchJSON(`/otakudesu/search?q=${encodeURIComponent(q)}`, signal),
  animeDetail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/otakudesu/anime/${slug}`, signal),
  episodeDetail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/otakudesu/episode/${slug}`, signal),
  samehadakuDetail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/samehadaku/anime/${slug}`, signal),
  donghuaHome: (signal?: AbortSignal) => fetchJSON('/donghua/home', signal),
};
