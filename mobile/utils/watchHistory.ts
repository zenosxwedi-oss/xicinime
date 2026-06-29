import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'xicinime_watch_history';
const MAX = 100;

export interface HistoryItem {
  episodeId: string;
  animeId: string;
  animeTitle: string;
  episodeTitle: string;
  poster: string;
  provider: string;
  currentTime: number;
  duration: number;
  timestamp: number;
}

export const getWatchHistory = async (): Promise<HistoryItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addToWatchHistory = async (item: Omit<HistoryItem, 'timestamp' | 'currentTime' | 'duration'>) => {
  try {
    const history = await getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === item.episodeId);
    const existing = idx >= 0 ? history[idx] : null;
    if (idx >= 0) history.splice(idx, 1);
    history.unshift({
      ...item,
      currentTime: existing?.currentTime ?? 0,
      duration: existing?.duration ?? 0,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
  } catch {}
};

export const updateWatchProgress = async (episodeId: string, currentTime: number, duration: number) => {
  try {
    const history = await getWatchHistory();
    const idx = history.findIndex((h) => h.episodeId === episodeId);
    if (idx >= 0) {
      history[idx].currentTime = Math.floor(currentTime);
      history[idx].duration = Math.floor(duration);
      await AsyncStorage.setItem(KEY, JSON.stringify(history));
    }
  } catch {}
};

export const clearWatchHistory = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
};

export const formatTime = (s: number) => {
  if (!s || s <= 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};
