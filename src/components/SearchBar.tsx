import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from './Icon';
import { Text } from './ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface SearchBarProps {
  placeholder?: string;
  onPress: () => void;
}

export default function SearchBar({ placeholder, onPress }: SearchBarProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      friction: 6,
      tension: 62,
      delay: 220,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const opacity = entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const scaleEnter = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });

  const pressIn = () => {
    Animated.spring(press, {
      toValue: 0.95,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(press, {
      toValue: 1,
      friction: 5,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        { position: 'relative' },
        { opacity, transform: [{ scale: scaleEnter }, { translateY }] },
      ]}
    >
      <Animated.View
        style={[
          styles.glow,
          { transform: [{ scale: press.interpolate({ inputRange: [0.95, 1], outputRange: [0.9, 1] }) }] },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          onPressIn={pressIn}
          onPressOut={pressOut}
        >
          <View style={[styles.bar, Shadows.md]}>
            <LinearGradient
              colors={['#3E4E7A', '#1C274C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconChip}
            >
              <Ionicons name="search" size={15} color="#FFFFFF" />
            </LinearGradient>
            <Text variant="body" color={Colors.textMuted} numberOfLines={1} style={styles.placeholder}>
              {placeholder}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -2,
    right: -2,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(28, 39, 76, 0.25)',
  },
  bar: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  placeholder: {
    flex: 1,
    marginRight: Spacing.sm,
  },
});