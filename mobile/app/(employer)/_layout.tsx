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
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
        animationDuration: 240,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post-job" options={{ title: '+ Post a New Job' }} />
      <Stack.Screen name="jobs" options={{ title: 'Manage Posted Jobs' }} />
      <Stack.Screen name="job-detail" options={{ title: 'Job Details' }} />
      <Stack.Screen name="bookings" options={{ title: 'Hired Workers & Bookings' }} />
      <Stack.Screen name="payment" options={{ title: 'Review & Pay' }} />
      <Stack.Screen name="review-applicants" options={{ title: 'Review Applicants' }} />
      <Stack.Screen name="business-details" options={{ title: 'Business Details' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages', headerShown: false }} />
    </Stack>
  );
}
