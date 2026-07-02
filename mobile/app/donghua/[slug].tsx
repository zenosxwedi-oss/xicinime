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
import { donghua } from '@/services/api';

interface DonghuaDetail {
  title?: string;
  poster?: string;
  status?: string;
  type?: string;
  episodes?: any[];
  episodeList?: any[];
  synopsis?: string;
  score?: string | number;
  genres?: { name: string }[];
  genre?: { name: string }[];
}

export default function DonghuaDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [detail, setDetail] = useState<DonghuaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    donghua.detail(slug as string)
      .then(res => setDetail(res?.data ?? res))
      .catch(() => setError('Gagal memuat detail donghua'))
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
      <Text style={[styles.errorText, { color: colors.foreground }]}>{error || 'Donghua tidak ditemukan'}</Text>
      <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
        <Text style={styles.btnText}>Kembali</Text>
      </Pressable>
    </View>
  );

  const episodes = detail.episodeList ?? detail.episodes ?? [];
  const genres = detail.genre ?? detail.genres ?? [];

  const watchEp = (ep: any) => {
    const id = ep.slug ?? ep.episodeId;
    if (id) router.push(`/watch-donghua/${id}` as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.hero}>
          <Image source={{ uri: detail.poster }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={12} />
          <LinearGradient colors={['rgba(8,8,15,0.2)', 'rgba(8,8,15,0.65)', colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroTop, { paddingTop: insets.top + 12 }]}>
            <Pressable style={[styles.backIcon, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <Image source={{ uri: detail.poster }} style={[styles.poster, { borderRadius: colors.radius }]} contentFit="cover" />
            <View style={styles.heroMeta}>
              <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>{detail.title}</Text>
              <View style={styles.metaRow}>
                {detail.status && (
                  <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.pillText}>{detail.status}</Text>
                  </View>
                )}
                <View style={[styles.pill, { backgroundColor: '#ff6b35' }]}>
                  <Text style={styles.pillText}>Donghua</Text>
                </View>
              </View>
              {detail.score && <Text style={[styles.score, { color: colors.warning }]}>★ {detail.score}</Text>}
            </View>
          </View>
        </View>

        {genres.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
            {genres.map((g: any, i: number) => (
              <View key={i} style={[styles.genrePill, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.genreText, { color: colors.accent }]}>{g.name ?? g}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {detail.synopsis && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sinopsis</Text>
            <Text style={[styles.synopsis, { color: colors.mutedForeground }]}>{detail.synopsis}</Text>
          </View>
        )}

        {episodes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Episode ({episodes.length})</Text>
            <FlatList
              data={episodes}
              scrollEnabled={false}
              keyExtractor={(ep, i) => ep.slug ?? ep.episodeId ?? String(i)}
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
                    {ep.title ?? ep.episode ?? 'Episode'}
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
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: '700' },
  hero: { height: 320, justifyContent: 'flex-end' },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  backIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroBottom: { flexDirection: 'row', padding: 16, gap: 14, alignItems: 'flex-end' },
  poster: { width: 100, height: 145 },
  heroMeta: { flex: 1, gap: 6 },
  title: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  score: { fontSize: 14, fontWeight: '700' },
  genreList: { paddingHorizontal: 16, gap: 8, marginBottom: 20, marginTop: 8 },
  genrePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  genreText: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  synopsis: { fontSize: 13, lineHeight: 20 },
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
