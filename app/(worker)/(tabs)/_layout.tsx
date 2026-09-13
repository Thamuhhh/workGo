import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/theme';

const ICONS = {
  home: { active: 'home', inactive: 'home-outline', label: 'Home' },
  wallet: { active: 'wallet', inactive: 'wallet-outline', label: 'Wallet' },
  profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
} as const;

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
          color={active ? '#0277F4' : '#94A3B8'}
          weight={active ? 'fill' : 'regular'}
        />
      </Animated.View>
    );
  }
);

export default function WorkerTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = ICONS[route.name as keyof typeof ICONS] ?? ICONS.home;
        return {
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: '#0F172A',
          headerTitleStyle: {
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
          },
          headerShadowVisible: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarLabel: ({ focused }) => (
            <Text
              variant="caption"
              weight={focused ? 'bold' : 'medium'}
              color={focused ? '#0277F4' : '#94A3B8'}
              style={styles.label}
            >
              {icons.label}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <AnimatedIcon active={focused} activeIcon={icons.active} inactiveIcon={icons.inactive} />
          ),
        };
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: 62,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    marginTop: 3,
  },
});