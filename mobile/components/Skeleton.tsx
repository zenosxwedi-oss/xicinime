import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, Radius } from '@/constants/Theme';

interface Props {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: object;
}

export default function Skeleton({ width = '100%', height = 16, radius = Radius.sm, style }: Props) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: Colors.surface3, opacity: anim },
        style,
      ]}
    />
  );
}

export function CardSkeleton({ width = 130 }: { width?: number }) {
  return (
    <View style={{ marginRight: 8 }}>
      <Skeleton width={width} height={185} radius={14} />
      <Skeleton width={width} height={12} radius={6} style={{ marginTop: 8 }} />
      <Skeleton width={width * 0.7} height={10} radius={6} style={{ marginTop: 4 }} />
    </View>
  );
}
