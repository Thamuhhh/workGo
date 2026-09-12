import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/theme';

const ICONS = {
  home: { active: 'home', inactive: 'home-outline', label: 'Home' },
  bookings: { active: 'document-text', inactive: 'document-text-outline', label: 'Activity' },
  applications: { active: 'chatbubble', inactive: 'chatbubble-outline', label: 'Messages' },
} as const;

const AnimatedPill = React.memo(
  ({ active, activeIcon, inactiveIcon }: { active: boolean; activeIcon: string; inactiveIcon: string }) => {
    const scale = useRef(new Animated.Value(active ? 1 : 0.8)).current;

    useEffect(() => {
      Animated.spring(scale, {
        toValue: active ? 1 : 0.8,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }, [active, scale]);

    return (
      <Animated.View style={[styles.iconPill, active && styles.iconPillActive, { transform: [{ scale }] }]}>
        <Ionicons
          name={active ? activeIcon : inactiveIcon}
          size={20}
          color={active ? '#FFFFFF' : '#94A3B8'}
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
            <View style={styles.labelWrap}>
              <Text
                variant="caption"
                weight={focused ? 'bold' : 'medium'}
                color={focused ? Colors.primary : '#94A3B8'}
              >
                {icons.label}
              </Text>
              <View style={[styles.activeDot, focused && styles.activeDotOn]} />
            </View>
          ),
          tabBarIcon: ({ focused }) => (
            <AnimatedPill active={focused} activeIcon={icons.active} inactiveIcon={icons.inactive} />
          ),
        };
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="bookings" options={{ title: 'Activity' }} />
      <Tabs.Screen name="applications" options={{ title: 'Messages' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: 68,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  tabItem: {
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPill: {
    width: 48,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPillActive: {
    backgroundColor: '#0277F4',
    shadowColor: '#0255C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  labelWrap: {
    marginTop: 2,
    alignItems: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0277F4',
    opacity: 0,
    marginTop: 2,
  },
  activeDotOn: {
    opacity: 1,
  },
});