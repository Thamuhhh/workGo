import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { Text } from './ui';

const DURATION = 1900;

export default function BrandSplash() {
  const logo = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [skipped, setSkipped] = useState(false);
  const ticker = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.spring(logo, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
    Animated.timing(tagline, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), delay: 260, useNativeDriver: true }).start();
    Animated.timing(progress, { toValue: 1, duration: DURATION, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start();

    ticker.current = setTimeout(() => dismiss(), DURATION + 260);
    return () => {
      if (ticker.current) clearTimeout(ticker.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (skipped) return;
    setSkipped(true);
    Animated.timing(fade, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const logoScale = logo.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const translateY = tagline.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  const barScaleX = progress;

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={styles.inner}>
          <View style={styles.brand}>
            <Animated.View style={{ opacity: logo, transform: [{ scale: logoScale }] }}>
              <Text variant="h1" weight="heavy" color="#FFFFFF" style={styles.logoRow}>
                Gig<Text variant="h1" weight="heavy" color="#FFFFFF">ro</Text>
              </Text>
            </Animated.View>
            <Animated.View style={{ opacity: tagline, transform: [{ translateY }] }}>
              <Text variant="body" weight="medium" color="#CBD5E1" style={styles.tagline}>
                Work nearby. Earn today.
              </Text>
            </Animated.View>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { transform: [{ scaleX: barScaleX }] }]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '55%',
    paddingBottom: 72,
  },
  brand: {
    alignItems: 'center',
  },
  logoRow: {
    fontSize: 52,
    lineHeight: 60,
  },
  tagline: {
    marginTop: 6,
    letterSpacing: 0.2,
  },
  progressTrack: {
    width: '34%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});