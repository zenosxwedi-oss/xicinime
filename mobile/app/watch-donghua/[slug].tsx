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
import { donghua } from '@/services/api';
import { addHistory } from '@/utils/watchHistory';

interface DonghuaEp {
  title?: string;
  donghuaTitle?: string;
  poster?: string;
  streamingUrl?: string;
  servers?: { name?: string; url?: string; embed?: string }[];
  prevEpisode?: string;
  nextEpisode?: string;
  donghuaId?: string;
  slug?: string;
}

export default function WatchDonghuaScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [data, setData] = useState<DonghuaEp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    donghua.episode(slug as string)
      .then(res => {
        const d = res?.data ?? res;
        setData(d);
        if (d) {
          addHistory({
            id: slug as string,
            slug: d.donghuaId ?? d.slug ?? (slug as string),
            title: d.donghuaTitle ?? d.title ?? 'Donghua',
            poster: d.poster,
            episode: d.title,
            type: 'donghua',
          });
        }
      })
      .catch(() => setError('Gagal memuat episode'))
      .finally(() => setLoading(false));
  }, [slug]);

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

  const servers = data.servers ?? [];
  const activeServer = servers[selectedServer];
  const streamUrl = activeServer?.url ?? activeServer?.embed ?? data.streamingUrl;

  const openStream = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN });
    } catch {
      Linking.openURL(url);
    }
  };

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
          {data.donghuaTitle && (
            <Text style={[styles.seriesTitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {data.donghuaTitle}
            </Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32, padding: 16 }}>
        {streamUrl && (
          <Pressable
            style={[styles.streamBtn, { backgroundColor: colors.primary }]}
            onPress={() => openStream(streamUrl)}
          >
            <Feather name="play-circle" size={22} color="#fff" />
            <Text style={styles.streamBtnText}>Tonton di Browser</Text>
          </Pressable>
        )}

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
                  <Text style={[styles.serverName, { color: selectedServer === i ? '#fff' : colors.foreground }]}>
                    {s.name ?? `Server ${i + 1}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.navRow}>
          {data.prevEpisode && (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.replace(`/watch-donghua/${data.prevEpisode}` as any)}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.navText, { color: colors.foreground }]}>Sebelumnya</Text>
            </Pressable>
          )}
          {data.nextEpisode && (
            <Pressable
              style={[styles.navBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={() => router.replace(`/watch-donghua/${data.nextEpisode}` as any)}
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
  seriesTitle: { fontSize: 12, marginTop: 2 },
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
  navRow: { flexDirection: 'row', gap: 10 },
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
});
