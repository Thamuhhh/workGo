import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../src/store/applicationsStore';
import { useRatingsStore } from '../../src/store/ratingsStore';
import { useWalletStore, parseSalary } from '../../src/store/walletStore';
import { RateSheet } from '../../src/components/RateSheet';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

const STATUS_META: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'primary' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'success' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'info' },
  ACCEPTED: { label: 'Accepted', variant: 'primary' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

export default function WorkerBookingsScreen() {
  const applications = useApplicationsStore((s) => s.applications);
  const markCompleted = useApplicationsStore((s) => s.markCompleted);
  const ratings = useRatingsStore((s) => s.ratings);
  const rateJob = useRatingsStore((s) => s.rateJob);
  const credit = useWalletStore((s) => s.credit);

  const [rateJobId, setRateJobId] = useState<string | null>(null);

  const rows = applications
    .map((app) => ({ app, job: SAMPLE_JOBS.find((j) => j.id === app.jobId) }))
    .filter((r) => !!r.job);

  const rateTarget = rateJobId ? SAMPLE_JOBS.find((j) => j.id === rateJobId) : null;

  const handleSubmitRating = (jobId: string, stars: number, tags: string[], comment: string) => {
    rateJob(jobId, stars, tags, comment);
  };

  const handleComplete = (jobId: string) => {
    markCompleted(jobId);
    const job = SAMPLE_JOBS.find((j) => j.id === jobId);
    if (job) {
      credit(
        `${job.title} — completed`,
        job.employerName,
        parseSalary(job.salary)
      );
    }
    setRateJobId(jobId);
  };

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text variant="h2" weight="bold" style={styles.title}>
          Activity
        </Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
          Jobs from your applications
        </Text>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="briefcase-outline" size={40} color={Colors.primary} />
            </View>
            <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
              No activity yet
            </Text>
            <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
              Jobs you apply to and complete will show up here.
            </Text>
          </View>
        ) : (
        rows.map(({ app, job }, i) => {
          const status = app ? STATUS_META[app.status] : null;
          const rating = app && app.status === 'COMPLETED' ? ratings[job!.id] : null;
          return (
            <FadeSlide key={job!.id} delay={i * 60}>
              <Card
                padding="lg"
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: '/(worker)/job-detail', params: { jobId: job!.id } })
                }
              >
                <View style={styles.row}>
                  <Text variant="h3" weight="bold" color="#0F172A" style={styles.title}>
                    {job!.title}
                  </Text>
                  {status ? (
                    <Badge label={status.label} variant={status.variant} size="sm" />
                  ) : (
                    <Badge label="Upcoming" variant="neutral" size="sm" />
                  )}
                </View>
                <Text variant="bodySm" color={Colors.textSecondary} style={styles.employer}>
                  {job!.employerName}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                    <Text variant="bodySm" color={Colors.textSecondary}>{job!.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text variant="bodySm" color={Colors.textSecondary}>{job!.timing}</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                    <Text variant="bodySm" color={Colors.textSecondary}>{job!.location}</Text>
                  </View>
                  <Text variant="body" weight="heavy" color="#0F172A">
                    {job!.salary}
                  </Text>
                </View>

                {/* Completion + rating actions */}
                {app?.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleComplete(job!.id)}
                    style={styles.completeBtn}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text variant="bodySm" weight="bold" color="#FFFFFF">
                      Mark Work Complete
                    </Text>
                  </TouchableOpacity>
                )}

                {app?.status === 'COMPLETED' && (
                  rating ? (
                    <View style={styles.ratingBox}>
                      <View style={styles.ratingHeader}>
                        <View style={styles.ratingStarsRow}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Ionicons
                              key={n}
                              name="star"
                              size={14}
                              color={n <= rating.stars ? '#F59E0B' : '#E2E8F0'}
                            />
                          ))}
                          <Text variant="bodySm" weight="bold" color="#0F172A" style={styles.ratingScore}>
                            {rating.stars}.0
                          </Text>
                        </View>
                        <Text variant="caption" color={Colors.textMuted}>
                          You rated
                        </Text>
                      </View>
                      {rating.tags.length > 0 && (
                        <View style={styles.ratingTags}>
                          {rating.tags.map((t) => (
                            <View key={t} style={styles.ratingTag}>
                              <Text variant="caption" weight="semibold" color={Colors.primary}>
                                {t}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {rating.comment ? (
                        <Text variant="bodySm" color={Colors.textSecondary} style={styles.ratingComment}>
                          “{rating.comment}”
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setRateJobId(job!.id)}
                        style={styles.editRatingRow}
                      >
                        <Text variant="caption" weight="bold" color={Colors.primary}>
                          Edit rating
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setRateJobId(job!.id)}
                      style={styles.rateBtn}
                    >
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text variant="bodySm" weight="bold" color="#0F172A">
                        Rate {job!.employerName}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </Card>
            </FadeSlide>
          );
        })
        )}
      </ScrollView>

      <RateSheet
        visible={!!rateJobId}
        onClose={() => setRateJobId(null)}
        employerName={rateTarget?.employerName}
        jobTitle={rateTarget?.title}
        onSubmit={(stars, tags, comment) => {
          if (rateJobId) handleSubmitRating(rateJobId, stars, tags, comment);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 110,
    backgroundColor: Colors.background,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    marginTop: 2,
    textAlign: 'center',
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
    marginBottom: Spacing.sm,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  ratingBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingScore: {
    marginLeft: 4,
  },
  ratingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  ratingTag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.round,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  ratingComment: {
    marginTop: Spacing.sm,
  },
  editRatingRow: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
});