import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimeCard from '@/components/AnimeCard';
import SectionHeader from '@/components/SectionHeader';
import { CardSkeleton } from '@/components/Skeleton';
import { useColors } from '@/hooks/useColors';
import { anime, type AnimeItem } from '@/services/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  const [recent, setRecent] = useState<AnimeItem[]>([]);
  const [ongoing, setOngoing] = useState<AnimeItem[]>([]);
  const [completed, setCompleted] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featured, setFeatured] = useState<AnimeItem | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      const res = await anime.home();
      const d = res?.data ?? res;
      const rec: AnimeItem[] = d?.recent?.animeList ?? d?.recent ?? [];
      const ong: AnimeItem[] = d?.ongoing?.animeList ?? d?.ongoing ?? [];
      const com: AnimeItem[] = d?.completed?.animeList ?? d?.completed ?? [];
      setRecent(rec);
      setOngoing(ong);
      setCompleted(com);
      const all = [...rec, ...ong];
      if (all.length > 0) setFeatured(all[Math.floor(Math.random() * Math.min(5, all.length))]);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, [load]);

  const goAnime = (item: AnimeItem) => {
    const slug = item.animeId ?? item.slug;
    if (slug) router.push(`/anime/${slug}` as any);
  };

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />

      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} contentFit="contain" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.appName, { color: colors.foreground }]}>XICINIME</Text>
          <Text style={[styles.appSub, { color: colors.mutedForeground }]}>Nonton anime sub indo gratis</Text>
        </View>
        <Pressable
          style={[styles.searchBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/search' as any)}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }}
      >
        {/* Featured hero */}
        {featured && (
          <Pressable style={styles.hero} onPress={() => goAnime(featured)}>
            <Image source={{ uri: featured.poster ?? featured.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={6} />
            <LinearGradient
              colors={['transparent', 'rgba(8,8,15,0.7)', colors.bg]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={[styles.liveTag, { backgroundColor: colors.primary }]}>
                <Text style={styles.liveTagText}>FEATURED</Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.foreground }]} numberOfLines={2}>
                {featured.title}
              </Text>
              {featured.status && (
                <Text style={[styles.heroMeta, { color: colors.mutedForeground }]}>
                  {featured.status} {featured.episodes ? `· ${featured.episodes} Ep` : ''}
                </Text>
              )}
              <Pressable style={[styles.watchBtn, { backgroundColor: colors.primary }]} onPress={() => goAnime(featured)}>
                <Feather name="play" size={14} color="#fff" />
                <Text style={styles.watchBtnText}>Tonton Sekarang</Text>
              </Pressable>
            </View>
          </Pressable>
        )}

        {/* Recent Episodes */}
        {loading ? (
          <View style={styles.section}>
            <SectionHeader title="Episode Terbaru" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </ScrollView>
          </View>
        ) : recent.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Episode Terbaru" />
            <FlatList
              data={recent.slice(0, 20)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => `rec-${item.animeId ?? item.slug ?? i}`}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <AnimeCard
                  title={item.title}
                  poster={item.poster ?? item.poster_url}
                  episode={item.current_episode ?? (item.episodes ? `Ep ${item.episodes}` : undefined)}
                  status={item.status}
                  onPress={() => goAnime(item)}
                />
              )}
            />
          </View>
        ) : null}

        {/* Ongoing */}
        {!loading && ongoing.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Sedang Tayang" />
            <FlatList
              data={ongoing.slice(0, 20)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => `ong-${item.animeId ?? item.slug ?? i}`}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <AnimeCard
                  title={item.title}
                  poster={item.poster ?? item.poster_url}
                  episode={item.current_episode ?? (item.episodes ? `Ep ${item.episodes}` : undefined)}
                  status={item.status}
                  onPress={() => goAnime(item)}
                />
              )}
            />
          </View>
        )}

        {/* Completed */}
        {!loading && completed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Baru Selesai" />
            <FlatList
              data={completed.slice(0, 20)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => `com-${item.animeId ?? item.slug ?? i}`}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <AnimeCard
                  title={item.title}
                  poster={item.poster ?? item.poster_url}
                  episode={item.episodes ? `${item.episodes} Ep` : undefined}
                  status={item.status}
                  onPress={() => goAnime(item)}
                />
              )}
            />
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  logo: { width: 36, height: 36, borderRadius: 8 },
  appName: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  appSub: { fontSize: 11 },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: 240,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroContent: { padding: 16, gap: 6 },
  liveTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  liveTagText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  heroMeta: { fontSize: 12 },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  watchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section: { marginBottom: 28 },
  hList: { paddingHorizontal: 16, gap: 12 },
});
