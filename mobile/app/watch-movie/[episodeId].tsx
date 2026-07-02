import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { movies } from '@/services/api';
import { addHistory } from '@/utils/watchHistory';

export default function WatchMovieScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState(0);

  useEffect(() => {
    if (!episodeId) return;
    setLoading(true);
    movies.episode(episodeId as string)
      .then(res => {
        const d = res?.data ?? res;
        setData(d);
        if (d) {
          addHistory({
            id: episodeId as string,
            slug: d.animeId ?? d.slug ?? (episodeId as string),
            title: d.animeTitle ?? d.title ?? 'Movie',
            poster: d.poster,
            episode: d.title,
            type: 'movie',
          });
        }
      })
      .catch(() => setError('Gagal memuat episode'))
      .finally(() => setLoading(false));
  }, [episodeId]);

  if (loading) return (
    <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.primary} />
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

  const servers = data.servers ?? data.streamServer ?? [];
  const activeServer = servers[selectedServer];
  const streamUrl = activeServer?.url ?? activeServer?.embed ?? data.streamingUrl;

  const openStream = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN });
    } catch { Linking.openURL(url); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {data.title ?? 'Movie'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        {streamUrl && (
          <Pressable style={[styles.streamBtn, { backgroundColor: colors.primary }]} onPress={() => openStream(streamUrl)}>
            <Feather name="play-circle" size={22} color="#fff" />
            <Text style={styles.streamBtnText}>Tonton di Browser</Text>
          </Pressable>
        )}
        {servers.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Server</Text>
            <View style={styles.serverGrid}>
              {servers.map((s: any, i: number) => (
                <Pressable
                  key={i}
                  style={[styles.serverBtn, { backgroundColor: selectedServer === i ? colors.primary : colors.card, borderColor: selectedServer === i ? colors.primary : colors.border }]}
                  onPress={() => setSelectedServer(i)}
                >
                  <Text style={[styles.serverName, { color: selectedServer === i ? '#fff' : colors.foreground }]}>
                    {s.server ?? s.name ?? `S${i + 1}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 15, fontWeight: '700' },
  errorText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontWeight: '700' },
  streamBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 14, marginBottom: 20 },
  streamBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  serverGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serverBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  serverName: { fontSize: 13, fontWeight: '600' },
});
