import React from 'react';
import { Stack } from 'expo-router';

export default function EmployerLayout() {
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
        animation: 'slide_from_right',
        animationDuration: 240,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="home" options={{ title: 'WorkGo Employer', headerShown: false }} />
      <Stack.Screen name="post-job" options={{ title: '+ Post a New Job' }} />
      <Stack.Screen name="jobs" options={{ title: 'Manage Posted Jobs' }} />
      <Stack.Screen name="bookings" options={{ title: 'Hired Workers & Bookings' }} />
      <Stack.Screen name="profile" options={{ title: 'Employer Profile' }} />
    </Stack>
  );
}
