import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  title: string;
  poster?: string;
  episode?: string;
  status?: string;
  type?: string;
  width?: number;
  onPress: () => void;
}

export default function AnimeCard({
  title,
  poster,
  episode,
  status,
  type,
  width = 130,
  onPress,
}: Props) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, { width, opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.imgWrap, { borderRadius: colors.radius, width, height: width * 1.42 }]}>
        <Image
          source={{ uri: poster }}
          style={styles.img}
          contentFit="cover"
          placeholder={require('@/assets/images/icon.png')}
          transition={300}
        />
        {status && (
          <View style={[
            styles.badge,
            { backgroundColor: status.toLowerCase() === 'ongoing' ? colors.primary : colors.success }
          ]}>
            <Text style={styles.badgeText} numberOfLines={1}>{status}</Text>
          </View>
        )}
        {type && type.toLowerCase() === 'movie' && (
          <View style={[styles.typeBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.badgeText}>Movie</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{title}</Text>
      {episode && (
        <Text style={[styles.ep, { color: colors.mutedForeground }]} numberOfLines={1}>{episode}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  imgWrap: {
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  ep: {
    fontSize: 11,
  },
});
