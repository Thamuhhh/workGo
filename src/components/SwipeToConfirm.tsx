import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text as RNText,
  LayoutChangeEvent,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { Icon } from './Icon';
import { Spacing } from '../constants/theme';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmText?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 0.7;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  label = 'Swipe to Apply',
  confirmText = 'Applied!',
  disabled = false,
}) => {
  const THUMB_SIZE = 52;
  const TRACK_HEIGHT = 58;

  const [trackWidth, setTrackWidth] = useState(0);
  const thumbX = useRef(new Animated.Value(0)).current;
  const thumbXVal = useRef(0);
  const startX = useRef(0);
  const maxDrag = useRef(0);
  const [complete, setComplete] = useState(false);

  const thumbColorVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = thumbX.addListener(({ value }) => {
      thumbXVal.current = value;
    });
    return () => thumbX.removeListener(id);
  }, [thumbX]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== trackWidth) {
      setTrackWidth(w);
      maxDrag.current = Math.max(0, w - THUMB_SIZE - 8);
    }
  };

  const dragRange = [0, maxDrag.current || 1];

  const fillWidth = thumbX.interpolate({
    inputRange: dragRange,
    outputRange: [0, trackWidth || 1],
    extrapolate: 'clamp',
  });

  const textOpacity = thumbX.interpolate({
    inputRange: [0, (maxDrag.current || 1) * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const confirmOpacity = thumbX.interpolate({
    inputRange: [(maxDrag.current || 1) * 0.55, (maxDrag.current || 1) * 0.85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const thumbColor = thumbColorVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0F172A', '#16A34A'],
  });

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (disabled || complete) return;
    startX.current = e.nativeEvent.pageX;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (disabled || complete) return;
    const dx = e.nativeEvent.pageX - startX.current;
    thumbX.setValue(Math.max(0, Math.min(maxDrag.current, dx)));
  };

  const resetThumb = () => {
    Animated.spring(thumbX, { toValue: 0, useNativeDriver: true, friction: 7, tension: 160 }).start();
  };

  const handleTouchEnd = () => {
    if (disabled || complete) return;
    const progress = thumbXVal.current / (maxDrag.current || 1);

    if (progress >= SWIPE_THRESHOLD) {
      setComplete(true);
      Animated.parallel([
        Animated.spring(thumbX, {
          toValue: maxDrag.current,
          useNativeDriver: true,
          friction: 7,
          tension: 180,
        }),
        Animated.timing(thumbColorVal, { toValue: 1, duration: 180, useNativeDriver: false }),
      ]).start(() => {
        setTimeout(onConfirm, 280);
      });
    } else {
      resetThumb();
    }
    startX.current = 0;
  };

  const webTouchAction = Platform.OS === 'web' ? { touchAction: 'none' as const } : null;

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.track, { height: TRACK_HEIGHT }, webTouchAction]}
        onLayout={onTrackLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={() => {
          startX.current = 0;
          if (!complete) resetThumb();
        }}
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
              left: 4,
              top: 4,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX: thumbX }],
            },
          ]}
          pointerEvents="none"
        >
          <Icon name="arrow-forward" size={22} color="#FFFFFF" weight="bold" />
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
    borderRadius: 29,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 29,
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