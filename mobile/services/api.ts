const BASE = 'https://www.sankavollerei.web.id/anime';

const fetchJSON = async (path: string, signal?: AbortSignal) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'XiciNime-App/1.0',
    },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ─── Samehadaku (Anime) ───────────────────────────────────────────────────────
export const anime = {
  home: (signal?: AbortSignal) => fetchJSON('/samehadaku/home', signal),
  search: (q: string, signal?: AbortSignal) =>
    fetchJSON(`/samehadaku/search/${encodeURIComponent(q)}`, signal),
  detail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/samehadaku/anime/${slug}`, signal),
  episode: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/samehadaku/episode/${slug}`, signal),
  recent: (signal?: AbortSignal) =>
    fetchJSON('/samehadaku/recent', signal),
  ongoing: (signal?: AbortSignal) =>
    fetchJSON('/samehadaku/ongoing', signal),
  completed: (signal?: AbortSignal) =>
    fetchJSON('/samehadaku/completed', signal),
};

// ─── Donghua ─────────────────────────────────────────────────────────────────
export const donghua = {
  home: (signal?: AbortSignal) => fetchJSON('/donghua/home', signal),
  schedule: (signal?: AbortSignal) => fetchJSON('/donghua/schedule', signal),
  detail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/donghua/detail/${slug}`, signal),
  episode: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/donghua/episode/${slug}`, signal),
};

// ─── Stream / Movie ──────────────────────────────────────────────────────────
export const movies = {
  list: (signal?: AbortSignal) => fetchJSON('/stream/movie', signal),
  latest: (signal?: AbortSignal) => fetchJSON('/stream/latest', signal),
  popular: (signal?: AbortSignal) => fetchJSON('/stream/popular', signal),
  detail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/stream/anime/${slug}`, signal),
  episode: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/stream/episode/${slug}`, signal),
  search: (q: string, signal?: AbortSignal) =>
    fetchJSON(`/stream/search/${encodeURIComponent(q)}`, signal),
};

// ─── Anoboy ───────────────────────────────────────────────────────────────────
export const anoboy = {
  home: (signal?: AbortSignal) => fetchJSON('/anoboy/home', signal),
  detail: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/anoboy/anime/${slug}`, signal),
  episode: (slug: string, signal?: AbortSignal) =>
    fetchJSON(`/anoboy/episode/${slug}`, signal),
  search: (q: string, signal?: AbortSignal) =>
    fetchJSON(`/anoboy/search/${encodeURIComponent(q)}`, signal),
};

export type ContentType = 'anime' | 'donghua' | 'movie';

export interface AnimeItem {
  title: string;
  animeId?: string;
  slug?: string;
  poster?: string;
  poster_url?: string;
  status?: string;
  type?: string;
  episodes?: string | number;
  current_episode?: string;
  releasedOn?: string;
  score?: string | number;
}

export interface EpisodeItem {
  title?: string;
  slug?: string;
  episodeId?: string;
  episode?: string;
  href?: string;
}
