import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  width: number | string;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width, height, radius = 8, style }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a1a2e', '#252540'],
  });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: bg },
        style,
      ]}
    />
  );
}

export function CardSkeleton({ width = 130 }: { width?: number }) {
  return (
    <View style={{ gap: 6, marginRight: 12 }}>
      <Skeleton width={width} height={width * 1.42} radius={12} />
      <Skeleton width={width} height={12} radius={6} />
      <Skeleton width={width * 0.65} height={10} radius={6} />
    </View>
  );
}

export function RowSkeleton() {
  return (
    <View style={styles.rowSkeleton}>
      <Skeleton width={70} height={100} radius={8} />
      <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
        <Skeleton width="90%" height={14} radius={6} />
        <Skeleton width="60%" height={11} radius={6} />
        <Skeleton width="40%" height={10} radius={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowSkeleton: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
