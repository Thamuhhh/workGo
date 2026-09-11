import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

export default function WorkerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { toggleMode } = useUserModeStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(employer)/home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <Card padding="lg" style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={28} color="#475569" />
          </View>
          <View style={styles.avatarDetails}>
            <Text variant="h2" weight="bold">
              {user?.name || 'Arun Kumar'}
            </Text>
            <View style={styles.badgeRow}>
              <Badge label="Verified" variant="success" size="sm" />
              <Badge label="4.8 Rating" variant="warning" size="sm" />
            </View>
            <Text variant="caption" color={Colors.textSecondary} style={styles.jobsCount}>
              24 jobs completed
            </Text>
          </View>
        </View>
      </Card>

      {/* Skills */}
      <Card padding="lg">
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          Skills
        </Text>
        <View style={styles.chipRow}>
          <Badge label="Catering" variant="neutral" />
          <Badge label="Serving" variant="neutral" />
          <Badge label="Event Support" variant="neutral" />
          <Badge label="Cleaning" variant="neutral" />
        </View>
      </Card>

      {/* Expected Pay & Location */}
      <Card padding="lg">
        <View style={styles.infoRow}>
          <View>
            <Text variant="caption" color={Colors.textSecondary}>EXPECTED WAGE</Text>
            <Text variant="h3" weight="bold" color={Colors.primary}>₹800 / day</Text>
          </View>
          <View>
            <Text variant="caption" color={Colors.textSecondary}>LOCATION</Text>
            <Text variant="h3" weight="bold">Kanchipuram</Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Button
          title="Switch to Employer Mode"
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
  profileCard: {
    marginBottom: Spacing.md,
  },
  avatarRow: {
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
  avatarDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  jobsCount: {
    marginTop: 2,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    marginTop: Spacing.md,
  },
  switchBtn: {
    marginBottom: Spacing.md,
  },
});
