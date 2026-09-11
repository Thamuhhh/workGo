import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { useUserModeStore } from '../src/store/userModeStore';
import { useApplicationsStore } from '../src/store/applicationsStore';
import { Colors } from '../src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes
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

  useEffect(() => {
    loadStoredAuth();
    loadStoredMode();
    loadStoredApplications();
  }, [loadStoredAuth, loadStoredMode, loadStoredApplications]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <ErrorBoundary>
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
