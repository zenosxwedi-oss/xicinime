import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { clearHistory, getHistory, removeHistoryItem, type HistoryItem } from '@/utils/watchHistory';
import { useFocusEffect } from 'expo-router';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const load = useCallback(async () => {
    const h = await getHistory();
    setHistory(h);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleClearAll = () => {
    Alert.alert('Hapus Riwayat', 'Yakin ingin menghapus semua riwayat?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await clearHistory(); setHistory([]); } },
    ]);
  };

  const handleDelete = async (id: string) => {
    await removeHistoryItem(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const goItem = (item: HistoryItem) => {
    if (item.type === 'donghua') router.push(`/donghua/${item.slug}` as any);
    else if (item.type === 'movie') router.push(`/movie/${item.slug}` as any);
    else router.push(`/anime/${item.slug}` as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Riwayat</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClearAll}>
            <Text style={[styles.clearBtn, { color: colors.destructive }]}>Hapus Semua</Text>
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clock" size={52} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Belum ada riwayat</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Anime yang kamu tonton akan muncul di sini</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 84 : 80), paddingTop: 8 }}
          renderItem={({ item }) => (
            <Pressable style={[styles.item, { borderBottomColor: colors.border }]} onPress={() => goItem(item)}>
              <Image
                source={{ uri: item.poster }}
                style={[styles.poster, { borderRadius: colors.radius / 2 }]}
                contentFit="cover"
                placeholder={require('@/assets/images/icon.png')}
              />
              <View style={styles.info}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                {item.episode && (
                  <Text style={[styles.itemEp, { color: colors.primary }]}>{item.episode}</Text>
                )}
                <View style={styles.itemMeta}>
                  <View style={[styles.typePill, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.typeText, { color: colors.mutedForeground }]}>
                      {item.type === 'donghua' ? 'Donghua' : item.type === 'movie' ? 'Movie' : 'Anime'}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{timeAgo(item.watchedAt)}</Text>
                </View>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)} hitSlop={8}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '900' },
  clearBtn: { fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  poster: { width: 64, height: 90 },
  info: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  itemEp: { fontSize: 12, fontWeight: '600' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '600' },
  timeText: { fontSize: 11 },
  deleteBtn: { padding: 4 },
});
