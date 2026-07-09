import { useRouter } from 'expo-router';
    import { StatusBar } from 'expo-status-bar';
    import React, { useCallback, useEffect, useState } from 'react';
    import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
    import { useSafeAreaInsets } from 'react-native-safe-area-context';
    import AnimeCard from '@/components/AnimeCard';
    import SectionHeader from '@/components/SectionHeader';
    import { CardSkeleton } from '@/components/Skeleton';
    import { useColors } from '@/hooks/useColors';
    import { anime, animekompi } from '@/services/api';

    interface MovieItem {
    title: string; slug?: string; animeId?: string; poster?: string;
    status?: string; type?: string; episodes?: string | number;
    score?: string | number | { value?: string }; _source?: string;
    }

    export default function MoviesScreen() {
    const insets  = useSafeAreaInsets();
    const router  = useRouter();
    const colors  = useColors();
    const [kompiMovies, setKompiMovies] = useState<MovieItem[]>([]);
    const [sameMovies, setSameMovies]   = useState<MovieItem[]>([]);
    const [loading,    setLoading]      = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const webTop = Platform.OS === 'web' ? 67 : 0;

    const load = useCallback(async () => {
      try {
        const [kompiRes, sameRes] = await Promise.all([
          animekompi.movie(1).catch(() => null),
          anime.movies().catch(() => null),
        ]);
        const kList: MovieItem[] = ((kompiRes?.data ?? []) as any[]).map(item => ({
          title: item.title, slug: item.slug, animeId: item.slug,
          poster: item.poster, type: item.type || 'Movie',
          episodes: item.episode || 'Movie', _source: 'AnimeKompi',
        }));
        const sList: MovieItem[] = (sameRes?.data?.animeList ?? sameRes?.data ?? sameRes?.animeList ?? [])
          .map((item: MovieItem) => ({ ...item, _source: 'Samehadaku' }));
        setKompiMovies(kList);
        setSameMovies(sList);
      } catch {}
      finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    const onRefresh = () => { setRefreshing(true); load(); };
    const goDetail = (item: MovieItem) => {
      const slug = item.animeId ?? item.slug;
      if (slug) router.push(`/anime/${slug}` as any);
    };
    const scoreStr = (s: MovieItem['score']) => {
      if (!s) return undefined;
      if (typeof s === 'object') return (s as any).value;
      return String(s);
    };

    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar style="light" />
        <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Movie & OVA</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Film anime dari AnimeKompi & Samehadaku</Text>
        </View>
        {loading ? (
          <ScrollView contentContainerStyle={{ paddingTop: 16 }}>
            {[0, 1].map(idx => (
              <View key={idx} style={styles.section}>
                <SectionHeader title={idx === 0 ? 'AnimeKompi Movie' : 'Samehadaku Movie'} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                  {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }}
          >
            {kompiMovies.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title={`AnimeKompi Movie (${kompiMovies.length})`} />
                <FlatList
                  data={kompiMovies} horizontal showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, i) => `kompi-${i}-${item.animeId ?? ''}`}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <AnimeCard title={item.title} poster={item.poster} type="movie"
                      status={item.type || 'Movie'}
                      episode={item.episodes ? String(item.episodes) : undefined}
                      onPress={() => goDetail(item)} />
                  )}
                />
              </View>
            )}
            {sameMovies.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title={`Samehadaku Movie (${sameMovies.length})`} />
                <FlatList
                  data={sameMovies} horizontal showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, i) => `same-${i}-${item.animeId ?? item.slug ?? ''}`}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <AnimeCard title={item.title} poster={item.poster} type="movie"
                      status={item.status}
                      episode={scoreStr(item.score) ? `★ ${scoreStr(item.score)}` : undefined}
                      onPress={() => goDetail(item)} />
                  )}
                />
              </View>
            )}
            {kompiMovies.length === 0 && sameMovies.length === 0 && (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tidak ada data tersedia</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
    }

    const styles = StyleSheet.create({
    root: { flex: 1 }, header: { paddingHorizontal: 16, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.3 }, sub: { fontSize: 12, marginTop: 2 },
    section: { marginBottom: 28 }, hList: { paddingHorizontal: 16, gap: 12 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }, emptyText: { fontSize: 14 },
    });
    