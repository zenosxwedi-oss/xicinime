import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/Theme';

interface Props {
  title: string;
  emoji?: string;
  href?: string;
}

export default function SectionHeader({ title, emoji, href }: Props) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Text style={styles.title}>
        {emoji ? `${emoji} ` : ''}{title}
      </Text>
      {href && (
        <Pressable onPress={() => router.push(href as any)}>
          <Text style={styles.link}>Lihat Semua →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  link: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
