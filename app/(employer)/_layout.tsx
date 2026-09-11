import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function EmployerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.secondary,
        headerTitleStyle: {
          fontFamily: 'Poppins_700Bold',
          fontWeight: '700',
        },
        headerShadowVisible: false,
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
