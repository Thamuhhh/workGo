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
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
        animationDuration: 240,
        gestureEnabled: true,
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
      <Stack.Screen name="bookings" options={{ title: 'My Bookings' }} />
      <Stack.Screen name="applications" options={{ title: 'My Applications' }} />
      <Stack.Screen name="refer" options={{ title: 'Refer & Earn' }} />
    </Stack>
  );
}
