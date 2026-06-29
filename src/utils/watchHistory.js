const STORAGE_KEY = 'xicinime_watch_history';
const MAX_ITEMS = 100;

export const getWatchHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const OLD_KEY = 'funknime_watch_history';
    const oldData = window.localStorage.getItem(OLD_KEY);
    if (oldData) {
      window.localStorage.setItem(STORAGE_KEY, oldData);
      window.localStorage.removeItem(OLD_KEY);
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const _save = (history) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore localStorage errors
  }
};

export const addToWatchHistory = (item) => {
  if (typeof window === 'undefined' || !item?.episodeId) return;
  try {
    const history = getWatchHistory();
    const existingIdx = history.findIndex((h) => h.episodeId === item.episodeId);
    const now = Date.now();

    if (existingIdx >= 0) {
      const existing = history[existingIdx];
      history.splice(existingIdx, 1);
      history.unshift({
        ...existing,
        ...item,
        // Never lose existing title/poster if new item doesn't have them
        animeTitle: item.animeTitle || existing.animeTitle || 'Anime',
        poster: item.poster || existing.poster || '',
        currentTime: item.currentTime || existing.currentTime || 0,
        duration: item.duration || existing.duration || 0,
        timestamp: now,
        lastWatched: now,
      });
    } else {
      history.unshift({
        animeTitle: 'Anime',
        poster: '',
        currentTime: 0,
        duration: 0,
        ...item,
        timestamp: now,
        lastWatched: now,
      });
    }

    _save(history.slice(0, MAX_ITEMS));
  } catch {
    // Ignore errors
  }
};

export const updateWatchProgress = (episodeId, currentTime, duration) => {
  if (typeof window === 'undefined' || !episodeId || !currentTime) return;
  try {
    const history = getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === episodeId);
    if (idx >= 0) {
      history[idx].currentTime = Math.floor(currentTime);
      history[idx].duration = Math.floor(duration || 0);
      history[idx].lastWatched = Date.now();
      _save(history);
    } else {
      history.unshift({
        episodeId,
        animeId: null,
        animeTitle: 'Anime',
        episodeTitle: episodeId,
        poster: '',
        provider: 'otakudesu',
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration || 0),
        timestamp: Date.now(),
        lastWatched: Date.now(),
      });
      _save(history.slice(0, MAX_ITEMS));
    }
  } catch {
    // Ignore errors
  }
};

export const getWatchProgress = (episodeId) => {
  if (typeof window === 'undefined' || !episodeId) return 0;
  try {
    const history = getWatchHistory();
    const item = history.find((h) => h.episodeId === episodeId);
    return item?.currentTime || 0;
  } catch {
    return 0;
  }
};

export const patchWatchHistoryMeta = (episodeId, meta) => {
  if (typeof window === 'undefined' || !episodeId) return;
  try {
    const history = getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === episodeId);
    if (idx >= 0) {
      history[idx] = {
        ...history[idx],
        ...meta,
        // Never overwrite with empty values
        animeTitle: meta.animeTitle || history[idx].animeTitle || 'Anime',
        poster: meta.poster || history[idx].poster || '',
      };
      _save(history);
    }
  } catch {
    // Ignore errors
  }
};

export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const clearWatchHistory = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
