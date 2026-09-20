import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { Text } from './ui';
import { Icon as Ionicons } from './Icon';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: string;
  onPress?: () => void;
}

interface BannerCarouselProps {
  banners: Banner[];
  intervalMs?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  intervalMs = 3500,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % banners.length;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      indexRef.current = next;
      setActive(next);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    indexRef.current = idx;
    setActive(idx);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {banners.map((b) => (
          <View key={b.id} style={styles.slide}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={b.onPress}
              style={styles.cardTouch}
            >
              <View style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name={b.icon} size={20} color="#0F172A" />
                </View>
                <Text variant="h3" weight="bold" color="#0F172A">
                  {b.title}
                </Text>
                <Text variant="bodySm" color="#64748B" style={styles.subtitle}>
                  {b.subtitle}
                </Text>
                <View style={styles.ctaRow}>
                  <Text variant="bodySm" weight="bold" color="#0F172A">
                    {b.cta}
                  </Text>
                  <Ionicons name="arrow-right" size={13} color="#0F172A" weight="bold" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View key={b.id} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.xl,
  },
  cardTouch: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    padding: Spacing.xl,
    minHeight: 148,
    justifyContent: 'center',
  },
  cardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0F172A',
  },
});