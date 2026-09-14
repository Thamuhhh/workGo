import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text as RNText, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { Icon } from './Icon';
import { BorderRadius, Spacing } from '../constants/theme';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  trackText?: string;
  confirmText?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 0.7;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  trackText = 'Swipe to Apply →',
  confirmText = '✓ Applied!',
  disabled = false,
}) => {
  const THUMB_SIZE = 50;

  const thumbX = useRef(new Animated.Value(0)).current;
  const thumbXVal = useRef(0);
  const trackWidth = useRef(280);
  const startX = useRef(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = thumbX.addListener(({ value }) => { thumbXVal.current = value; });
    return () => thumbX.removeListener(id);
  }, [thumbX]);

  const MAX_DRAG = () => trackWidth.current - THUMB_SIZE - 8;

  const fillWidth = thumbX.interpolate({
    inputRange: [0, MAX_DRAG()],
    outputRange: [0, trackWidth.current],
    extrapolate: 'clamp',
  });

  const textOpacity = thumbX.interpolate({
    inputRange: [0, MAX_DRAG() * 0.25, MAX_DRAG() * 0.75],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  const confirmOpacity = thumbX.interpolate({
    inputRange: [MAX_DRAG() * 0.5, MAX_DRAG() * 0.8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (disabled || complete) return;
    startX.current = e.nativeEvent.pageX;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (disabled || complete) return;
    const dx = e.nativeEvent.pageX - startX.current;
    const clamped = Math.max(0, Math.min(MAX_DRAG(), dx));
    thumbX.setValue(clamped);
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (disabled || complete) return;
    const currentVal = thumbXVal.current;
    const progress = currentVal / MAX_DRAG();

    if (progress >= SWIPE_THRESHOLD) {
      setComplete(true);
      Animated.spring(thumbX, {
        toValue: MAX_DRAG(),
        useNativeDriver: false,
        friction: 8,
        tension: 200,
      }).start(() => {
        onConfirm();
      });
    } else {
      Animated.spring(thumbX, {
        toValue: 0,
        useNativeDriver: false,
        friction: 6,
        tension: 140,
      }).start();
    }
    startX.current = 0;
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.track, { width: trackWidth.current || 280 }]}
        onLayout={onTrackLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={() => {
          startX.current = 0;
          if (!complete) {
            Animated.spring(thumbX, { toValue: 0, useNativeDriver: false, friction: 6 }).start();
          }
        }}
      >
        <Animated.View style={[styles.fill, { width: fillWidth }]} />

        <Animated.View style={[styles.trackLabel, { opacity: textOpacity }]}>
          <RNText style={styles.trackLabelText}>{trackText}</RNText>
        </Animated.View>

        <Animated.View style={[styles.trackLabel, styles.confirmLabel, { opacity: confirmOpacity }]}>
          <RNText style={styles.confirmLabelText}>{confirmText}</RNText>
        </Animated.View>

        <Animated.View
          style={[
            styles.thumb,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              transform: [{ translateX: thumbX }],
            },
          ]}
        >
          <Icon name="arrow-forward" size={20} color="#FFFFFF" weight="bold" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  track: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#22C55E',
  },
  trackLabel: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmLabel: {
    flexDirection: 'row',
  },
  trackLabelText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  confirmLabelText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#0277F4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0277F4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});

export default SwipeToConfirm;