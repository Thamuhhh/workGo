import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { useLocationStore } from '../../src/store/locationStore';
import { Colors, Spacing } from '../../src/constants/theme';

export default function AddressScreen() {
  const label = useLocationStore((s) => s.label);
  const address = useLocationStore((s) => s.address);

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
        This is where nearby jobs are matched on your home screen.
      </Text>

      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.sectionLabel}>
        WORK LOCATION
      </Text>
      <Card padding="lg" style={styles.addressCard}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.addressCol}>
            <Text variant="body" weight="bold" color="#0F172A">
              {label || 'Not set'}
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {address || 'Choose your work area to see local jobs.'}
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="Change location"
        size="lg"
        fullWidth
        icon={<Ionicons name="map-outline" size={16} color="#FFFFFF" />}
        onPress={() => router.push('/(worker)/location-picker')}
        style={styles.cta}
      />

      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.sectionLabel}>
        WHY THIS MATTERS
      </Text>
      <Card padding="lg" variant="outlined">
        {[
          'Jobs within 5 km of your area show first.',
          'Employers in your locality can find your profile faster.',
          'Payout pickups and gig onboarding use this area.',
        ].map((point) => (
          <View key={point} style={styles.pointRow}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text variant="bodySm" color={Colors.textSecondary} style={styles.pointText}>
              {point}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    marginBottom: Spacing.lg,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addressCol: {
    flex: 1,
  },
  cta: {
    marginBottom: Spacing.xl,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pointText: {
    flex: 1,
  },
});