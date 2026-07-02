import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

interface StreamServer {
  server?: string;
  name?: string;
  url?: string;
  embed?: string;
  href?: string;
}

interface EpisodeData {
  title?: string;
  animeTitle?: string;
  poster?: string;
  streamingUrl?: string;
  downloadUrl?: string;
  servers?: StreamServer[];
  streamServer?: StreamServer[];
  mirrorEmbed?: StreamServer[];
  prevEpisode?: string;
  nextEpisode?: string;
  animeId?: string;
  slug?: string;
}

export default function WatchScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [data, setData] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState(0);

  useEffect(() => {
    if (!episodeId) return;
    setLoading(true);
    anime.episode(episodeId as string)
      .then(res => {
        const d = res?.data ?? res;
        setData(d);
        // Log to watch history
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

  const servers: StreamServer[] = data?.servers ?? data?.streamServer ?? data?.mirrorEmbed ?? [];
  const activeServer = servers[selectedServer];

  const openStream = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN });
    } catch {
      Linking.openURL(url);
    }
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
      <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
        <Text style={styles.btnText}>Kembali</Text>
      </Pressable>
    </View>
  );

  const streamUrl = activeServer?.url ?? activeServer?.embed ?? activeServer?.href ?? data.streamingUrl;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={1}>
            {data.title ?? 'Episode'}
          </Text>
          {data.animeTitle && (
            <Text style={[styles.animeTitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {data.animeTitle}
            </Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32, padding: 16 }}>
        {/* Stream via browser */}
        {streamUrl && (
          <Pressable
            style={[styles.streamBtn, { backgroundColor: colors.primary }]}
            onPress={() => openStream(streamUrl)}
          >
            <Feather name="play-circle" size={22} color="#fff" />
            <Text style={styles.streamBtnText}>Tonton di Browser</Text>
          </Pressable>
        )}

        {/* Server list */}
        {servers.length > 0 && (
          <View style={styles.serverSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pilih Server</Text>
            <View style={styles.serverGrid}>
              {servers.map((s, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.serverBtn,
                    {
                      backgroundColor: selectedServer === i ? colors.primary : colors.card,
                      borderColor: selectedServer === i ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedServer(i)}
                >
                  <Text style={[
                    styles.serverName,
                    { color: selectedServer === i ? '#fff' : colors.foreground }
                  ]}>
                    {s.server ?? s.name ?? `Server ${i + 1}`}
                  </Text>
                </Pressable>
              ))}
            </View>
            {activeServer && (activeServer.url ?? activeServer.embed ?? activeServer.href) && (
              <Pressable
                style={[styles.openBtn, { backgroundColor: colors.accent }]}
                onPress={() => openStream(activeServer.url ?? activeServer.embed ?? activeServer.href ?? '')}
              >
                <Feather name="external-link" size={16} color="#fff" />
                <Text style={styles.openBtnText}>Buka Server {activeServer.server ?? activeServer.name}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Navigation between episodes */}
        <View style={styles.navRow}>
          {data.prevEpisode && (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.replace(`/watch/${data.prevEpisode}` as any)}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.navText, { color: colors.foreground }]}>Sebelumnya</Text>
            </Pressable>
          )}
          {data.nextEpisode && (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => router.replace(`/watch/${data.nextEpisode}` as any)}
            >
              <Text style={[styles.navText, { color: '#fff' }]}>Selanjutnya</Text>
              <Feather name="chevron-right" size={18} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* Download link */}
        {data.downloadUrl && (
          <Pressable
            style={[styles.downloadBtn, { borderColor: colors.border }]}
            onPress={() => Linking.openURL(data.downloadUrl!)}
          >
            <Feather name="download" size={16} color={colors.primary} />
            <Text style={[styles.downloadText, { color: colors.primary }]}>Download Episode</Text>
          </Pressable>
        )}

        {/* Note about native build */}
        <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Untuk streaming langsung di app, install APK dari xicinime.my.id
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  epTitle: { fontSize: 15, fontWeight: '700' },
  animeTitle: { fontSize: 12, marginTop: 2 },
  errorText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontWeight: '700' },
  streamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  streamBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  serverSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  serverGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serverBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  serverName: { fontSize: 13, fontWeight: '600' },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    justifyContent: 'center',
  },
  openBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  navRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  navText: { fontSize: 13, fontWeight: '600' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  downloadText: { fontSize: 14, fontWeight: '600' },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
