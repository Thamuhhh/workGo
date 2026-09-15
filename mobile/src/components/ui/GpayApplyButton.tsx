import React, { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { Icon as Ionicons } from '../Icon';
import { BorderRadius } from '../../constants/theme';

interface GpayApplyButtonProps {
  onDone: () => void;
}

export default function GpayApplyButton({ onDone }: GpayApplyButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'boom' | 'done'>('idle');

  const press = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const greenFade = useRef(new Animated.Value(0)).current;
  const checkPop = useRef(new Animated.Value(0)).current;
  const checkSpin = useRef(new Animated.Value(0)).current;

  const handleApply = () => {
    if (phase !== 'idle') return;

    Animated.sequence([
      Animated.timing(press, { toValue: 0.92, duration: 90, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, friction: 3, tension: 180, useNativeDriver: true }),
    ]).start();

    setPhase('boom');

    Animated.timing(ring1, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(120),
      Animated.timing(ring2, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setPhase('done');
      Animated.timing(greenFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      Animated.spring(checkPop, { toValue: 1, friction: 5, tension: 220, useNativeDriver: true }).start();
      Animated.spring(checkSpin, { toValue: 1, friction: 4, tension: 240, useNativeDriver: true }).start();
    }, 500);

    setTimeout(onDone, 1150);
  };

  const ring1Style = {
    opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
    transform: [{ scale: ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
  };
  const ring2Style = {
    opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] }),
    transform: [{ scale: ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleApply}
      style={styles.wrap}
    >
      <Animated.View style={[styles.wrapInner, { transform: [{ scale: press }] }]}>
        <LinearGradient
          colors={['#0277F4', '#0255C0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: greenFade }]}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Rings */}
        <View style={styles.ringsCenter} pointerEvents="none">
          <Animated.View style={[styles.ring, styles.ringBlue, ring1Style]} />
          <Animated.View style={[styles.ring, styles.ringGreen, ring2Style]} />
        </View>

        {phase === 'done' ? (
          <Animated.View
            style={[
              styles.doneRow,
              { opacity: greenFade },
              { transform: [{ scale: checkPop }, { rotate: checkSpin.interpolate({ inputRange: [0, 1], outputRange: ['-160deg', '0deg'] }) }] },
            ]}
          >
            <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
            <Text variant="body" weight="bold" color="#FFFFFF" style={styles.doneText}>
              Applied!
            </Text>
          </Animated.View>
        ) : (
          <Text variant="body" weight="bold" color="#FFFFFF">
            Apply for Job
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  wrapInner: {
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  ringsCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
  },
  ringBlue: {
    borderColor: '#7EB8FF',
  },
  ringGreen: {
    borderColor: '#34D399',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneText: {
    marginLeft: 6,
  },
});