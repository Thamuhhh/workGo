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
      <Stack.Screen name="location-picker" options={{ headerShown: false }} />
      <Stack.Screen name="jobs" options={{ title: 'Explore Jobs' }} />
      <Stack.Screen name="category-jobs" options={{ title: 'Category Jobs' }} />
      <Stack.Screen name="job-detail" options={{ title: 'Job Details' }} />
      <Stack.Screen
        name="chat"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="bookings" options={{ title: 'My Bookings' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="applications" options={{ title: 'Chats' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="kyc" options={{ title: 'KYC & Documents' }} />
      <Stack.Screen name="address" options={{ title: 'Address' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About Gigro' }} />
      <Stack.Screen name="legal" options={{ title: 'Privacy & Terms' }} />
      <Stack.Screen name="refer" options={{ title: 'Refer & Earn' }} />
    </Stack>
  );
}
