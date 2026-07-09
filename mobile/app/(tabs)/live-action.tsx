import { useRouter } from 'expo-router';
    import { StatusBar } from 'expo-status-bar';
    import React, { useCallback, useEffect, useState } from 'react';
    import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
    import { useSafeAreaInsets } from 'react-native-safe-area-context';
    import AnimeCard from '@/components/AnimeCard';
    import SectionHeader from '@/components/SectionHeader';
    import { useColors } from '@/hooks/useColors';
    import { animekompi } from '@/services/api';

    interface LiveActionItem {
    title: string; slug?: string; animeId?: string; poster?: string;
    type?: string; episodes?: string;
    }

    export default function LiveActionScreen() {
    const insets    = useSafeAreaInsets();
    const router    = useRouter();
    const colors    = useColors();
    const [items,       setItems]       = useState<LiveActionItem[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [refreshing,  setRefreshing]  = useState(false);
    const [page,        setPage]        = useState(1);
    const [hasMore,     setHasMore]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const webTop = Platform.OS === 'web' ? 67 : 0;

    const fetchPage = useCallback(async (pageNum: number, reset = false) => {
      try {
        if (reset || pageNum === 1) setLoading(true);
        else setLoadingMore(true);
        const res = await animekompi.tokusatsu(pageNum);
        const list: LiveActionItem[] = ((res?.data ?? []) as any[]).map(item => ({
          title: item.title, slug: item.slug, animeId: item.slug,
          poster: item.poster, type: item.type || 'Live Action',
          episodes: item.episode || '',
        }));
        setItems(prev => (reset || pageNum === 1) ? list : [...prev, ...list]);
        setHasMore(res?.pagination?.hasNextPage ?? list.length >= 12);
        setPage(pageNum);
      } catch {}
      finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchPage(1, true); }, [fetchPage]);
    const onRefresh = () => { setRefreshing(true); fetchPage(1, true); };
    const loadMore = () => { if (hasMore && !loadingMore) fetchPage(page + 1); };
    const goDetail = (item: LiveActionItem) => {
      if (item.slug) router.push(`/anime/${item.slug}` as any);
    };

    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar style="light" />
        <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Action</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Tokusatsu & live action sub indo</Text>
        </View>
        <FlatList
          data={loading ? [] : items}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }]}
          keyExtractor={(item, i) => `la-${i}-${item.slug ?? ''}`}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <SectionHeader title={loading ? 'Live Action & Tokusatsu' : `Live Action & Tokusatsu (${items.length}${hasMore ? '+' : ''})`} />
            </View>
          }
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tidak ada data tersedia</Text>
              </View>
            )
          }
          ListFooterComponent={
            hasMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontSize: 13 }} onPress={loadMore}>
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak →'}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <AnimeCard
                title={item.title} poster={item.poster}
                type={item.type || 'live-action'}
                status={item.type || 'Live Action'}
                episode={item.episodes || undefined}
                onPress={() => goDetail(item)}
              />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
    );
    }

    const styles = StyleSheet.create({
    root: { flex: 1 }, header: { paddingHorizontal: 16, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.3 }, sub: { fontSize: 12, marginTop: 2 },
    grid: { paddingHorizontal: 8, paddingTop: 8 },
    gridItem: { flex: 1, maxWidth: '50%', padding: 6 },
    listHeader: { paddingHorizontal: 8, paddingTop: 8 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyText: { fontSize: 14 },
    });
    