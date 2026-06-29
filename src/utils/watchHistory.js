const STORAGE_KEY = 'xicinime_watch_history';
const MAX_ITEMS = 100;

export const getWatchHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    // Migrate from old Funknime key (one-time migration, different key name)
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
    // Ignore localStorage errors (quota, privacy mode)
  }
};

/**
 * Add or update watch history entry.
 * If the episode already exists, MERGE (preserve currentTime/duration).
 */
export const addToWatchHistory = (item) => {
  if (typeof window === 'undefined' || !item?.episodeId) return;
  try {
    const history = getWatchHistory();
    const existingIdx = history.findIndex((h) => h.episodeId === item.episodeId);

    if (existingIdx >= 0) {
      const existing = history[existingIdx];
      history.splice(existingIdx, 1);
      history.unshift({
        ...existing,
        ...item,
        // Preserve existing progress if already saved
        currentTime: item.currentTime || existing.currentTime || 0,
        duration: item.duration || existing.duration || 0,
        timestamp: Date.now(),
      });
    } else {
      history.unshift({
        ...item,
        currentTime: item.currentTime || 0,
        duration: item.duration || 0,
        timestamp: Date.now(),
      });
    }

    _save(history.slice(0, MAX_ITEMS));
  } catch {
    // Ignore errors
  }
};

/**
 * Update watch progress for an episode.
 * If episode not yet in history, add a minimal entry so progress is tracked.
 */
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
      // Episode not yet in history — add a minimal entry
      history.unshift({
        episodeId,
        animeId: null,
        animeTitle: 'Episode',
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

/**
 * Get saved progress for an episode (returns seconds or 0)
 */
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

/**
 * Patch an existing history entry with additional metadata (e.g. title, poster)
 * called after anime detail loads, to enrich a minimal entry.
 */
export const patchWatchHistoryMeta = (episodeId, meta) => {
  if (typeof window === 'undefined' || !episodeId) return;
  try {
    const history = getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === episodeId);
    if (idx >= 0) {
      history[idx] = { ...history[idx], ...meta };
      _save(history);
    }
  } catch {
    // Ignore errors
  }
};

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
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
