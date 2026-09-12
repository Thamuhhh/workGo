import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useUserModeStore } from '../src/store/userModeStore';
import { Text, Button } from '../src/components/ui';
import SplashVideo from '../src/components/SplashVideo';
import { Colors, Spacing } from '../src/constants/theme';

export default function EntryScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { mode } = useUserModeStore();
  const rootNavigationState = useRootNavigationState();
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 8500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (!introDone) return;
    if (!isLoading) {
      if (isAuthenticated) {
        if (mode === 'employer') {
          router.replace('/(employer)/home');
        } else {
          router.replace('/(worker)/(tabs)/home');
        }
      }
    }
  }, [rootNavigationState?.key, isAuthenticated, isLoading, mode, introDone]);

  if (!introDone) {
    return (
      <View style={styles.splashContainer}>
        <SplashVideo onFinish={() => setIntroDone(true)} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text variant="h1" color={Colors.primary} weight="heavy">
            Work<Text variant="h1" color={Colors.secondary} weight="heavy">Go</Text>
          </Text>
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
  splashContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoBadge: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
