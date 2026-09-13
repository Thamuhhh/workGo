import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useUserModeStore } from '../src/store/userModeStore';
import { Text, Button } from '../src/components/ui';
import { Colors, Spacing } from '../src/constants/theme';

export default function EntryScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { mode } = useUserModeStore();
  const rootNavigationState = useRootNavigationState();
  const [splashTimeout, setSplashTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (isLoading) return;
if (isAuthenticated && !splashTimeout) {
      if (mode === 'employer') {
        router.replace('/(employer)/home');
      } else {
        router.replace('/(worker)/(tabs)/home');
      }
    }
  }, [rootNavigationState?.key, isAuthenticated, isLoading, mode]);

  if (isLoading && !splashTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/splash.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (isAuthenticated && !splashTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/splash.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <View style={styles.logoRow}>
          <Text variant="h1" weight="heavy" color="#0F172A" style={styles.logoText}>Work</Text>
          <Text variant="h1" weight="heavy" color="#0277F4" style={styles.logoText}>Go</Text>
        </View>
        <Text variant="h3" align="center" weight="bold" style={styles.tagline}>
          Work nearby. Earn today.
        </Text>
        <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
          Connecting instant temporary workers with catering, events, retail, and local businesses.
        </Text>
      </View>

      {/* Action CTAs */}
      <View style={styles.actionSection}>
        <Button
          title="Find Work (Worker)"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
          style={styles.primaryButton}
        />
        <Button
          title="Hire Workers (Employer)"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontSize: 52,
    lineHeight: 60,
  },
  tagline: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    paddingHorizontal: Spacing.md,
  },
  actionSection: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
});
