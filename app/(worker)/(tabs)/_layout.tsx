import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/theme';

const ICONS = {
  home: { active: 'home', inactive: 'home-outline', label: 'Home' },
  bookings: { active: 'document-text', inactive: 'document-text-outline', label: 'Activity' },
  applications: { active: 'chatbubble', inactive: 'chatbubble-outline', label: 'Messages' },
} as const;

export default function WorkerTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = ICONS[route.name as keyof typeof ICONS] ?? ICONS.home;
        return {
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.secondary,
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
            </View>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={20}
                color={focused ? '#FFFFFF' : '#94A3B8'}
              />
            </View>
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
    height: 66,
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
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPillActive: {
    backgroundColor: '#1C274C',
    shadowColor: '#16203E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  labelWrap: {
    marginTop: 2,
  },
});