import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Card, Badge } from '../../../src/components/ui';
import { FadeSlide } from '../../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../../src/store/applicationsStore';
import { Colors, Spacing } from '../../../src/constants/theme';

const STATUS_META: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'primary' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'success' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'info' },
  ACCEPTED: { label: 'Accepted', variant: 'primary' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

export default function WorkerBookingsScreen() {
  const applications = useApplicationsStore((s) => s.applications);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Text variant="h2" weight="bold" style={styles.title}>
        Activity
      </Text>
      <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
        Your full job history
      </Text>

      {SAMPLE_JOBS.map((job, i) => {
        const application = applications.find((a) => a.jobId === job.id);
        const status = application ? STATUS_META[application.status] : null;
        return (
          <FadeSlide key={job.id} delay={i * 60}>
            <Card
              padding="lg"
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
              }
            >
              <View style={styles.row}>
                <Text variant="h3" weight="bold" color="#0F172A" style={styles.title}>
                  {job.title}
                </Text>
                {status ? (
                  <Badge label={status.label} variant={status.variant} size="sm" />
                ) : (
                  <Badge label="Upcoming" variant="neutral" size="sm" />
                )}
              </View>
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.employer}>
                {job.employerName}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                  <Text variant="bodySm" color={Colors.textSecondary}>{job.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <Text variant="bodySm" color={Colors.textSecondary}>{job.timing}</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text variant="bodySm" color={Colors.textSecondary}>{job.location}</Text>
                </View>
                <Text variant="body" weight="heavy" color="#0F172A">
                  {job.salary}
                </Text>
              </View>
            </Card>
          </FadeSlide>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 110,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  employer: {
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
  },
});