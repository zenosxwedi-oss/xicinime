// AniList HD poster resolver: title -> coverImage.extraLarge (cached in localStorage)
const HD_CACHE_KEY = 'nusanimeHdPosters:v1';

const hdLoad = () => {
  try { return JSON.parse(localStorage.getItem(HD_CACHE_KEY) || '{}'); } catch { return {}; }
};

export const getCachedHdPoster = (title) => {
  if (!title) return null;
  const c = hdLoad();
  return c[title.toLowerCase()] || null;
};

const saveHd = (title, url) => {
  try {
    const c = hdLoad();
    c[title.toLowerCase()] = url;
    // cap 500 entries
    const keys = Object.keys(c);
    if (keys.length > 500) delete c[keys[0]];
    localStorage.setItem(HD_CACHE_KEY, JSON.stringify(c));
  } catch {}
};

export const fetchHdPoster = async (title) => {
  if (!title) return null;
  const cached = getCachedHdPoster(title);
  if (cached) return cached;
  try {
    const q = {
      query: `query ($s: String) { Page(perPage: 1) { media(search: $s, type: ANIME, sort: SEARCH_MATCH) { coverImage { extraLarge large } } } }`,
      variables: { s: title },
    };
    const r = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(q),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const m = j?.data?.Page?.media?.[0];
    const url = m?.coverImage?.extraLarge || m?.coverImage?.large || null;
    if (url) saveHd(title, url);
    return url;
  } catch {
    return null;
  }
};

// React hook: returns HD poster (or null while resolving)
import { useEffect, useState as _useState } from 'react';
export const useHdPoster = (title, fallbackSrc) => {
  const [src, setSrc] = _useState(getCachedHdPoster(title) || fallbackSrc);
  useEffect(() => {
    let dead = false;
    setSrc(getCachedHdPoster(title) || fallbackSrc);
    fetchHdPoster(title).then((u) => { if (!dead && u) setSrc(u); });
    return () => { dead = true; };
  }, [title, fallbackSrc]);
  return src;
};
