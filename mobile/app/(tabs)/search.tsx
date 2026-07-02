import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimeCard from '@/components/AnimeCard';
import { useColors } from '@/hooks/useColors';
import { anime, donghua, type AnimeItem } from '@/services/api';

type Tab = 'anime' | 'donghua';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('anime');
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const doSearch = useCallback(async (q: string, t: Tab) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setLoading(true);
    setSearched(true);
    try {
      let res: any;
      if (t === 'anime') {
        res = await anime.search(q, ctrl.current.signal);
        const items = res?.data?.animeList ?? res?.data ?? res?.animeList ?? [];
        setResults(Array.isArray(items) ? items : []);
      } else {
        // Donghua search not always available, try anyway
        try {
          const dr = await fetch(`https://www.sankavollerei.web.id/anime/donghua/search/${encodeURIComponent(q)}`, {
            headers: { 'User-Agent': 'XiciNime-App/1.0' },
            signal: ctrl.current.signal,
          });
          const dj = await dr.json();
          const di = dj?.data?.animeList ?? dj?.data ?? dj?.animeList ?? [];
          setResults(Array.isArray(di) ? di : []);
        } catch {
          setResults([]);
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (t: string) => {
    setQuery(t);
    if (t.length >= 2) doSearch(t, tab);
    else { setResults([]); setSearched(false); }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    if (query.length >= 2) doSearch(query, t);
  };

  const goItem = (item: AnimeItem) => {
    const slug = item.animeId ?? item.slug;
    if (!slug) return;
    if (tab === 'donghua') router.push(`/donghua/${slug}` as any);
    else router.push(`/anime/${slug}` as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <View style={[styles.topBar, { paddingTop: insets.top + webTop + 12 }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder={tab === 'anime' ? 'Cari anime...' : 'Cari donghua...'}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleChange}
            onSubmitEditing={() => doSearch(query, tab)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.card }]}>
          {(['anime', 'donghua'] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
              onPress={() => switchTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? '#fff' : colors.mutedForeground }]}>
                {t === 'anime' ? 'Anime' : 'Donghua'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !searched ? (
        <View style={styles.center}>
          <Feather name="search" size={48} color={colors.border} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>Cari anime atau donghua favoritmu</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Feather name="frown" size={48} color={colors.border} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>Tidak ada hasil untuk "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={3}
          keyExtractor={(item, i) => `sr-${item.animeId ?? item.slug ?? i}`}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }]}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <AnimeCard
              title={item.title}
              poster={item.poster ?? item.poster_url}
              episode={item.current_episode}
              status={item.status}
              width={110}
              onPress={() => goItem(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  input: { flex: 1, fontSize: 15 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hintText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  grid: { paddingHorizontal: 16, paddingTop: 16 },
  row: { gap: 12, marginBottom: 16 },
});
