import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../src/store/applicationsStore';
import { useRatingsStore } from '../../src/store/ratingsStore';
import { usePaymentsStore, formatINR } from '../../src/store/paymentsStore';
import { parseSalary } from '../../src/store/walletStore';
import { RateSheet } from '../../src/components/RateSheet';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

type TabKey = 'all' | 'active' | 'completed' | 'other';

const STATUS_DOT: Record<ApplicationStatus, string> = {
  APPLIED: '#2563EB',
  SHORTLISTED: '#F59E0B',
  ACCEPTED: '#16A34A',
  REJECTED: '#EF4444',
  COMPLETED: '#94A3B8',
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  ACCEPTED: 'Active',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'other', label: 'Other' },
];

function tabOf(status: ApplicationStatus): TabKey {
  if (status === 'ACCEPTED') return 'active';
  if (status === 'COMPLETED') return 'completed';
  return 'other';
}

export default function WorkerBookingsScreen() {
  const applications = useApplicationsStore((s) => s.applications);
  const markCompleted = useApplicationsStore((s) => s.markCompleted);
  const ratings = useRatingsStore((s) => s.ratings);
  const rateJob = useRatingsStore((s) => s.rateJob);
  const payments = usePaymentsStore((s) => s.payments);
  const createPayment = usePaymentsStore((s) => s.createPayment);

  const [tab, setTab] = useState<TabKey>('all');
  const [rateJobId, setRateJobId] = useState<string | null>(null);

  const rows = applications
    .map((app) => ({ app, job: SAMPLE_JOBS.find((j) => j.id === app.jobId) }))
    .filter((r) => !!r.job);

  const visibleRows = rows.filter((r) => tab === 'all' || tabOf(r.app!.status) === tab);

  const count = (t: TabKey) =>
    t === 'all' ? rows.length : rows.filter((r) => tabOf(r.app!.status) === t).length;

  const activeCount = count('active');
  const completedCount = count('completed');
  const statsLine = `${activeCount} active  ·  ${completedCount} completed`;

  const rateTarget = rateJobId ? SAMPLE_JOBS.find((j) => j.id === rateJobId) : null;

  const openPayment = (jobId: string) => {
    const payment = payments.find((p) => p.jobId === jobId);
    if (payment) router.push({ pathname: '/(worker)/payment', params: { paymentId: payment.id } });
  };

  const handleSubmitRating = (jobId: string, stars: number, tags: string[], comment: string) => {
    rateJob(jobId, stars, tags, comment);
  };

  const handleComplete = (jobId: string) => {
    markCompleted(jobId);
    const job = SAMPLE_JOBS.find((j) => j.id === jobId);
    if (job) {
      const payment = createPayment({
        jobId,
        title: job.title,
        workerName: 'You',
        employerName: job.employerName,
        amount: parseSalary(job.salary),
      });
      router.push({ pathname: '/(worker)/payment', params: { paymentId: payment.id } });
    }
  };

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headRow}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
            BOOKINGS
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            {statsLine}
          </Text>
        </View>
        <View style={styles.headRule} />

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.7}
                onPress={() => setTab(t.key)}
                style={styles.tab}
              >
                <Text
                  variant="bodySm"
                  weight={on ? 'bold' : 'medium'}
                  color={on ? '#0F172A' : '#94A3B8'}
                >
                  {t.label}
                </Text>
                {count(t.key) > 0 && (
                  <Text variant="caption" color={on ? '#0F172A' : '#CBD5E1'} style={styles.tabCount}>
                    {count(t.key)}
                  </Text>
                )}
                <View style={[styles.tabUnderline, on && styles.tabUnderlineActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {visibleRows.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="briefcase-outline" size={30} color="#94A3B8" />
            </View>
            <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
              {tab === 'all' ? 'No bookings yet' : `Nothing ${TABS.find((x) => x.key === tab)?.label.toLowerCase() ?? ''} here`}
            </Text>
            <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
              {tab === 'all'
                ? 'Jobs you apply to and complete will show up here.'
                : 'Check back after you apply or finish a gig.'}
            </Text>
            <Button
              title="Explore Jobs"
              size="sm"
              icon={<Ionicons name="search" size={15} color="#FFFFFF" weight="bold" />}
              onPress={() => router.push('/(worker)/jobs')}
              style={styles.emptyCta}
            />
          </View>
        ) : (
          visibleRows.map(({ app, job }, i) => {
            const status = app?.status;
            const rating = status === 'COMPLETED' ? ratings[job!.id] : null;
            const payment = payments.find((p) => p.jobId === job!.id);
            return (
              <FadeSlide key={job!.id} delay={i * 70}>
                <View style={styles.card}>
                  {/* Title row */}
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                        {job!.title}
                      </Text>
                      <Text variant="caption" color={Colors.textMuted} numberOfLines={1} style={styles.employer}>
                        {job!.employerName}
                      </Text>
                    </View>
                    {status && (
                      <View style={styles.status}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[status] }]} />
                        <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                          {STATUS_LABEL[status]}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                      <Text variant="caption" color={Colors.textSecondary}>{job!.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color="#94A3B8" />
                      <Text variant="caption" color={Colors.textSecondary}>{job!.timing}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Footer */}
                  <View style={styles.footerRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={13} color="#94A3B8" />
                      <Text variant="caption" color={Colors.textSecondary}>{job!.location}</Text>
                    </View>
                    <Text variant="body" weight="semibold" color="#0F172A" style={styles.salary}>
                      {job!.salary}
                    </Text>
                  </View>

                  {/* Active: complete CTA */}
                  {status === 'ACCEPTED' && (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleComplete(job!.id)}
                      style={styles.primaryBtn}
                    >
                      <Text variant="bodySm" weight="bold" color="#FFFFFF">
                        Mark Work Complete
                      </Text>
                      <Ionicons name="arrow-right" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  {/* Completed: payment + review */}
                  {status === 'COMPLETED' && (
                    <>
                      {payment && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => openPayment(job!.id)}
                          style={styles.paymentLine}
                        >
                          <Ionicons
                            name={payment.status === 'PAID' ? 'checkmark-circle' : 'time-outline'}
                            size={13}
                            color={payment.status === 'PAID' ? '#16A34A' : '#B45309'}
                            weight={payment.status === 'PAID' ? 'fill' : 'regular'}
                          />
                          <Text
                            variant="caption"
                            weight="semibold"
                            color={payment.status === 'PAID' ? '#16A34A' : '#B45309'}
                            style={styles.paymentText}
                          >
                            {payment.status === 'PAID'
                              ? `${formatINR(payment.amount)} received`
                              : 'Payment on the way'}
                          </Text>
                          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
                        </TouchableOpacity>
                      )}

                      {rating ? (
                        <View style={styles.ratingBox}>
                          <View style={styles.ratingTop}>
                            <View style={styles.ratingStars}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Ionicons
                                  key={n}
                                  name="star"
                                  size={12}
                                  color={n <= rating.stars ? '#F59E0B' : '#E2E8F0'}
                                  weight={n <= rating.stars ? 'fill' : 'regular'}
                                />
                              ))}
                              <Text variant="bodySm" weight="bold" color="#0F172A" style={styles.ratingScore}>
                                {rating.stars}.0
                              </Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setRateJobId(job!.id)}>
                              <Text variant="caption" weight="bold" color={Colors.primary}>
                                Edit
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.ratingTags}>
                            {rating.tags.map((t) => (
                              <Text key={t} variant="caption" color={Colors.textSecondary}>
                                #{t.replaceAll(' ', '')}
                              </Text>
                            ))}
                          </View>
                          {rating.comment ? (
                            <Text
                              variant="caption"
                              color={Colors.textSecondary}
                              numberOfLines={2}
                              style={styles.ratingComment}
                            >
                              “{rating.comment}”
                            </Text>
                          ) : null}
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => setRateJobId(job!.id)}
                          style={styles.ghostBtn}
                        >
                          <Ionicons name="star" size={15} color="#F59E0B" weight="fill" />
                          <Text variant="bodySm" weight="bold" color="#0F172A">
                            Rate {job!.employerName}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
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
  subtitle: {
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: Spacing.lg,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tab: {
    position: 'relative',
    paddingBottom: 8,
  },
  tabCount: {
    position: 'absolute',
    top: -6,
    right: -12,
    fontSize: 10,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.md + 4,
    marginBottom: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  employer: {
    marginTop: 2,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  salary: {
    fontVariant: ['tabular-nums'],
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  paymentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  paymentText: {
    flex: 1,
  },
  ratingBox: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  ratingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingStars: {
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
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ratingComment: {
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
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
  emptyCta: {
    marginTop: Spacing.lg,
  },
});