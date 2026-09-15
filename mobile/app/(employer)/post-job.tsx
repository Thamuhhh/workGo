import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';

export default function PostJobScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Catering Staff');
  const [salary, setSalary] = useState('900');
  const [workersRequired, setWorkersRequired] = useState('10');
  const [foodProvided, setFoodProvided] = useState(true);
  const [transportProvided, setTransportProvided] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePublish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(employer)/home');
    }, 800);
  };

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.header}>
        Post a Temporary Job
      </Text>

      {/* Basic Info */}
      <Card padding="lg">
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          1. Basic Information
        </Text>
        <Input
          label="Job Title"
          placeholder="e.g. Wedding Catering Staff"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          label="Category"
          placeholder="e.g. Catering, Waiter, Event Setup"
          value={category}
          onChangeText={setCategory}
        />
      </Card>

      {/* Workers & Pay */}
      <Card padding="lg">
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          2. Workers & Payment
        </Text>
        <Input
          label="Workers Required"
          placeholder="e.g. 15"
          keyboardType="number-pad"
          value={workersRequired}
          onChangeText={setWorkersRequired}
        />
        <Input
          label="Salary (₹ per day)"
          placeholder="e.g. 900"
          keyboardType="number-pad"
          value={salary}
          onChangeText={setSalary}
        />
      </Card>

      {/* Facilities */}
      <Card padding="lg">
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          3. Facilities Provided
        </Text>
        <View style={styles.switchRow}>
          <Text variant="body">Food Provided</Text>
          <Switch
            value={foodProvided}
            onValueChange={setFoodProvided}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text variant="body">Transport Provided</Text>
          <Switch
            value={transportProvided}
            onValueChange={setTransportProvided}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </Card>

      <Button
        title="Confirm & Publish Job"
        size="lg"
        fullWidth
        loading={loading}
        onPress={handlePublish}
        style={styles.publishBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  header: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  publishBtn: {
    marginVertical: Spacing.xl,
  },
});
