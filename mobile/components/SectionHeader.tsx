import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  title: string;
  href?: string;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, href, onSeeAll }: Props) {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (onSeeAll) { onSeeAll(); return; }
    if (href) router.push(href as any);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {(href || onSeeAll) && (
        <Pressable style={styles.seeAll} onPress={handlePress}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>Lihat Semua</Text>
          <Feather name="chevron-right" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  accent: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.2,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
