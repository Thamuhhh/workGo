import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useUserModeStore } from '../src/store/userModeStore';
import { Text, Button } from '../src/components/ui';
import { Colors, Spacing } from '../src/constants/theme';

export default function EntryScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { mode } = useUserModeStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (mode === 'employer') {
          router.replace('/(employer)/home');
        } else {
          router.replace('/(worker)/(tabs)/home');
        }
      }
    }
  }, [isAuthenticated, isLoading, mode]);

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
