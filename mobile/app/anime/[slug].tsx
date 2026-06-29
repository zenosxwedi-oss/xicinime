import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/Theme';
import { api } from '@/services/api';

export default function AnimeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.animeDetail(slug)
      .then(res => setDetail(res?.data ?? res))
      .catch(() => setError('Gagal memuat detail anime'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: Colors.bg, paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  if (error || !detail) return (
    <View style={[styles.center, { backgroundColor: Colors.bg, paddingTop: insets.top }]}>
      <Feather name="alert-circle" size={48} color={Colors.error} />
      <Text style={styles.errorText}>{error || 'Anime tidak ditemukan'}</Text>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Kembali</Text>
      </Pressable>
    </View>
  );

  const episodes: any[] = detail.episodeList ?? detail.episodes ?? [];
  const genres: any[] = detail.genreList ?? detail.genres ?? [];

  return (
    <View style={[styles.root, { backgroundColor: Colors.bg }]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: detail.poster || detail.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={10} />
          <LinearGradient colors={['rgba(8,8,15,0.3)', Colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroInner, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.backIcon}>
              <Feather name="arrow-left" size={20} color={Colors.text} />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <Image source={{ uri: detail.poster || detail.poster_url }} style={styles.poster} contentFit="cover" />
            <View style={styles.heroMeta}>
              <Text style={styles.title} numberOfLines={3}>{detail.title}</Text>
              <View style={styles.metaRow}>
                {detail.status && <View style={[styles.badge, { backgroundColor: detail.status?.toLowerCase() === 'ongoing' ? Colors.primary : Colors.success }]}><Text style={styles.badgeText}>{detail.status}</Text></View>}
                {detail.type && <View style={styles.badge}><Text style={styles.badgeText}>{detail.type}</Text></View>}
              </View>
              {detail.episodes != null && <Text style={styles.metaText}>🎬 {detail.episodes} Episode</Text>}
              {detail.score && <Text style={styles.metaText}>⭐ {detail.score}</Text>}
              {detail.studio && <Text style={styles.metaText} numberOfLines={1}>🎬 {detail.studio}</Text>}
            </View>
          </View>
        </View>

        {/* Genres */}
        {genres.length > 0 && (
          <View style={styles.genreRow}>
            {genres.map((g: any) => (
              <View key={g.title || g} style={styles.genreBadge}>
                <Text style={styles.genreText}>{g.title || g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Synopsis */}
        {detail.synopsis && (
          <View style={styles.synopsisWrap}>
            <Text style={styles.synopsisTitle}>Sinopsis</Text>
            <Text style={styles.synopsis}>{detail.synopsis}</Text>
          </View>
        )}

        {/* Episodes */}
        {episodes.length > 0 && (
          <View style={{ marginTop: Spacing.lg }}>
            <Text style={styles.epsHeader}>Daftar Episode ({episodes.length})</Text>
            {episodes.slice(0, 50).map((ep: any) => (
              <Pressable
                key={ep.slug || ep.episodeId || ep.title}
                style={({ pressed }) => [styles.epItem, pressed && { opacity: 0.7 }]}
                onPress={() => router.push(`/watch/${ep.slug || ep.episodeId}` as any)}
              >
                <View style={styles.epIcon}>
                  <Feather name="play" size={14} color={Colors.primary} />
                </View>
                <Text style={styles.epText} numberOfLines={1}>{ep.title || ep.episode}</Text>
                <Feather name="chevron-right" size={14} color={Colors.muted} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  errorText: { color: Colors.subtext, fontSize: 15, textAlign: 'center' },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full },
  backBtnText: { color: Colors.white, fontWeight: '700' },
  hero: { minHeight: 260, justifyContent: 'flex-end' },
  heroInner: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg },
  backIcon: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  heroBottom: { flexDirection: 'row', gap: 14, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, alignItems: 'flex-end' },
  poster: { width: 100, height: 145, borderRadius: Radius.md, backgroundColor: Colors.surface2 },
  heroMeta: { flex: 1 },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  badge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.xs },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  metaText: { color: Colors.subtext, fontSize: 11, marginBottom: 3 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: Spacing.lg, marginTop: Spacing.md },
  genreBadge: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  genreText: { color: Colors.subtext, fontSize: 11, fontWeight: '600' },
  synopsisWrap: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  synopsisTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  synopsis: { color: Colors.subtext, fontSize: 13, lineHeight: 20 },
  epsHeader: { color: Colors.text, fontSize: 15, fontWeight: '700', paddingHorizontal: Spacing.lg, marginBottom: 8 },
  epItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  epIcon: { width: 30, height: 30, borderRadius: Radius.xs, backgroundColor: 'rgba(147,51,234,0.15)', alignItems: 'center', justifyContent: 'center' },
  epText: { flex: 1, color: Colors.text, fontSize: 13 },
});
