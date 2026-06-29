import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, BackHandler, Platform, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/Theme';
import { api } from '@/services/api';
import { addToWatchHistory } from '@/utils/watchHistory';
import { showRewardedAd } from '@/utils/admob';

const SITE_WATCH = 'https://xicinime.my.id/watch/';
const ADMOB_BANNER_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3848627834535677/5316005468';

export default function WatchScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [epData, setEpData] = useState<any>(null);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) { webRef.current.goBack(); return true; }
      return false;
    });
    return () => handler.remove();
  }, [canGoBack]);

  useEffect(() => {
    if (!episodeId) return;
    api.episodeDetail(episodeId)
      .then(res => {
        const d = res?.data ?? res;
        setEpData(d);
        addToWatchHistory({
          episodeId,
          animeId: d?.animeId || d?.animeSlug || episodeId,
          animeTitle: d?.animeTitle || d?.title || episodeId,
          episodeTitle: d?.title || episodeId,
          poster: d?.animePoster || d?.poster || '',
          provider: 'otakudesu',
        });
      })
      .catch(() => {
        addToWatchHistory({
          episodeId,
          animeId: episodeId,
          animeTitle: 'Episode',
          episodeTitle: episodeId,
          poster: '',
          provider: 'otakudesu',
        });
      });
  }, [episodeId]);

  const handleAdSupport = useCallback(async () => {
    setAdLoading(true);
    try {
      await showRewardedAd(
        () => Alert.alert('💜 Terima Kasih!', 'Dukunganmu sangat berarti untuk Xicinime!'),
        () => Alert.alert('Info', 'Tidak ada iklan tersedia saat ini.'),
      );
    } catch {}
    finally { setAdLoading(false); }
  }, []);

  const prevSlug = epData?.navigation?.previous_episode?.slug;
  const nextSlug = epData?.navigation?.next_episode?.slug;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {epData?.title || episodeId}
        </Text>
        <Pressable onPress={handleAdSupport} disabled={adLoading} style={styles.iconBtn}>
          {adLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Feather name="heart" size={18} color={Colors.primary} />}
        </Pressable>
      </View>

      {/* WebView player */}
      <View style={styles.playerWrap}>
        {loading && (
          <View style={styles.playerLoading}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadText}>Memuat video...</Text>
          </View>
        )}
        <WebView
          ref={webRef}
          source={{ uri: `${SITE_WATCH}${episodeId}` }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={s => setCanGoBack(s.canGoBack)}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
          userAgent="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36"
        />
      </View>

      {/* AdMob Banner between player and nav */}
      <View style={styles.adWrap}>
        <BannerAd
          unitId={ADMOB_BANNER_ID}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>

      {/* Navigation */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable
          style={[styles.navBtn, !prevSlug && styles.navBtnDisabled]}
          disabled={!prevSlug}
          onPress={() => prevSlug && router.replace(`/watch/${prevSlug}` as any)}
        >
          <Feather name="chevron-left" size={16} color={prevSlug ? Colors.text : Colors.muted} />
          <Text style={[styles.navText, !prevSlug && { color: Colors.muted }]}>Sebelumnya</Text>
        </Pressable>

        <Pressable style={styles.episodesBtn} onPress={() => router.back()}>
          <Feather name="list" size={14} color={Colors.white} />
          <Text style={styles.episodesBtnText}>Episode</Text>
        </Pressable>

        <Pressable
          style={[styles.navBtn, !nextSlug && styles.navBtnDisabled]}
          disabled={!nextSlug}
          onPress={() => nextSlug && router.replace(`/watch/${nextSlug}` as any)}
        >
          <Text style={[styles.navText, !nextSlug && { color: Colors.muted }]}>Berikutnya</Text>
          <Feather name="chevron-right" size={16} color={nextSlug ? Colors.text : Colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600', marginHorizontal: 8 },
  playerWrap: { flex: 1, position: 'relative', backgroundColor: Colors.black },
  playerLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, zIndex: 5 },
  loadText: { color: Colors.subtext, marginTop: 12, fontSize: 13 },
  webview: { flex: 1, backgroundColor: Colors.black },
  adWrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, minHeight: 52, paddingVertical: 4 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 10,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  navBtnDisabled: { opacity: 0.4 },
  navText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  episodesBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full,
  },
  episodesBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
