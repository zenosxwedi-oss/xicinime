import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'xicinime_watch_history';
const MAX = 100;

export interface HistoryItem {
  id: string;
  slug: string;
  title: string;
  poster?: string;
  episode?: string;
  type: 'anime' | 'donghua' | 'movie';
  watchedAt: number;
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addHistory(item: Omit<HistoryItem, 'watchedAt'>): Promise<void> {
  try {
    const history = await getHistory();
    const filtered = history.filter(h => h.id !== item.id);
    const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

export async function removeHistoryItem(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const updated = history.filter(h => h.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}
