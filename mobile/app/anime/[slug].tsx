import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { anime } from '@/services/api';

interface AnimeDetail {
  title?: string;
  poster?: string;
  poster_url?: string;
  status?: string;
  type?: string;
  episodes?: number | string;
  score?: string | number;
  synopsis?: string;
  genres?: { name: string; slug: string }[];
  genreList?: { name: string; slug: string }[];
  episodeList?: { title: string; episodeId?: string; slug?: string; episode?: string }[];
}

export default function AnimeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [detail, setDetail] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    anime.detail(slug as string)
      .then(res => setDetail(res?.data ?? res))
      .catch(() => setError('Gagal memuat detail anime'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (error || !detail) return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <Feather name="alert-circle" size={48} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.foreground }]}>{error || 'Anime tidak ditemukan'}</Text>
      <Pressable style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Kembali</Text>
      </Pressable>
    </View>
  );

  const episodes = detail.episodeList ?? [];
  const genres = detail.genreList ?? detail.genres ?? [];

  const watchEp = (ep: typeof episodes[0]) => {
    const id = ep.episodeId ?? ep.slug;
    if (id) router.push(`/watch/${id}` as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: detail.poster ?? detail.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={12} />
          <LinearGradient colors={['rgba(8,8,15,0.2)', 'rgba(8,8,15,0.65)', colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroTop, { paddingTop: insets.top + 12 }]}>
            <Pressable style={[styles.backIcon, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <Image source={{ uri: detail.poster ?? detail.poster_url }} style={[styles.poster, { borderRadius: colors.radius }]} contentFit="cover" />
            <View style={styles.heroMeta}>
              <Text style={[styles.animeTitle, { color: colors.foreground }]} numberOfLines={3}>{detail.title}</Text>
              <View style={styles.metaRow}>
                {detail.status && (
                  <View style={[styles.pill, { backgroundColor: detail.status.toLowerCase() === 'ongoing' ? colors.primary : colors.success }]}>
                    <Text style={styles.pillText}>{detail.status}</Text>
                  </View>
                )}
                {detail.type && (
                  <View style={[styles.pill, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.pillText, { color: colors.mutedForeground }]}>{detail.type}</Text>
                  </View>
                )}
              </View>
              {detail.score && <Text style={[styles.score, { color: colors.warning }]}>★ {detail.score}</Text>}
              {detail.episodes && <Text style={[styles.epCount, { color: colors.mutedForeground }]}>{detail.episodes} Episode</Text>}
            </View>
          </View>
        </View>

        {/* Genres */}
        {genres.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
            {genres.map((g, i) => (
              <View key={i} style={[styles.genrePill, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.genreText, { color: colors.accent }]}>{g.name ?? g}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Synopsis */}
        {detail.synopsis && (
          <View style={styles.synopsisWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sinopsis</Text>
            <Text style={[styles.synopsis, { color: colors.mutedForeground }]}>{detail.synopsis}</Text>
          </View>
        )}

        {/* Episode list */}
        {episodes.length > 0 && (
          <View style={styles.epWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Episode ({episodes.length})</Text>
            <FlatList
              data={episodes}
              scrollEnabled={false}
              keyExtractor={(ep, i) => ep.episodeId ?? ep.slug ?? String(i)}
              renderItem={({ item: ep }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.epItem,
                    { backgroundColor: pressed ? colors.secondary : colors.card, borderColor: colors.border }
                  ]}
                  onPress={() => watchEp(ep)}
                >
                  <Feather name="play-circle" size={20} color={colors.primary} />
                  <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {ep.title ?? ep.episode ?? `Episode`}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  hero: { height: 320, justifyContent: 'flex-end' },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  backIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroBottom: { flexDirection: 'row', padding: 16, gap: 14, alignItems: 'flex-end' },
  poster: { width: 100, height: 145 },
  heroMeta: { flex: 1, gap: 6 },
  animeTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  score: { fontSize: 14, fontWeight: '700' },
  epCount: { fontSize: 12 },
  genreList: { paddingHorizontal: 16, gap: 8, marginBottom: 20, marginTop: 8 },
  genrePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  genreText: { fontSize: 12, fontWeight: '600' },
  synopsisWrap: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  synopsis: { fontSize: 13, lineHeight: 20 },
  epWrap: { paddingHorizontal: 16 },
  epItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  epTitle: { flex: 1, fontSize: 13, fontWeight: '500' },
});
