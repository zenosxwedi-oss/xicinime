import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/Theme';
import { api } from '@/services/api';

interface Result {
  animeId?: string;
  slug?: string;
  title: string;
  poster?: string;
  poster_url?: string;
  status?: string;
  type?: string;
  episodes?: string | number;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<TextInput>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.search(q, controllerRef.current.signal);
      const items = res?.data?.animeList ?? res?.data ?? [];
      setResults(Array.isArray(items) ? items : []);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (t: string) => {
    setQuery(t);
    if (t.length >= 2) search(t);
    else { setResults([]); setSearched(false); }
  };

  const handleSubmit = () => search(query);

  const renderItem = ({ item }: { item: Result }) => {
    const id = item.slug || item.animeId || '';
    return (
      <Pressable style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.75 }]} onPress={() => router.push(`/anime/${id}` as any)}>
        <Image source={{ uri: item.poster || item.poster_url }} style={styles.thumb} contentFit="cover" placeholder={undefined} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.pills}>
            {item.type && <View style={styles.pill}><Text style={styles.pillText}>{item.type}</Text></View>}
            {item.status && <View style={[styles.pill, { backgroundColor: item.status?.toLowerCase() === 'ongoing' ? Colors.primary : Colors.success }]}><Text style={styles.pillText}>{item.status}</Text></View>}
            {item.episodes != null && <Text style={styles.epsText}>{item.episodes} eps</Text>}
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={Colors.muted} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cari Anime</Text>
      </View>

      <View style={styles.inputWrap}>
        <Feather name="search" size={18} color={Colors.subtext} style={styles.inputIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ketik judul anime..."
          placeholderTextColor={Colors.muted}
          value={query}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus
          selectionColor={Colors.primary}
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Feather name="x" size={16} color={Colors.subtext} />
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.centerText}>Mencari...</Text>
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.center}>
          <Feather name="search" size={48} color={Colors.muted} />
          <Text style={styles.centerText}>Tidak ada hasil untuk "{query}"</Text>
        </View>
      )}

      {!loading && !searched && (
        <View style={styles.center}>
          <Feather name="tv" size={48} color={Colors.muted} />
          <Text style={styles.centerText}>Cari anime favoritmu</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={i => i.animeId || i.slug || i.title}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface2, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerText: { color: Colors.subtext, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  thumb: { width: 56, height: 80, borderRadius: Radius.sm, backgroundColor: Colors.surface2 },
  resultInfo: { flex: 1 },
  resultTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  pills: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  pill: { backgroundColor: Colors.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.xs },
  pillText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  epsText: { color: Colors.subtext, fontSize: 11 },
});
