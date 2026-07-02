import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { anime } from '@/services/api';
import { addHistory } from '@/utils/watchHistory';

// WebView is native-only — safe import
let WebView: any = null;
if (Platform.OS !== 'web') {
  try { WebView = require('react-native-webview').WebView; } catch {}
}

interface ServerItem {
  title: string;
  serverId: string;
  href?: string;
}
interface Quality {
  title: string;
  serverList: ServerItem[];
}

interface EpisodeData {
  title?: string;
  animeTitle?: string;
  animeId?: string;
  slug?: string;
  poster?: string;
  defaultStreamingUrl?: string;
  hasPrevEpisode?: boolean;
  prevEpisode?: { episodeId?: string; title?: string } | null;
  hasNextEpisode?: boolean;
  nextEpisode?: { episodeId?: string; title?: string } | null;
  server?: { qualities?: Quality[] };
}

export default function WatchScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [data, setData]     = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [resolving, setResolving] = useState(false);
  const [activeQuality, setActiveQuality] = useState(0);
  const [activeServer, setActiveServer]   = useState(0);

  useEffect(() => {
    if (!episodeId) return;
    setLoading(true);
    setError('');
    anime.episode(episodeId as string)
      .then(res => {
        const d: EpisodeData = res?.data ?? res;
        setData(d);
        if (d?.defaultStreamingUrl) setStreamUrl(d.defaultStreamingUrl);
        if (d) {
          addHistory({
            id: episodeId as string,
            slug: d.animeId ?? d.slug ?? (episodeId as string),
            title: d.animeTitle ?? d.title ?? 'Unknown',
            poster: d.poster,
            episode: d.title,
            type: 'anime',
          });
        }
      })
      .catch(() => setError('Gagal memuat episode'))
      .finally(() => setLoading(false));
  }, [episodeId]);

  const qualities: Quality[] = data?.server?.qualities ?? [];
  const currentQuality = qualities[activeQuality];
  const currentServer  = currentQuality?.serverList?.[activeServer];

  const selectServer = async (qIdx: number, sIdx: number) => {
    setActiveQuality(qIdx);
    setActiveServer(sIdx);
    const srv = qualities[qIdx]?.serverList?.[sIdx];
    if (!srv?.serverId) return;
    setResolving(true);
    try {
      const res = await anime.server(srv.serverId);
      const url = res?.data?.url ?? res?.url;
      if (url) setStreamUrl(url);
    } catch {}
    setResolving(false);
  };

  if (loading) return (
    <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Memuat episode...</Text>
    </View>
  );

  if (error || !data) return (
    <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
      <Feather name="alert-circle" size={48} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.foreground }]}>{error || 'Episode tidak ditemukan'}</Text>
      <Pressable style={[styles.pill, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
        <Text style={styles.pillText}>Kembali</Text>
      </Pressable>
    </View>
  );

  const prevId = data.prevEpisode?.episodeId;
  const nextId = data.nextEpisode?.episodeId;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={1}>
            {data.title ?? 'Episode'}
          </Text>
          {data.animeTitle && (
            <Text style={[styles.animeName, { color: colors.mutedForeground }]} numberOfLines={1}>
              {data.animeTitle}
            </Text>
          )}
        </View>
      </View>

      {/* Player */}
      {streamUrl ? (
        Platform.OS === 'web' ? (
          // Web preview — open in tab
          <View style={[styles.webPlayer, { backgroundColor: colors.card }]}>
            <Feather name="play-circle" size={56} color={colors.primary} />
            <Text style={[styles.webLabel, { color: colors.foreground }]}>
              {data.title ?? 'Stream'}
            </Text>
            <Pressable style={[styles.webBtn, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL(streamUrl)}>
              <Feather name="external-link" size={16} color="#fff" />
              <Text style={styles.webBtnText}>Tonton Sekarang</Text>
            </Pressable>
            <Text style={[styles.webHint, { color: colors.mutedForeground }]}>
              WebView aktif di APK/Expo Go native
            </Text>
          </View>
        ) : (
          WebView ? (
            <View style={styles.playerWrapper}>
              {resolving && (
                <View style={styles.resolveOverlay}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
              <WebView
                key={streamUrl}
                source={{ uri: streamUrl }}
                style={styles.webview}
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                scalesPageToFit
                onError={() => Linking.openURL(streamUrl)}
              />
            </View>
          ) : (
            <View style={[styles.webPlayer, { backgroundColor: colors.card }]}>
              <Pressable style={[styles.webBtn, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL(streamUrl)}>
                <Feather name="play-circle" size={18} color="#fff" />
                <Text style={styles.webBtnText}>Buka Stream</Text>
              </Pressable>
            </View>
          )
        )
      ) : (
        <View style={[styles.webPlayer, { backgroundColor: colors.card }]}>
          <Feather name="video-off" size={40} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Pilih server untuk menonton</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32, padding: 16 }}>
        {/* Server Quality Selector */}
        {qualities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pilih Server</Text>
            {qualities.map((q, qi) => (
              <View key={qi} style={{ marginBottom: 12 }}>
                <Text style={[styles.qualityLabel, { color: colors.mutedForeground }]}>
                  {q.title === 'unknown' ? 'Default' : q.title}
                </Text>
                <View style={styles.serverRow}>
                  {q.serverList.map((srv, si) => {
                    const active = activeQuality === qi && activeServer === si;
                    return (
                      <Pressable
                        key={si}
                        style={[
                          styles.serverChip,
                          {
                            backgroundColor: active ? colors.primary : colors.card,
                            borderColor: active ? colors.primary : colors.border,
                          }
                        ]}
                        onPress={() => selectServer(qi, si)}
                        disabled={resolving}
                      >
                        <Text style={[styles.serverChipText, { color: active ? '#fff' : colors.foreground }]}>
                          {srv.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Prev / Next */}
        <View style={styles.navRow}>
          {prevId ? (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.replace(`/watch/${prevId}` as any)}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.navText, { color: colors.foreground }]}>Sebelumnya</Text>
            </Pressable>
          ) : <View style={{ flex: 1 }} />}
          {nextId && (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => router.replace(`/watch/${nextId}` as any)}
            >
              <Text style={[styles.navText, { color: '#fff' }]}>Selanjutnya</Text>
              <Feather name="chevron-right" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, gap: 12,
  },
  backBtn:  { padding: 4 },
  epTitle:  { fontSize: 15, fontWeight: '700' },
  animeName:{ fontSize: 12, marginTop: 2 },
  errorText:{ fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  pill:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  pillText: { color: '#fff', fontWeight: '700' },

  playerWrapper: { height: 230, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  resolveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },

  webPlayer: {
    height: 200, alignItems: 'center', justifyContent: 'center',
    gap: 14, marginHorizontal: 0,
  },
  webLabel:  { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  webBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  webBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  webHint:   { fontSize: 11, textAlign: 'center', paddingHorizontal: 24 },

  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  qualityLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  serverRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serverChip:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  serverChipText:{ fontSize: 12, fontWeight: '600' },

  navRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, padding: 12,
    borderRadius: 10, borderWidth: 1,
  },
  navText: { fontSize: 13, fontWeight: '600' },
});
