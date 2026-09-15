import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

export default function EmployerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { toggleMode } = useUserModeStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(worker)/(tabs)/home');
  };

  if (usePageLoading()) return <ScreenSkeleton variant="profile" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card padding="lg" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Ionicons name="business-outline" size={30} color="#0F172A" />
          </View>
          <View style={styles.headerDetails}>
            <Text variant="h2" weight="bold">
              {user?.businessName || user?.name || 'Sri Krishna Catering'}
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary}>
              Owner: R. Ramanathan
            </Text>
            <View style={styles.badges}>
              <Badge label="Verified Business" variant="success" size="sm" />
              <Badge label="4.9 Rating" variant="warning" size="sm" />
            </View>
          </View>
        </View>
      </Card>

      <Card padding="lg">
        <Text variant="h3" weight="bold" style={styles.title}>
          Business Details
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Type: Event & Wedding Catering
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Location: Kanchipuram, Tamil Nadu
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Total Hired Workers: 45
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Switch to Worker Mode"
          variant="outline"
          size="lg"
          fullWidth
          onPress={handleSwitchMode}
          style={styles.switchBtn}
        />
        <Button
          title="Log Out"
          variant="danger"
          size="md"
          fullWidth
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  card: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerDetails: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.md,
  },
  switchBtn: {
    marginBottom: Spacing.md,
  },
});
