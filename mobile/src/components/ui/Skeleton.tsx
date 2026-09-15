import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '../../constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity: pulse },
        style,
      ]}
    />
  );
}

export function SkeletonJobCard({ count = 1 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.col}>
              <Skeleton width="72%" height={18} radius={6} />
              <Skeleton width="52%" height={12} radius={6} style={styles.gap} />
            </View>
            <Skeleton width={74} height={26} radius={6} />
          </View>

          <Skeleton width="100%" height={12} radius={6} style={styles.gap} />

          <View style={styles.metaRow}>
            <Skeleton width="45%" height={12} radius={6} />
            <Skeleton width={52} height={22} radius={999} />
          </View>

          <Skeleton width="100%" height={40} radius={10} style={styles.gap} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E9F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  col: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  gap: {
    marginTop: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
});