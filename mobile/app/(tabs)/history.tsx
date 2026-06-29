import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/Theme';
import { clearWatchHistory, formatTime, getWatchHistory, HistoryItem } from '@/utils/watchHistory';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const load = useCallback(async () => {
    const h = await getWatchHistory();
    setHistory(h);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleClear = () => {
    Alert.alert('Hapus Riwayat', 'Yakin ingin menghapus semua riwayat nonton?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await clearWatchHistory(); setHistory([]); } },
    ]);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const progress = item.duration > 0 ? Math.min(item.currentTime / item.duration, 1) : 0;
    const timeLeft = item.duration > item.currentTime ? formatTime(item.duration - item.currentTime) : null;
    const date = new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]}
        onPress={() => router.push(`/watch/${item.episodeId}` as any)}
      >
        <View style={styles.thumbWrap}>
          <Image source={{ uri: item.poster }} style={styles.thumb} contentFit="cover" placeholder={undefined} />
          <View style={styles.playOverlay}>
            <Feather name="play" size={20} color={Colors.white} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.animeTitle} numberOfLines={1}>{item.animeTitle}</Text>
          <Text style={styles.epTitle} numberOfLines={1}>{item.episodeTitle}</Text>
          {progress > 0 && (
            <View style={styles.progressWrap}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` as any }]} />
            </View>
          )}
          <View style={styles.meta}>
            <Text style={styles.metaText}>{date}</Text>
            {timeLeft && <Text style={styles.metaText}>⏱ {timeLeft} lagi</Text>}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Nonton</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Feather name="trash-2" size={16} color={Colors.error} />
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clock" size={56} color={Colors.muted} />
          <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
          <Text style={styles.emptySub}>Anime yang sudah kamu tonton akan muncul di sini</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={i => i.episodeId + i.timestamp}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  clearBtn: { padding: 6 },
  card: {
    flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  thumbWrap: { position: 'relative', width: 90, height: 120, borderRadius: Radius.md, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, justifyContent: 'center' },
  animeTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  epTitle: { color: Colors.subtext, fontSize: 12, marginBottom: 8 },
  progressWrap: { height: 3, backgroundColor: Colors.surface3, borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  meta: { flexDirection: 'row', gap: 12 },
  metaText: { color: Colors.muted, fontSize: 11 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptySub: { color: Colors.subtext, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
