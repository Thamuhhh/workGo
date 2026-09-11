import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '../../src/components/ui';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

export default function WorkerJobsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.title}>
        Explore Jobs
      </Text>
      <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
        {SAMPLE_JOBS.length} jobs near you — tap any job for full details
      </Text>

      {SAMPLE_JOBS.map((job) => (
        <Card
          key={job.id}
          padding="lg"
          style={styles.card}
          onPress={() =>
            router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
          }
        >
          <View style={styles.jobCardTop}>
            <View style={styles.jobTitleCol}>
              <Text variant="h3" weight="bold" color="#0F172A">
                {job.title}
              </Text>
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.categoryTag}>
                {job.category} • {job.location} ({job.distance})
              </Text>
            </View>
            <View style={styles.salaryBadge}>
              <Text variant="body" weight="heavy" color={Colors.primary}>
                {job.salary}
              </Text>
            </View>
          </View>

          <View style={styles.jobMetaRow}>
            <Text variant="bodySm" color={Colors.textSecondary}>
              {job.date} • {job.timing}
            </Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text variant="bodySm" weight="bold" color={Colors.primaryDark}>
                {job.employerRating.replace(' Rating', '')}
              </Text>
            </View>
          </View>

          <Button
            title="Apply for Job"
            size="md"
            fullWidth
            onPress={() =>
              router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
            }
            style={styles.btn}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  jobTitleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryTag: {
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  btn: {
    marginTop: Spacing.xs,
  },
});