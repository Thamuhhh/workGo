import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text as RNText,
  LayoutChangeEvent,
  PanResponder,
  Platform,
} from 'react-native';
import { Icon } from './Icon';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmText?: string;
  disabled?: boolean;
}

const THUMB_SIZE = 52;
const TRACK_HEIGHT = 58;
const PADDING = 4;
const SWIPE_THRESHOLD = 0.7;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  label = 'Swipe to Apply',
  confirmText = 'Applied!',
  disabled = false,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [complete, setComplete] = useState(false);

  // Native-driver value: drives only the thumb translateX (safe inside Modal).
  const thumbX = useRef(new Animated.Value(0)).current;
  // JS values: drive width/opacity/color, only ever set directly (no frame loops).
  const fillX = useRef(new Animated.Value(0)).current;
  const thumbColor = useRef(new Animated.Value(0)).current;
  const valueRef = useRef(0);
  const maxDrag = useRef(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== trackWidth) {
      setTrackWidth(w);
      maxDrag.current = Math.max(0, w - THUMB_SIZE - PADDING * 2);
    }
  };

  const dragRange = [0, maxDrag.current || 1];

  const fillWidth = fillX.interpolate({
    inputRange: dragRange,
    outputRange: [0, trackWidth || 1],
    extrapolate: 'clamp',
  });

  const textOpacity = fillX.interpolate({
    inputRange: [0, (maxDrag.current || 1) * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const confirmOpacity = fillX.interpolate({
    inputRange: [(maxDrag.current || 1) * 0.5, (maxDrag.current || 1) * 0.8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const trackColor = thumbColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0F172A', '#16A34A'],
  });

  const springBack = () => {
    Animated.spring(thumbX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 7,
      tension: 160,
    }).start();
  };

  const resetAll = () => {
    fillX.setValue(0);
    thumbColor.setValue(0);
    springBack();
  };

  const settle = (commit: boolean) => {
    if (disabled || complete) return;

    if (commit) {
      setComplete(true);
      fillX.setValue(maxDrag.current);
      thumbColor.setValue(1);
      Animated.spring(thumbX, {
        toValue: maxDrag.current,
        useNativeDriver: true,
        friction: 7,
        tension: 180,
      }).start();
      onConfirm();
    } else {
      resetAll();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !complete,
      onMoveShouldSetPanResponder: () => !disabled && !complete,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_evt, g) => {
        const next = Math.max(0, Math.min(maxDrag.current, g.dx));
        valueRef.current = next;
        thumbX.setValue(next);
        fillX.setValue(next);
      },
      onPanResponderRelease: () => {
        settle(valueRef.current / (maxDrag.current || 1) >= SWIPE_THRESHOLD);
      },
      onPanResponderTerminate: () => {
        if (!complete) resetAll();
      },
    })
  ).current;

  const webStyle =
    Platform.OS === 'web'
      ? ({ touchAction: 'none', userSelect: 'none' } as const)
      : null;

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.track, { height: TRACK_HEIGHT }, webStyle]}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.fill, { width: fillWidth }]} />

        <Animated.View style={[styles.labelWrap, { opacity: textOpacity }]} pointerEvents="none">
          <RNText style={styles.labelText}>{label}</RNText>
        </Animated.View>

        <Animated.View style={[styles.labelWrap, { opacity: confirmOpacity }]} pointerEvents="none">
          <RNText style={styles.confirmText}>{confirmText}</RNText>
        </Animated.View>

        <Animated.View
          style={[
            styles.thumb,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: trackColor,
              transform: [{ translateX: thumbX }],
            },
          ]}
          pointerEvents="none"
        >
          <Icon name="arrow-right" size={20} color="#FFFFFF" weight="bold" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  track: {
    width: '100%',
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#22C55E',
  },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  thumb: {
    position: 'absolute',
    left: PADDING,
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default SwipeToConfirm;