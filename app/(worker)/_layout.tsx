import React from 'react';
import { Stack } from 'expo-router';

export default function WorkerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#0F172A',
        headerTitleStyle: {
          fontFamily: 'Poppins_700Bold',
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="jobs" options={{ title: 'Explore Jobs' }} />
      <Stack.Screen name="category-jobs" options={{ title: 'Category Jobs' }} />
      <Stack.Screen name="job-detail" options={{ title: 'Job Details' }} />
      <Stack.Screen
        name="chat"
        options={({ route }) => ({
          title: (route.params as { employerName?: string })?.employerName || 'Chat',
        })}
      />
      <Stack.Screen name="wallet" options={{ title: 'My Wallet' }} />
      <Stack.Screen name="profile" options={{ title: 'Worker Profile' }} />
    </Stack>
  );
}
