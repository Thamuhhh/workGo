import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';

export default function EmployerJobsScreen() {
  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.title}>
        Manage Posted Jobs
      </Text>

      <Card padding="lg">
        <Text variant="h3" weight="bold">Wedding Catering Staff</Text>
        <Text variant="bodySm" color={Colors.textSecondary}>12 / 15 workers accepted</Text>
        <View style={styles.badgeRow}>
          <Badge label="OPEN" variant="success" size="sm" />
          <Badge label="₹900/day" variant="neutral" size="sm" />
        </View>
        <Button
          title="Review Applicants"
          size="sm"
          onPress={() => {}}
          style={styles.btn}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  btn: {
    marginTop: Spacing.xs,
  },
});
