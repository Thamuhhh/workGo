import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';

export default function EmployerBookingsScreen() {
  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.title}>
        Hired Workers & Attendance
      </Text>

      <Card padding="lg">
        <Text variant="h3" weight="bold">Arun Kumar</Text>
        <Text variant="bodySm" color={Colors.textSecondary}>Role: Waiter / Server</Text>
        <View style={styles.statusRow}>
          <Badge label="Attendance: Pending" variant="warning" size="sm" />
          <Badge label="Agreed: ₹900" variant="neutral" size="sm" />
        </View>
        <View style={styles.actions}>
          <Button
            title="Mark Present"
            size="sm"
            onPress={() => {}}
          />
        </View>
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
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
