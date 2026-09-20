import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from './Icon';
import { Text } from './ui';

export type EmployerTab = 'home' | 'wallet' | 'profile';

const NAV_TABS: { key: EmployerTab; label: string; activeIcon: string; inactiveIcon: string }[] = [
  { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { key: 'wallet', label: 'Wallet', activeIcon: 'wallet', inactiveIcon: 'wallet-outline' },
  { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

const AnimatedIcon = React.memo(
  ({ active, activeIcon, inactiveIcon }: { active: boolean; activeIcon: string; inactiveIcon: string }) => {
    const scale = useRef(new Animated.Value(active ? 1 : 0.9)).current;

    useEffect(() => {
      Animated.spring(scale, {
        toValue: active ? 1 : 0.9,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }, [active, scale]);

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={active ? activeIcon : inactiveIcon}
          size={22}
          color={active ? '#0F172A' : '#94A3B8'}
          weight={active ? 'fill' : 'regular'}
        />
      </Animated.View>
    );
  }
);

export default function EmployerBottomNav({ activeTab }: { activeTab: EmployerTab }) {
  const handlePress = (tab: EmployerTab) => {
    if (tab === 'home') {
      router.navigate('/(employer)/(tabs)/home');
    } else if (tab === 'wallet') {
      router.navigate('/(employer)/(tabs)/wallet');
    } else {
      router.navigate('/(employer)/(tabs)/profile');
    }
  };

  return (
    <View style={styles.bottomNav}>
      {NAV_TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.navTab}
            onPress={() => handlePress(tab.key)}
          >
            <View style={styles.navTabInner}>
              <AnimatedIcon active={active} activeIcon={tab.activeIcon} inactiveIcon={tab.inactiveIcon} />
              <Text
                variant="caption"
                weight={active ? 'bold' : 'medium'}
                color={active ? '#0F172A' : '#94A3B8'}
                style={styles.navLabel}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 62,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navTabInner: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 3,
  },
});