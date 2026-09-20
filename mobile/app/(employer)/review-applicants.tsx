import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useReviewApplicantsStore, ReviewApplicant } from '../../src/store/reviewApplicantsStore';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useEmployerJobsStore } from '../../src/store/employerJobsStore';

const STATUS_META: Record<string, { label: string; dot: string }> = {
  APPLIED: { label: 'Applied', dot: '#94A3B8' },
  SHORTLISTED: { label: 'Shortlisted', dot: '#D97706' },
  ACCEPTED: { label: 'Accepted', dot: '#16A34A' },
  REJECTED: { label: 'Rejected', dot: '#DC2626' },
};

type FilterKey = 'all' | 'review' | 'accepted' | 'rejected';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'review', label: 'To review' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
];

const isPending = (status: ReviewApplicant['status']) => status === 'APPLIED' || status === 'SHORTLISTED';

const jobTitleOf = (jobId: string) =>
  SAMPLE_JOBS.find((j) => j.id === jobId)?.title ??
  useEmployerJobsStore.getState().jobs.find((j) => j.id === jobId)?.title ??
  'Other jobs';

export default function ReviewApplicantsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const applicants = useReviewApplicantsStore((s) => s.applicants);
  const review = useReviewApplicantsStore((s) => s.review);

  const scoped = jobId ? applicants.filter((a) => a.jobId === jobId) : applicants;

  const [confirm, setConfirm] = useState<{ applicant: ReviewApplicant; action: 'accept' | 'reject' } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<{ jobId: string; title: string; count: number } | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ tone: 'success' | 'danger'; title: string; body: string } | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (tone: 'success' | 'danger', title: string, body: string) => {
    setToast({ tone, title, body });
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 240, useNativeDriver: true }).start(() =>
        setToast(null)
      );
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleConfirm = () => {
    if (!confirm) return;
    const { applicant, action } = confirm;
    review(applicant.id, action);
    setConfirm(null);
    const firstName = applicant.name.split(' ')[0];
    if (action === 'accept') {
      showToast(
        'success',
        'Applicant accepted',
        `${firstName} will get an "application accepted" message + notification.`
      );
    } else {
      showToast(
        'danger',
        'Applicant rejected',
        `${firstName} has been notified politely.`
      );
    }
  };

  const handleBulkConfirm = () => {
    if (!bulkConfirm) return;
    const pending = applicants.filter(
      (a) => a.jobId === bulkConfirm.jobId && isPending(a.status)
    );
    pending.forEach((a) => review(a.id, 'accept'));
    const count = pending.length;
    setBulkConfirm(null);
    showToast(
      'success',
      'Applicants accepted',
      count === 1
        ? `1 worker accepted for ${bulkConfirm.title}.`
        : `${count} workers accepted for ${bulkConfirm.title}.`
    );
  };

  const toReview = scoped.filter((a) => isPending(a.status)).length;
  const accepted = scoped.filter((a) => a.status === 'ACCEPTED').length;
  const rejected = scoped.filter((a) => a.status === 'REJECTED').length;

  const q = search.trim().toLowerCase();
  const filtered = scoped.filter((a) => {
    if (filter === 'review' && !isPending(a.status)) return false;
    if (filter === 'accepted' && a.status !== 'ACCEPTED') return false;
    if (filter === 'rejected' && a.status !== 'REJECTED') return false;
    if (q) {
      const hay = `${a.name} ${a.service} ${jobTitleOf(a.jobId)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ReviewApplicant[]>();
    filtered.forEach((a) => {
      const arr = map.get(a.jobId) ?? [];
      arr.push(a);
      map.set(a.jobId, arr);
    });
    const groups = [...map.entries()];
    groups.sort((x, y) => {
      const xPend = x[1].some((a) => isPending(a.status));
      const yPend = y[1].some((a) => isPending(a.status));
      if (xPend !== yPend) return xPend ? -1 : 1;
      return 0;
    });
    return groups;
  }, [filtered]);

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <FadeSlide>
          <View style={styles.headRow}>
            <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
              APPLICANTS
            </Text>
            <Text variant="caption" color={Colors.textMuted}>
              {toReview} to review · {accepted} accepted
            </Text>
          </View>
          <View style={styles.headRule} />
        </FadeSlide>

        {/* ─── Search ─── */}
        <FadeSlide delay={50}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={17} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search applicant, skill or job"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={10} activeOpacity={0.6}>
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </FadeSlide>

        {/* ─── Filters ─── */}
        <FadeSlide delay={80}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const count =
                f.key === 'all'
                  ? scoped.length
                  : f.key === 'review'
                  ? toReview
                  : f.key === 'accepted'
                  ? accepted
                  : rejected;
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  activeOpacity={0.8}
                  onPress={() => setFilter(f.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color={active ? '#FFFFFF' : Colors.textSecondary}
                  >
                    {f.label} · {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeSlide>

        {/* ─── Groups ─── */}
        {grouped.length === 0 ? (
          <FadeSlide delay={100}>
            <View style={styles.emptyState}>
              <Ionicons name="search" size={22} color="#94A3B8" />
              <Text variant="body" weight="bold" color="#0F172A" style={styles.emptyStateTitle}>
                No applicants found
              </Text>
              <Text variant="caption" color="#64748B" align="center" style={styles.emptyStateSub}>
                Try a different search or filter to find who you're looking for.
              </Text>
            </View>
          </FadeSlide>
        ) : (
          grouped.map(([jobId, items], groupIndex) => {
            const job = SAMPLE_JOBS.find((j) => j.id === jobId);
            const pendingCount = items.filter((a) => isPending(a.status)).length;
            const reviewed = items.length - pendingCount;
            const pct = items.length ? Math.round((reviewed / items.length) * 100) : 0;
            return (
              <FadeSlide key={jobId} delay={100 + groupIndex * 50}>
                <View style={styles.jobGroup}>
                  {/* Job header */}
                  <View style={styles.jobHeadRow}>
                    <View style={styles.jobIcon}>
                      <Ionicons name="briefcase-outline" size={13} color="#64748B" />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                        {jobTitleOf(jobId)}
                      </Text>
                      <Text variant="caption" color="#94A3B8" numberOfLines={1}>
                        {items.length} applicant{items.length !== 1 ? 's' : ''}
                        {job?.location ? ` · ${job.location}` : ''}
                      </Text>
                    </View>
                    {pendingCount > 0 && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setBulkConfirm({ jobId, title: jobTitleOf(jobId), count: pendingCount })}
                        style={styles.acceptAllBtn}
                      >
                        <Text variant="caption" weight="bold" color="#0F172A">
                          Accept all
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.jobProgressTrack}>
                    <View style={[styles.jobProgressFill, { width: `${pct}%` }]} />
                  </View>

                  {/* Applicants */}
                  {items.map((applicant) => {
                    const meta = STATUS_META[applicant.status] ?? STATUS_META.APPLIED;
                    const pending = isPending(applicant.status);
                    return (
                      <View key={applicant.id} style={styles.applicantCard}>
                        <View style={styles.applicantTopRow}>
                          <View style={styles.avatar}>
                            <Text variant="body" weight="bold" color="#334155">
                              {applicant.name.charAt(0)}
                            </Text>
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={styles.applicantNameRow}>
                              <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={{ flexShrink: 1 }}>
                                {applicant.name}
                              </Text>
                              <View style={styles.statusPill}>
                                <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
                                <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                                  {meta.label}
                                </Text>
                              </View>
                            </View>
                            <Text variant="caption" color="#94A3B8" numberOfLines={1}>
                              {applicant.service} • {applicant.area}
                            </Text>
                          </View>
                        </View>

                        {pending ? (
                          <View style={styles.applicantActions}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => setConfirm({ applicant, action: 'reject' })}
                              style={[styles.reviewBtn, styles.reviewBtnReject]}
                            >
                              <Text variant="bodySm" weight="bold" color="#475569">
                                Reject
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.85}
                              onPress={() => setConfirm({ applicant, action: 'accept' })}
                              style={[styles.reviewBtn, styles.reviewBtnAccept]}
                            >
                              <Text variant="bodySm" weight="bold" color="#FFFFFF">
                                Accept
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.applicantStatusLine}>
                            <View
                              style={[
                                styles.statusStripDot,
                                { backgroundColor: applicant.status === 'ACCEPTED' ? '#16A34A' : '#DC2626' },
                              ]}
                            />
                            <Text variant="bodySm" color={Colors.textSecondary}>
                              {applicant.status === 'ACCEPTED'
                                ? 'Accepted — message sent to the worker'
                                : 'Rejected — worker has been notified'}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </FadeSlide>
            );
          })
        )}

        {grouped.length > 0 && (
          <FadeSlide delay={140}>
            <View style={styles.infoCard}>
              <Ionicons name="sparkles" size={14} color="#94A3B8" />
              <Text variant="caption" color={Colors.textSecondary} style={{ flex: 1, lineHeight: 18 }}>
                Accepting a worker instantly sends them an{' '}
                <Text weight="bold" color="#0F172A">"application accepted" message</Text> and a notification in the mobile app.
              </Text>
            </View>
          </FadeSlide>
        )}
      </ScrollView>

      {/* ─── Confirm Review Bottom Sheet ─── */}
      <BottomSheet
        visible={Boolean(confirm) || Boolean(bulkConfirm)}
        onClose={() => {
          setConfirm(null);
          setBulkConfirm(null);
        }}
      >
        {confirm ? (
          <View style={styles.sheetContent}>
            <View style={[styles.sheetIcon, confirm.action === 'accept' ? styles.sheetIconAccept : styles.sheetIconReject]}>
              <Ionicons
                name={confirm.action === 'accept' ? 'checkmark' : 'close'}
                size={20}
                color={confirm.action === 'accept' ? '#0F172A' : '#DC2626'}
                weight="bold"
              />
            </View>
            <Text variant="h3" weight="bold" color="#0F172A" align="center">
              {confirm.action === 'accept' ? 'Accept this applicant?' : 'Reject this applicant?'}
            </Text>

            <View style={styles.sheetSummary}>
              <View style={styles.sheetSummaryRow}>
                <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                <Text variant="body" weight="semibold" color="#0F172A">{confirm.applicant.name}</Text>
              </View>
              <View style={styles.sheetSummaryRow}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
                <Text variant="bodySm" color={Colors.textSecondary} style={{ flex: 1 }}>
                  {jobTitleOf(confirm.applicant.jobId)}
                </Text>
              </View>
            </View>

            <Text variant="bodySm" color={Colors.textSecondary} align="center" style={styles.sheetBody}>
              {confirm.action === 'accept'
                ? 'They will get an "application accepted" message instantly.'
                : 'They will be notified with a polite rejection message.'}
            </Text>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirm(null)}
                style={[styles.sheetBtn, styles.sheetBtnGhost]}
              >
                <Text variant="bodySm" weight="bold" color="#475569">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirm}
                style={[styles.sheetBtn, styles.sheetBtnSolid]}
              >
                <Text variant="bodySm" weight="bold" color="#FFFFFF">
                  {confirm.action === 'accept' ? 'Accept' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          ) : bulkConfirm ? (
          <View style={styles.sheetContent}>
            <View style={[styles.sheetIcon, styles.sheetIconAccept]}>
              <Ionicons name="checkmark" size={20} color="#0F172A" weight="bold" />
            </View>
            <Text variant="h3" weight="bold" color="#0F172A" align="center">
              Accept all applicants?
            </Text>

            <View style={styles.sheetSummary}>
              <View style={styles.sheetSummaryRow}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
                <Text variant="body" weight="semibold" color="#0F172A">{bulkConfirm.title}</Text>
              </View>
              <View style={styles.sheetSummaryRow}>
                <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
                <Text variant="bodySm" color={Colors.textSecondary}>
                  {bulkConfirm.count === 1 ? '1 applicant' : `${bulkConfirm.count} applicants`}
                </Text>
              </View>
            </View>

            <Text variant="bodySm" color={Colors.textSecondary} align="center" style={styles.sheetBody}>
              Each one will get an "application accepted" message instantly.
            </Text>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setBulkConfirm(null)}
                style={[styles.sheetBtn, styles.sheetBtnGhost]}
              >
                <Text variant="bodySm" weight="bold" color="#475569">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleBulkConfirm}
                style={[styles.sheetBtn, styles.sheetBtnSolid]}
              >
                <Text variant="bodySm" weight="bold" color="#FFFFFF">
                  Accept all
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          ) : null}
      </BottomSheet>

      {/* ─── Inline Toast ─── */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <View style={[styles.toastIcon, toast.tone === 'success' ? styles.toastIconSuccess : styles.toastIconDanger]}>
            <Ionicons
              name={toast.tone === 'success' ? 'checkmark' : 'close'}
              size={13}
              color="#FFFFFF"
              weight="bold"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodySm" weight="bold" color="#FFFFFF">
              {toast.title}
            </Text>
            <Text variant="caption" color="#CBD5E1" numberOfLines={2} style={{ lineHeight: 16 }}>
              {toast.body}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  /* ── Header ── */
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
  /* ── Search ── */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: Spacing.md,
    minHeight: 46,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  /* ── Filters ── */
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  /* ── Job group ── */
  jobGroup: {
    marginBottom: Spacing.lg,
  },
  jobHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  jobIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptAllBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  jobProgressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    marginHorizontal: 2,
  },
  jobProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  /* ── Applicant card ── */
  applicantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  applicantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
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
  applicantActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  reviewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  reviewBtnAccept: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  reviewBtnReject: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EDF2F7',
  },
  applicantStatusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusStripDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  /* ── Empty + info ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    marginTop: Spacing.sm,
  },
  emptyStateSub: {
    marginTop: 2,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginTop: Spacing.xs,
  },
  /* ── Sheet ── */
  sheetContent: {
    alignItems: 'center',
  },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: '#F1F5F9',
  },
  sheetIconAccept: {
    backgroundColor: '#F1F5F9',
  },
  sheetIconReject: {
    backgroundColor: '#F1F5F9',
  },
  sheetSummary: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sheetBody: {
    marginTop: Spacing.md,
    lineHeight: 20,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    width: '100%',
  },
  sheetBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetBtnGhost: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EDF2F7',
  },
  sheetBtnSolid: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  /* ── Toast ── */
  toast: {
    position: 'absolute',
    top: 16,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 50,
  },
  toastIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastIconSuccess: {
    backgroundColor: '#16A34A',
  },
  toastIconDanger: {
    backgroundColor: '#EF4444',
  },
});