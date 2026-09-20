import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide, ScalePress } from '../../src/components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useEmployerJobsStore, JobStatus } from '../../src/store/employerJobsStore';

type Filter = 'ALL' | JobStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'FILLING', label: 'Filling' },
  { key: 'CLOSED', label: 'Closed' },
];

export default function EmployerJobsScreen() {
  const jobs = useEmployerJobsStore((s) => s.jobs);
  const [filter, setFilter] = useState<Filter>('ALL');

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  const filtered = filter === 'ALL' ? jobs : jobs.filter((j) => j.status === filter);

  if (jobs.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📋</Text>
          </View>
          <Text variant="body" weight="bold" color="#0F172A" style={styles.emptyTitle}>
            No jobs posted yet
          </Text>
          <Text variant="bodySm" color={Colors.textSecondary} align="center" style={styles.emptyDesc}>
            Post your first job and start getting worker applications within minutes.
          </Text>
          <Button
            title="Post a Job"
            size="md"
            fullWidth
            onPress={() => router.push('/(employer)/post-job')}
            style={styles.emptyBtn}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'ALL'
              ? jobs.length
              : jobs.filter((j) => j.status === f.key).length;
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
              style={[styles.filterTab, active && styles.filterTabActive]}
            >
              <Text
                variant="caption"
                weight={active ? 'bold' : 'medium'}
                color={active ? '#FFFFFF' : Colors.textSecondary}
              >
                {f.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.filterEmpty}>
            <Text variant="body" weight="semibold" color={Colors.textSecondary}>
              No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}jobs in this view
            </Text>
          </View>
        )}

        {filtered.map((job) => {
          const pct = Math.min(100, Math.round((job.hired / job.workersRequired) * 100));
          return (
            <FadeSlide key={job.id} delay={60}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: '/(employer)/job-detail', params: { jobId: job.id } })
                }
                style={styles.jobCard}
              >
                <View style={styles.jobTop}>
                  <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={{ flex: 1 }}>
                    {job.title}
                  </Text>
                  <Badge
                    label={STATUS_LABEL[job.status]}
                    variant={STATUS_VARIANT[job.status]}
                    size="sm"
                  />
                </View>
                <Text variant="caption" color={Colors.textSecondary} style={styles.jobMeta}>
                  {job.category} • {job.location} • {job.date} • ₹{job.salaryPerDay}/day
                </Text>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text variant="caption" weight="medium" color={Colors.textSecondary}>
                    {job.hired} / {job.workersRequired} hired
                  </Text>
                  <Text variant="caption" weight="bold" color={Colors.primary}>
                    {pct}%
                  </Text>
                </View>

                <View style={styles.jobFooter}>
                  <View style={styles.facilityRow}>
                    {job.foodProvided && (
                      <Text variant="caption" color={Colors.textMuted}>🍽 Food</Text>
                    )}
                    {job.transportProvided && (
                      <Text variant="caption" color={Colors.textMuted}>🚌 Transport</Text>
                    )}
                    <Text variant="caption" weight="bold" color="#0F172A">
                      View Details →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeSlide>
          );
        })}

        <ScalePress scaleTo={0.97} onPress={() => router.push('/(employer)/post-job')}>
          <View style={styles.addCard}>
            <Text variant="body" weight="bold" color="#0F172A">
              + Post Another Job
            </Text>
          </View>
        </ScalePress>
      </ScrollView>
    </View>
  );
}

const STATUS_LABEL: Record<JobStatus, string> = {
  OPEN: 'OPEN',
  FILLING: 'FILLING',
  CLOSED: 'CLOSED',
};

const STATUS_VARIANT: Record<JobStatus, 'success' | 'warning' | 'neutral'> = {
  OPEN: 'success',
  FILLING: 'warning',
  CLOSED: 'neutral',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF0F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyIconText: {
    fontSize: 30,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emptyBtn: {
    alignSelf: 'stretch',
  },
  filterEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  jobMeta: {
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8EEF6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  addCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderStyle: 'dashed',
    backgroundColor: '#F8FBFF',
  },
});