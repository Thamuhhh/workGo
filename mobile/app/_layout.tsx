import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useUserModeStore } from '../src/store/userModeStore';
import { useApplicationsStore } from '../src/store/applicationsStore';
import { useRatingsStore } from '../src/store/ratingsStore';
import { useWalletStore } from '../src/store/walletStore';
import { useNotificationsStore } from '../src/store/notificationsStore';
import OfflineBanner from '../src/components/OfflineBanner';
import { Colors } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{String(this.state.error?.message || this.state.error)}</Text>
          <Text style={styles.errorStack}>{String(this.state.error?.stack)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const loadStoredMode = useUserModeStore((state) => state.loadStoredMode);
  const loadStoredApplications = useApplicationsStore((state) => state.loadStoredApplications);
  const loadStoredRatings = useRatingsStore((state) => state.loadStoredRatings);
  const loadStoredWallet = useWalletStore((state) => state.loadStoredWallet);
  const loadStoredNotifications = useNotificationsStore((state) => state.loadStoredNotifications);

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    Promise.all([
      loadStoredAuth(),
      loadStoredMode(),
      loadStoredApplications(),
      loadStoredRatings(),
      loadStoredWallet(),
      loadStoredNotifications(),
    ])
      .catch(() => {})
      .finally(() => setAppReady(true));
  }, [loadStoredAuth, loadStoredMode, loadStoredApplications, loadStoredRatings, loadStoredWallet, loadStoredNotifications]);

  useEffect(() => {
    if (appReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady, fontsLoaded, fontError]);

  if (!appReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <OfflineBanner />
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.surface,
              },
              headerTintColor: '#0F172A',
              headerTitleStyle: {
                fontFamily: 'Poppins_700Bold',
              },
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(worker)" options={{ headerShown: false }} />
            <Stack.Screen name="(employer)" options={{ headerShown: false }} />
          </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorStack: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
