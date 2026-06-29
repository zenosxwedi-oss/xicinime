import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, FlatList,
  Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimeCard from '@/components/AnimeCard';
import SectionHeader from '@/components/SectionHeader';
import { CardSkeleton } from '@/components/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/Theme';
import { api } from '@/services/api';
import { showRewardedAd } from '@/utils/admob';

const BANNER_H = 240;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [rewardVisible, setRewardVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.home();
      setHomeData(res?.data ?? res);
    } catch {
      if (!silent) Alert.alert('Gagal memuat', 'Periksa koneksi internetmu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = () => {
    setRewardVisible(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setRewardVisible(false));
  };

  const handleSupport = async () => {
    setAdLoading(true);
    try {
      await showRewardedAd(() => showToast(), () => Alert.alert('Info', 'Tidak ada iklan tersedia. Coba lagi nanti.'));
    } catch { showToast(); }
    finally { setAdLoading(false); }
  };

  const headerOpacity = scrollY.interpolate({ inputRange: [0, BANNER_H - 60], outputRange: [0, 1], extrapolate: 'clamp' });
  const ongoing: any[] = homeData?.ongoingAnime ?? [];
  const completed: any[] = homeData?.completedAnime ?? [];
  const featured = ongoing[0];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top + 4, opacity: headerOpacity }]}>
        <Text style={styles.stickyTitle}>XICINIME</Text>
        <Pressable onPress={() => router.push('/search' as any)} style={styles.iconBtn}>
          <Feather name="search" size={18} color={Colors.text} />
        </Pressable>
      </Animated.View>

      {rewardVisible && (
        <Animated.View style={[styles.toast, { top: insets.top + 62, opacity: toastAnim }]}>
          <Text style={styles.toastText}>💜 Terima kasih mendukung Xicinime!</Text>
        </Animated.View>
      )}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <View style={styles.hero}>
          {featured && (
            <Image source={{ uri: featured.poster || featured.poster_url }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={8} />
          )}
          <LinearGradient colors={['transparent', 'rgba(8,8,15,0.6)', Colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.logoText}>XICINIME</Text>
            <Text style={styles.logoSub}>Nonton anime sub indo gratis</Text>
            <Pressable style={styles.heroSearch} onPress={() => router.push('/search' as any)}>
              <Feather name="search" size={15} color={Colors.subtext} />
              <Text style={styles.heroSearchText}>Cari judul anime...</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Sedang Tayang" emoji="🔥" />
          <FlatList
            horizontal
            data={loading ? [1,2,3,4] as any[] : ongoing}
            keyExtractor={i => loading ? String(i) : (i.animeId || i.slug || i.title)}
            renderItem={({ item }) => loading ? <CardSkeleton /> : (
              <AnimeCard {...item} status="ONGOING" latestEpisodeSlug={item.episodeList?.[0]?.slug ?? item.latestEpisodeSlug} />
            )}
            contentContainerStyle={styles.rowPad}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Selesai Tayang" emoji="✅" />
          <FlatList
            horizontal
            data={loading ? [1,2,3,4] as any[] : completed}
            keyExtractor={i => loading ? String(i) : (i.animeId || i.slug || i.title)}
            renderItem={({ item }) => loading ? <CardSkeleton /> : <AnimeCard {...item} status="COMPLETED" />}
            contentContainerStyle={styles.rowPad}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={{ height: 24 }} />
      </Animated.ScrollView>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 76 }, adLoading && { opacity: 0.7 }]}
        onPress={handleSupport}
        disabled={adLoading}
      >
        {adLoading
          ? <ActivityIndicator size="small" color={Colors.white} />
          : <><Feather name="heart" size={14} color={Colors.white} /><Text style={styles.fabText}>Dukung</Text></>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stickyTitle: { color: Colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hero: { height: BANNER_H, justifyContent: 'flex-end' },
  heroContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  logoText: { color: Colors.white, fontSize: 28, fontWeight: '900', letterSpacing: 5, textShadowColor: Colors.primary, textShadowRadius: 14 },
  logoSub: { color: Colors.subtext, fontSize: 12, marginTop: 2, marginBottom: 12 },
  heroSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, borderColor: Colors.border,
  },
  heroSearchText: { color: Colors.subtext, fontSize: 14 },
  section: { marginTop: Spacing.xl },
  rowPad: { paddingHorizontal: Spacing.lg },
  fab: {
    position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.full, elevation: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  fabText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  toast: {
    position: 'absolute', alignSelf: 'center', zIndex: 100,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full,
  },
  toastText: { color: Colors.text, fontWeight: '600', fontSize: 13 },
});
