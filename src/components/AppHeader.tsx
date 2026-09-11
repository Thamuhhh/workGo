import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Icon as Ionicons } from './Icon';
import { Text } from './ui';
import { Colors, Spacing } from '../constants/theme';

interface AppHeaderProps {
  onProfilePress: () => void;
  userInitial?: string;
}

export function ScalePress({
  children,
  onPress,
  style,
  activeOpacity = 0.85,
  scaleTo = 0.93,
}: {
  children: ReactNode;
  onPress: () => void;
  style?: any;
  activeOpacity?: number;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AppHeader({ onProfilePress, userInitial = 'U' }: AppHeaderProps) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: entrance, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.row}>
        <Text variant="h2" weight="heavy" color="#1E293B" style={styles.brandTitle}>
          Work<Text variant="h2" weight="heavy" color={Colors.primary}>Go</Text>
        </Text>

        <ScalePress onPress={onProfilePress} style={styles.avatarBtn} scaleTo={0.92}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInner}>
              <Text variant="body" weight="heavy" color={Colors.primary}>
                {userInitial}
              </Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={9} color="#FFFFFF" />
            </View>
          </View>
        </ScalePress>
      </View>
    </Animated.View>
  );
}

export function FadeSlide({
  children,
  delay = 0,
  duration = 380,
  distance = 18,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: any;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 80);
    return () => clearTimeout(timer);
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 48,
    paddingBottom: Spacing.sm,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});