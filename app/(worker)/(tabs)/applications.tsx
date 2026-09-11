import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Badge, Button } from '../../../src/components/ui';
import { SAMPLE_JOBS } from '../../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../../src/store/applicationsStore';
import { Colors, Spacing } from '../../../src/constants/theme';

const STATUS_VARIANT: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'info' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function WorkerApplicationsScreen() {
  const applications = useApplicationsStore((s) => s.applications);

  const rows = applications.map((app) => {
    const job = SAMPLE_JOBS.find((j) => j.id === app.jobId);
    return { app, job };
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.title}>
        My Applications
      </Text>
      <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
        Track status: Applied → Shortlisted → Accepted / Rejected
      </Text>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={44} color={Colors.borderDark} />
          <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
            No applications yet
          </Text>
          <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
            Jobs you apply to will show up here.
          </Text>
          <Button
            title="Browse Jobs"
            size="sm"
            onPress={() => router.push('/(worker)/jobs')}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        rows.map(({ app, job }) => {
          const status = STATUS_VARIANT[app.status];
          return (
            <Card key={app.jobId} padding="lg">
              <View style={styles.row}>
                <Text variant="h3" weight="bold" style={styles.jobTitle}>
                  {job?.title ?? 'Unknown job'}
                </Text>
                <Badge label={status.label} variant={status.variant} size="sm" />
              </View>
              <Text variant="bodySm" color={Colors.textSecondary}>
                {job ? `${job.employerName} • ${job.salary}` : '—'}
              </Text>
              <View style={styles.dateRow}>
                <Text variant="caption" color={Colors.textMuted}>
                  Applied {timeAgo(app.appliedAt)}
                </Text>
                {job && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                    }
                  >
                    <Text variant="bodySm" weight="bold" color={Colors.primary}>
                      View job
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })
      )}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  jobTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    marginTop: 2,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: Spacing.lg,
  },
});