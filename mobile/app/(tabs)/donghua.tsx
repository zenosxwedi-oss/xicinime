import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { donghua } from '@/services/api';

interface DonghuaItem {
  title: string;
  slug?: string;
  poster?: string;
  status?: string;
  type?: string;
  current_episode?: string;
  episode?: string;
  href?: string;
}

export default function DonghuaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [latest, setLatest] = useState<DonghuaItem[]>([]);
  const [popular, setPopular] = useState<DonghuaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const load = useCallback(async () => {
    try {
      const res = await donghua.home();
      const d = res?.data ?? res;
      setLatest(d?.latest_release ?? d?.latest ?? d?.recent ?? []);
      setPopular(d?.popular ?? d?.popular_release ?? []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const goDetail = (item: DonghuaItem) => {
    const slug = item.slug;
    if (slug) router.push(`/donghua/${slug}` as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Donghua</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Animasi China Sub Indo</Text>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 16 }}>
          <View style={styles.section}>
            <SectionHeader title="Terbaru" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </ScrollView>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={[{ type: 'latest' }, { type: 'popular' }]}
          keyExtractor={item => item.type}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80) }}
          renderItem={({ item }) => {
            if (item.type === 'latest' && latest.length > 0) return (
              <View style={styles.section}>
                <SectionHeader title="Episode Terbaru" />
                <FlatList
                  data={latest.slice(0, 20)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(d, i) => `lat-${d.slug ?? i}`}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item: d }) => (
                    <AnimeCard
                      title={d.title}
                      poster={d.poster}
                      episode={d.current_episode ?? d.episode}
                      status={d.status}
                      onPress={() => goDetail(d)}
                    />
                  )}
                />
              </View>
            );
            if (item.type === 'popular' && popular.length > 0) return (
              <View style={styles.section}>
                <SectionHeader title="Populer" />
                <FlatList
                  data={popular.slice(0, 20)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(d, i) => `pop-${d.slug ?? i}`}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item: d }) => (
                    <AnimeCard
                      title={d.title}
                      poster={d.poster}
                      episode={d.current_episode}
                      status={d.status}
                      onPress={() => goDetail(d)}
                    />
                  )}
                />
              </View>
            );
            return null;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.3 },
  sub: { fontSize: 12, marginTop: 2 },
  section: { marginBottom: 28 },
  hList: { paddingHorizontal: 16, gap: 12 },
});
