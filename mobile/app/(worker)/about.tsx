import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';

export default function AboutScreen() {
  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text variant="h2" weight="heavy" color="#FFFFFF">Go</Text>
        </View>
        <Text variant="h2" weight="heavy" color="#0F172A" style={styles.appTitle}>
          Gigro
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Work near you. Get paid same day.
        </Text>
      </View>

      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.sectionLabel}>
        APP INFO
      </Text>
      <Card variant="flat" padding="md">
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Build', value: 'Expo SDK 52' },
          { label: 'Platform', value: 'React Native (iOS + Android + Web)' },
          { label: 'Made by', value: 'WorkGo Team' },
        ].map((row, i) => (
          <View key={row.label} style={[styles.row, i === 3 && styles.rowLast]}>
            <Text variant="bodySm" color={Colors.textSecondary}>
              {row.label}
            </Text>
            <Text variant="bodySm" weight="bold" color="#0F172A">
              {row.value}
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
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appTitle: {
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
});