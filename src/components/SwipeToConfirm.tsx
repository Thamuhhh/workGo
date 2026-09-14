import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Text as RNText } from 'react-native';
import { Icon } from './Icon';
import { BorderRadius, Spacing } from '../constants/theme';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  trackText?: string;
  confirmText?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 0.75;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  trackText = 'Swipe to Apply →',
  confirmText = '✓ Applied!',
  disabled = false,
}) => {
  const TRACK_WIDTH = 280;
  const THUMB_SIZE = 50;
  const MAX_DRAG = TRACK_WIDTH - THUMB_SIZE - 4;

  const thumbX = useRef(new Animated.Value(0)).current;
  const isComplete = useRef(false);

  const fillWidth = thumbX.interpolate({
    inputRange: [0, MAX_DRAG],
    outputRange: [0, TRACK_WIDTH],
    extrapolate: 'clamp',
  });

  const textOpacity = thumbX.interpolate({
    inputRange: [0, MAX_DRAG * 0.3, MAX_DRAG * 0.8],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  const confirmOpacity = thumbX.interpolate({
    inputRange: [MAX_DRAG * 0.6, MAX_DRAG * 0.85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (disabled || isComplete.current) return;
        const x = Math.max(0, Math.min(MAX_DRAG, g.dx));
        thumbX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (disabled || isComplete.current) return;
        const progress = g.dx / MAX_DRAG;
        if (progress >= SWIPE_THRESHOLD || g.vx > 0.8) {
          isComplete.current = true;
          Animated.spring(thumbX, {
            toValue: MAX_DRAG,
            useNativeDriver: false,
            bounciness: 0,
            speed: 20,
          }).start(() => {
            onConfirm();
          });
        } else {
          Animated.spring(thumbX, {
            toValue: 0,
            useNativeDriver: false,
            friction: 7,
            tension: 150,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        if (isComplete.current) return;
        Animated.spring(thumbX, {
          toValue: 0,
          useNativeDriver: false,
          friction: 7,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { width: TRACK_WIDTH }]}>
        {/* Fill */}
        <Animated.View
          style={[styles.fill, { width: fillWidth }]}
        />

        {/* Track text */}
        <Animated.View style={[styles.trackLabel, { opacity: textOpacity }]}>
          <RNText style={styles.trackLabelText}>{trackText}</RNText>
        </Animated.View>

        {/* Confirm text */}
        <Animated.View style={[styles.trackLabel, styles.confirmLabel, { opacity: confirmOpacity }]}>
          <RNText style={styles.confirmLabelText}>{confirmText}</RNText>
        </Animated.View>

        {/* Thumb */}
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
          {...panResponder.panHandlers}
        >
          <Icon name="arrow-right" size={22} color="#FFFFFF" weight="bold" />
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