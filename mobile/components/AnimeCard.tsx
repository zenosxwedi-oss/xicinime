import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/Theme';

interface Props {
  animeId?: string;
  slug?: string;
  title: string;
  poster?: string;
  poster_url?: string;
  status?: string;
  episodes?: string | number;
  type?: string;
  latestEpisodeSlug?: string;
  source?: 'otakudesu' | 'donghua';
  width?: number;
}

const statusColor: Record<string, string> = {
  ONGOING: Colors.primary,
  COMPLETED: Colors.success,
  DONGHUA: Colors.donghua,
};

export default function AnimeCard({
  slug,
  animeId,
  title,
  poster,
  poster_url,
  status,
  episodes,
  latestEpisodeSlug,
  source = 'otakudesu',
  width = 130,
}: Props) {
  const router = useRouter();
  const imgSrc = poster || poster_url || '';
  const id = slug || animeId || '';
  const statusUp = status?.toUpperCase();
  const badgeColor = statusUp ? (statusColor[statusUp] ?? Colors.primary) : Colors.primary;

  const handlePress = () => {
    if (latestEpisodeSlug) {
      router.push(`/watch/${latestEpisodeSlug}`);
    } else {
      router.push(`/anime/${id}?source=${source}`);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width, opacity: pressed ? 0.82 : 1 }]}
      onPress={handlePress}
    >
      <View style={[styles.imageWrap, { width }]}>
        <Image
          source={{ uri: imgSrc }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={undefined}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        {statusUp && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{statusUp}</Text>
          </View>
        )}
        {episodes != null && (
          <View style={styles.epsBadge}>
            <Text style={styles.epsText}>{episodes} eps</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { width }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: Spacing.sm,
  },
  imageWrap: {
    height: 185,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  epsBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  epsText: {
    color: Colors.subtext,
    fontSize: 9,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 16,
  },
});
