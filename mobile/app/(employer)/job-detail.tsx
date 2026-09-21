import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useEmployerJobsStore, JobStatus } from '../../src/store/employerJobsStore';
import { useReviewApplicantsStore, ReviewApplicant } from '../../src/store/reviewApplicantsStore';

const STATUS_META: Record<JobStatus, { label: string; dot: string }> = {
  OPEN: { label: 'OPEN', dot: '#16A34A' },
  FILLING: { label: 'FILLING', dot: '#D97706' },
  CLOSED: { label: 'CLOSED', dot: '#94A3B8' },
};

const APPLICANT_STATUS: Record<ReviewApplicant['status'], { label: string; dot: string }> = {
  APPLIED: { label: 'Applied', dot: '#94A3B8' },
  SHORTLISTED: { label: 'Shortlisted', dot: '#D97706' },
  ACCEPTED: { label: 'Accepted', dot: '#16A34A' },
  REJECTED: { label: 'Rejected', dot: '#DC2626' },
  COMPLETED: { label: 'Completed', dot: '#16A34A' },
};

const isPending = (s: ReviewApplicant['status']) => s === 'APPLIED' || s === 'SHORTLISTED';

export default function EmployerJobDetailScreen() {
  const params = useLocalSearchParams<{ jobId: string }>();
  const jobs = useEmployerJobsStore((s) => s.jobs);
  const updateJob = useEmployerJobsStore((s) => s.updateJob);
  const duplicateJob = useEmployerJobsStore((s) => s.duplicateJob);
  const removeJob = useEmployerJobsStore((s) => s.removeJob);
  const applicants = useReviewApplicantsStore((s) => s.applicants);
  const review = useReviewApplicantsStore((s) => s.review);

  const job = jobs.find((j) => j.id === params.jobId);

  if (usePageLoading(400)) return <ScreenSkeleton variant="list" />;

  if (!job) {
    return (
      <View style={styles.notFound}>
        <Text variant="body" weight="bold" color="#0F172A">
          Job not found
        </Text>
        <Button title="Back to Jobs" variant="outline" size="sm" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const mine = applicants.filter((a) => a.jobId === job.id);
  const pendingMine = mine.filter((a) => isPending(a.status));
  const pct = Math.min(100, Math.round((job.hired / job.workersRequired) * 100));

  const toggleStatus = () => {
    updateJob(job.id, { status: job.status === 'CLOSED' ? 'OPEN' : 'CLOSED' });
  };

  const handleDuplicate = async () => {
    const newId = await duplicateJob(job.id);
    if (newId) router.replace({ pathname: '/(employer)/job-detail', params: { jobId: newId } });
  };

  const handleReview = (applicant: ReviewApplicant, action: 'accept' | 'reject') => {
    review(applicant.id, action);
  };

  const handleDelete = () => {
    Alert.alert('Delete this job?', 'This removes the job. Jobs with applications will just be closed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const message = await removeJob(job.id);
          Alert.alert('Job removed', message);
          if (!message.toLowerCase().includes('closed')) {
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headCard}>
        <View style={styles.headTop}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="h2" weight="bold" color="#0F172A" style={styles.title}>
              {job.title}
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {job.category}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_META[job.status].dot }]} />
            <Text variant="caption" weight="bold" color={Colors.textSecondary}>
              {STATUS_META[job.status].label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MetaItem icon="location-outline" text={job.location} />
          <MetaItem icon="calendar-outline" text={job.date} />
          <MetaItem icon="time-outline" text={`₹${job.salaryPerDay}/day`} />
        </View>

        <View style={styles.facilitiesRow}>
          {job.foodProvided && (
            <Text variant="caption" color={Colors.textMuted}>🍽 Food provided</Text>
          )}
          {job.transportProvided && (
            <Text variant="caption" color={Colors.textMuted}>🚌 Transport provided</Text>
          )}
        </View>
      </View>

      {/* Hiring progress */}
      <View style={styles.sectionCard}>
        <Text variant="body" weight="bold" color="#0F172A">
          Hiring Progress
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text variant="caption" weight="medium" color={Colors.textSecondary}>
            {job.hired} / {job.workersRequired} hired
          </Text>
          <Text variant="caption" weight="bold" color="#0F172A">
            {pct}% filled
          </Text>
        </View>
      </View>

      {/* Applicants for this job */}
      <View style={styles.sectionCard}>
        <View style={styles.actionRowHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="bold" color="#0F172A">
              Applicants
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {pendingMine.length} to review · {mine.length} total
            </Text>
          </View>
          {mine.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/(employer)/review-applicants', params: { jobId: job.id } })}
              hitSlop={6}
            >
              <Text variant="caption" weight="bold" color="#0F172A">
                View all →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {mine.length === 0 ? (
          <View style={styles.noApplicants}>
            <Ionicons name="people-outline" size={18} color="#94A3B8" />
            <Text variant="caption" color={Colors.textSecondary} style={{ flex: 1 }}>
              No applicants yet for this job.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(employer)/bookings')}
              hitSlop={6}
            >
              <Text variant="caption" weight="bold" color="#0F172A">
                View bookings →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          mine.map((applicant) => {
            const meta = APPLICANT_STATUS[applicant.status] ?? APPLICANT_STATUS.APPLIED;
            const pending = isPending(applicant.status);
            return (
              <View key={applicant.id} style={styles.applicantCard}>
                <View style={styles.applicantTop}>
                  <View style={styles.avatar}>
                    <Text variant="body" weight="bold" color="#334155">
                      {applicant.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                      {applicant.name}
                    </Text>
                    <Text variant="caption" color="#94A3B8" numberOfLines={1}>
                      {applicant.service} • {applicant.area}
                    </Text>
                  </View>
                  <View style={styles.miniStatus}>
                    <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
                    <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                      {meta.label}
                    </Text>
                  </View>
                </View>
                {pending ? (
                  <View style={styles.applicantActions}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleReview(applicant, 'reject')}
                      style={[styles.reviewBtn, styles.reviewBtnGhost]}
                    >
                      <Text variant="bodySm" weight="bold" color="#475569">
                        Reject
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleReview(applicant, 'accept')}
                      style={[styles.reviewBtn, styles.reviewBtnSolid]}
                    >
                      <Text variant="bodySm" weight="bold" color="#FFFFFF">
                        Accept
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.resultPill,
                      applicant.status === 'ACCEPTED' ? styles.resultPillOk : styles.resultPillNo,
                    ]}
                  >
                    <Ionicons
                      name={applicant.status === 'ACCEPTED' ? 'checkmark' : 'close'}
                      size={13}
                      color={applicant.status === 'ACCEPTED' ? '#16A34A' : '#DC2626'}
                      weight="bold"
                    />
                    <Text variant="bodySm" weight="semibold" color="#334155">
                      {applicant.status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}
                    </Text>
                    <Text variant="caption" color="#94A3B8">
                      {applicant.status === 'ACCEPTED' ? '· notified' : '· notified'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Actions */}
      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.actionsLabel}>
        JOB ACTIONS
      </Text>
      <View style={styles.actionsGrid}>
        <ActionTile
          icon="document-text"
          label="Edit Job"
          onPress={() => router.push({ pathname: '/(employer)/post-job', params: { jobId: job.id } })}
        />
        <ActionTile
          icon={job.status === 'CLOSED' ? 'checkmark-circle' : 'close-circle'}
          label={job.status === 'CLOSED' ? 'Reopen Job' : 'Close Job'}
          onPress={toggleStatus}
        />
        <ActionTile
          icon="copy"
          label="Duplicate"
          onPress={handleDuplicate}
        />
        <ActionTile
          icon="trash"
          label="Delete"
          onPress={handleDelete}
        />
      </View>

      <Text variant="caption" color={Colors.textMuted} style={styles.postedAt}>
        Posted {new Date(job.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
    </ScrollView>
  );
}

function MetaItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={Colors.textSecondary} />
      <Text variant="bodySm" color={Colors.textSecondary} style={styles.metaText}>
        {text}
      </Text>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const c = '#0F172A';
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionTile}>
      <View style={[styles.actionTileIcon, { backgroundColor: '#F1F5F9' }]}>
        <Ionicons name={icon} size={20} color={c} weight="bold" />
      </View>
      <Text variant="bodySm" weight="semibold" color="#0F172A">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  headCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: Spacing.md,
  },
  headTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    lineHeight: 28,
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaRow: {
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
  },
  facilitiesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  actionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noApplicants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applicantCard: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applicantTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  applicantActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  reviewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  reviewBtnSolid: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  reviewBtnGhost: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EDF2F7',
  },
  resultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  resultPillOk: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  resultPillNo: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  actionsLabel: {
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    gap: 8,
  },
  actionTileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postedAt: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});