import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Badge } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';
import { ScalePress, FadeSlide } from '../../../src/components/AppHeader';
import { Spacing, BorderRadius, Colors } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useMessagesStore } from '../../../src/store/messagesStore';
import { Animated, Platform } from 'react-native';
import { useEmployerJobsStore } from '../../../src/store/employerJobsStore';
import { useLocationStore } from '../../../src/store/locationStore';
import { useJobsStore, areaJobCount } from '../../../src/store/jobsStore';
import { useReviewApplicantsStore } from '../../../src/store/reviewApplicantsStore';

const GREETING_MSG = (() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Vanakkam';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
})();

interface Applicant {
  id: string;
  name: string;
  service: string;
  area: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
}

export default function EmployerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const businessName = user?.businessName || user?.name || 'there';
  const businessFirstName = businessName.split(' ')[0];
  const reviewApplicants = useReviewApplicantsStore((s) => s.applicants);
  const jobs = useEmployerJobsStore((s) => s.jobs);
  const activeJobs = jobs.length;
  const hiredCount = jobs.reduce((sum, j) => sum + j.hired, 0);
  const locationLabel = useLocationStore((s) => s.label);
  const locationAddress = useLocationStore((s) => s.address);
  const liveWorkJobs = useJobsStore((s) => s.jobs);
  const loadWorkJobs = useJobsStore((s) => s.loadJobs);
  const jobsNearby = areaJobCount(liveWorkJobs, locationLabel, locationAddress);
  const newApplicants = reviewApplicants.filter(
    (a) => a.status === 'APPLIED' || a.status === 'SHORTLISTED'
  ).length;
  const unreadCount = Object.values(useMessagesStore.getState().threadMeta).reduce(
    (sum, t) => sum + (t.unread > 0 ? 1 : 0),
    0
  );

  useEffect(() => {
    useMessagesStore.getState().loadThreads();
    loadWorkJobs().catch(() => {});
  }, []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const jobsThisMonth = jobs.filter((j) => new Date(j.createdAt) >= monthStart).length;
  const investedThisMonth = jobs
    .filter((j) => new Date(j.createdAt) >= monthStart)
    .reduce((s, j) => s + j.hired * j.salaryPerDay, 0);
  const weekStartOf = (d: Date) => {
    const c = new Date(d);
    c.setDate(c.getDate() - ((c.getDay() + 6) % 7));
    c.setHours(0, 0, 0, 0);
    return c;
  };
  const thisWeekStart = weekStartOf(now);
  const weekStarts = Array.from(
    { length: 6 },
    (_, i) => new Date(thisWeekStart.getTime() - (5 - i) * 7 * 86400000)
  );
  const weeklyCounts = weekStarts.map(
    (ws) => jobs.filter((j) => weekStartOf(new Date(j.createdAt)).getTime() === ws.getTime()).length
  );
  const maxWeekly = Math.max(...weeklyCounts, 1);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 8], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });
  const comboMargin = scrollY.interpolate({ inputRange: [0, 64], outputRange: [Spacing.md, 4], extrapolate: 'clamp' });
  const comboScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.97], extrapolate: 'clamp' });
  const taglineOpacity = scrollY.interpolate({ inputRange: [0, 44], outputRange: [1, 0], extrapolate: 'clamp' });
  const taglineHeight = scrollY.interpolate({ inputRange: [0, 44], outputRange: [16, 0], extrapolate: 'clamp' });
  const actionsOpacity = scrollY.interpolate({ inputRange: [0, 44], outputRange: [1, 0], extrapolate: 'clamp' });

  if (usePageLoading()) return <ScreenSkeleton variant="home" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', '#F8FAFC', '#F8FAFC']}
        locations={[0, 0.34, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
      <View style={styles.mainContainer}>
          {/* Sticky header */}
          <Animated.View
            style={[
              styles.headerShell,
              { paddingTop: headerPadTop, paddingBottom: headerPadBottom },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Animated.View style={[styles.headerTopRow, { transform: [{ scale: brandScale }] }]}>
                <View style={styles.brandCol}>
                  <Text variant="h2" weight="heavy" color="#0F172A" style={styles.brandTitle}>
                    Gig<Text variant="h2" weight="heavy" color="#0F172A">ro</Text>
                  </Text>
                  <Animated.View style={{ height: taglineHeight, opacity: taglineOpacity }}>
                    <Text variant="caption" weight="medium" color="#64748B" style={styles.brandTagline}>
                      {GREETING_MSG}, <Text variant="caption" weight="bold" color="#0F172A">{businessFirstName}</Text>!
                    </Text>
                  </Animated.View>
                </View>

                <Animated.View style={[styles.headerActions, { opacity: actionsOpacity }]}>
                  <View>
                    <ScalePress
                      onPress={() => router.push('/(employer)/messages')}
                      style={styles.iconBtnDark}
                      scaleTo={0.9}
                    >
                      <Ionicons name="chatbubble" size={21} color="#64748B" weight="fill" />
                    </ScalePress>
                    {unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text variant="caption" weight="bold" color="#FFFFFF" style={styles.unreadBadgeText}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              </Animated.View>

              {/* Location */}
              <Animated.View
                style={[
                  styles.comboCard,
                  { marginTop: comboMargin, transform: [{ scale: comboScale }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.comboLocationZone,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  ]}
                  onPress={() => router.push('/(worker)/location-picker')}
                >
                  <View style={styles.locationIconChip}>
                    <Ionicons name="location-outline" size={16} color="#0F172A" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.comboLocationLabel}>
                      {locationLabel}
                      {jobsNearby != null && (
                        <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                          {' '}
                          · {jobsNearby} jobs
                        </Text>
                      )}
                    </Text>
                    {locationAddress && locationLabel !== locationAddress && (
                      <Text variant="caption" color="#64748B" numberOfLines={1}>
                        {locationAddress}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >

          {/* Post Job Hero CTA */}
          <FadeSlide delay={80}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(employer)/post-job')}
            >
              <LinearGradient
                colors={['#334155', '#0F172A', '#020617']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 0.55, 1]}
                style={styles.heroCta}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  pointerEvents="none"
                  style={styles.heroSheen}
                />
                <View style={styles.heroCtaIconWrap}>
                  <Ionicons name="add" size={28} color="#FFFFFF" weight="bold" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="h3" weight="bold" color="#FFFFFF">
                    Post a New Job
                  </Text>
                  <Text variant="caption" color="#CBD5E1">
                    Get workers applied within minutes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </FadeSlide>

          {/* Hiring Stats */}
          <FadeSlide delay={160}>
            <View style={styles.statsRow}>
              <ScalePress
                scaleTo={0.95}
                onPress={() => router.push('/(employer)/jobs')}
                style={[styles.statCard, styles.statCardAccent]}
              >
                <View style={[styles.statIconChip, styles.statIconChipBlue]}>
                  <Ionicons name="briefcase-outline" size={15} color="#0F172A" weight="fill" />
                </View>
                <Text variant="h3" weight="heavy" color="#0F172A">{activeJobs}</Text>
                <Text variant="caption" weight="medium" color="#475569">Active Jobs</Text>
              </ScalePress>
              <ScalePress
                scaleTo={0.95}
                onPress={() => router.push('/(employer)/review-applicants')}
                style={styles.statCard}
              >
                <View style={[styles.statIconChip, styles.statIconChipRed]}>
                  <Ionicons name="people-outline" size={15} color="#EF4444" weight="fill" />
                </View>
                <View style={styles.statIconRow}>
                  <Text variant="h3" weight="heavy" color="#0F172A">{newApplicants}</Text>
                  {newApplicants > 0 && <View style={styles.statNewDot} />}
                </View>
                <Text variant="caption" weight="medium" color="#475569">New Applicants</Text>
              </ScalePress>
              <ScalePress
                scaleTo={0.95}
                onPress={() => router.push('/(employer)/jobs')}
                style={styles.statCard}
              >
                <View style={[styles.statIconChip, styles.statIconChipGreen]}>
                  <Ionicons name="checkmark-circle-outline" size={15} color="#16A34A" weight="fill" />
                </View>
                <Text variant="h3" weight="heavy" color="#0F172A">{hiredCount}</Text>
                <Text variant="caption" weight="medium" color="#475569">Workers Hired</Text>
              </ScalePress>
            </View>
          </FadeSlide>

          {/* This Month Analytics */}
          <FadeSlide delay={200}>
            <View style={styles.analyticsCard}>
              <View style={styles.sectionHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  This Month
                </Text>
                <Text variant="caption" weight="medium" color="#64748B">
                  {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </Text>
              </View>

              <View style={styles.analyticsRow}>
                <View style={[styles.analyticsCol, styles.analyticsColBorder]}>
                  <View style={styles.analyticsIconWrap}>
                    <Ionicons name="briefcase-outline" size={14} color="#0F172A" />
                  </View>
                  <Text variant="h3" weight="heavy" color="#0F172A">{jobsThisMonth}</Text>
                  <Text variant="caption" weight="medium" color="#64748B">Jobs posted</Text>
                </View>
                <View style={[styles.analyticsCol, styles.analyticsColBorder]}>
                  <View style={styles.analyticsIconWrap}>
                    <Ionicons name="people-outline" size={14} color="#16A34A" />
                  </View>
                  <Text variant="h3" weight="heavy" color="#0F172A">{hiredCount}</Text>
                  <Text variant="caption" weight="medium" color="#64748B">Workers hired</Text>
                </View>
                <View style={styles.analyticsCol}>
                  <View style={styles.analyticsIconWrap}>
                    <Ionicons name="wallet-outline" size={14} color="#F59E0B" />
                  </View>
                  <Text variant="h3" weight="heavy" color="#0F172A">
                    ₹{investedThisMonth.toLocaleString('en-IN')}
                  </Text>
                  <Text variant="caption" weight="medium" color="#64748B">Invested</Text>
                </View>
              </View>

              <View style={styles.chartBlock}>
                <Text variant="caption" weight="semibold" color="#64748B" style={styles.chartTitle}>
                  Weekly postings — last 6 weeks
                </Text>
                <View style={styles.chartRow}>
                  {weeklyCounts.map((count, i) => (
                    <View key={i} style={styles.chartCol}>
                      <Text variant="caption" weight="bold" color={count > 0 ? '#0F172A' : '#CBD5E1'}>
                        {count || ''}
                      </Text>
                      <View style={styles.chartBarTrack}>
                        <View
                          style={[
                            styles.chartBar,
                            {
                              height: Math.max(4, Math.round((count / maxWeekly) * 56)),
                            },
                          ]}
                        />
                      </View>
                      <Text variant="caption" color="#94A3B8">
                        {weekStarts[i].getDate()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </FadeSlide>

          {/* Applicants To Review */}
          <FadeSlide delay={280}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Applicants to Review
                </Text>
                {reviewApplicants.length > 0 && (
                  <TouchableOpacity onPress={() => router.push('/(employer)/review-applicants')}>
                    <Text variant="caption" weight="bold" color="#0F172A">
                      Review All →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {reviewApplicants.length === 0 ? (
                <View style={styles.emptyApplicantsCard}>
                  <View style={styles.emptyApplicantsIcon}>
                    <Ionicons name="person-done-outline" size={22} color="#0F172A" />
                  </View>
                  <Text variant="body" weight="bold" color="#0F172A">
                    No applicants to review yet
                  </Text>
                  <Text variant="caption" color="#64748B" align="center" style={styles.emptyApplicantsSub}>
                    When workers apply to your jobs, they'll appear here for quick review.
                  </Text>
                </View>
              ) : (
              reviewApplicants.map((applicant) => {
                const badgeVariant =
                  applicant.status === 'APPLIED'
                    ? ('info' as const)
                    : applicant.status === 'SHORTLISTED'
                    ? ('warning' as const)
                    : applicant.status === 'ACCEPTED'
                    ? ('success' as const)
                    : ('danger' as const);
                return (
                  <TouchableOpacity
                    key={applicant.id}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(employer)/review-applicants')}
                    style={styles.applicantCard}
                  >
                    <View style={styles.applicantTopRow}>
                      <View style={styles.avatar}>
                        <Text variant="body" weight="bold" color="#0F172A">
                          {applicant.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.applicantNameRow}>
                          <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={{ flexShrink: 1 }}>
                            {applicant.name}
                          </Text>
                          <Badge label={applicant.status} variant={badgeVariant} size="sm" />
                        </View>
                        <Text variant="caption" color="#64748B" numberOfLines={1}>
                          {applicant.service} • {applicant.area}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </View>
                  </TouchableOpacity>
                );
              })
              )}
            </View>
          </FadeSlide>

          {/* Active Jobs */}
          <FadeSlide delay={320}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Active Jobs
                </Text>
                <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
                  <Text variant="caption" weight="bold" color="#0F172A">
                    View All →
                  </Text>
                </TouchableOpacity>
              </View>

              {jobs.length === 0 ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(employer)/post-job')}
                  style={styles.emptyJobsCard}
                >
                  <View style={styles.emptyJobsIcon}>
                    <Ionicons name="briefcase-outline" size={22} color="#0F172A" />
                  </View>
                  <Text variant="body" weight="bold" color="#0F172A">
                    No active jobs yet
                  </Text>
                  <Text variant="caption" color="#64748B" align="center">
                    Post your first job to start hiring →
                  </Text>
                </TouchableOpacity>
              ) : (
                jobs.map((job) => {
                  const pct = Math.min(100, Math.round((job.hired / job.workersRequired) * 100));
                  return (
                    <TouchableOpacity
                      key={job.id}
                      activeOpacity={0.85}
onPress={() => router.push({ pathname: '/(employer)/job-detail', params: { jobId: job.id } })}
                      style={styles.jobCard}
                    >
                      <View style={styles.jobTop}>
                        <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={{ flex: 1 }}>
                          {job.title}
                        </Text>
                        <Badge
                          label={job.status === 'OPEN' ? 'OPEN' : job.status === 'FILLING' ? 'FILLING' : 'CLOSED'}
                          variant={job.status === 'OPEN' ? 'success' : job.status === 'FILLING' ? 'warning' : 'neutral'}
                          size="sm"
                        />
                      </View>
                      <Text variant="caption" color="#64748B" style={styles.jobMeta}>
                        {job.category} • {job.location} • {job.date} • ₹{job.salaryPerDay}/day
                      </Text>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                      </View>
                      <View style={styles.progressLabels}>
                        <Text variant="caption" weight="medium" color="#64748B">
                          {job.hired} / {job.workersRequired} hired
                        </Text>
                        <Text variant="caption" weight="bold" color="#0F172A">
                          {pct}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </FadeSlide>

          </ScrollView>

      </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: 90,
  },
  headerShell: {
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerGradient: {
    paddingHorizontal: Spacing.xl,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  brandTagline: {
    marginTop: 2,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtnDark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  comboCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  comboLocationZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  comboLocationLabel: {
    flexShrink: 1,
    minWidth: 0,
  },
  locationIconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
    overflow: 'hidden',
  },
  heroSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  heroCtaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  statCardAccent: {
    backgroundColor: '#F8FAFC',
    borderColor: '#EDF2F7',
  },
  statIconChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIconChipBlue: {
    backgroundColor: '#EEF2F7',
  },
  statIconChipRed: {
    backgroundColor: '#FEE2E2',
  },
  statIconChipGreen: {
    backgroundColor: '#DCFCE7',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNewDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginBottom: 12,
  },
  sectionContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  analyticsCol: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  analyticsColBorder: {
    borderRightWidth: 1,
    borderRightColor: '#EEF2F7',
  },
  analyticsIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  chartTitle: {
    marginBottom: Spacing.sm,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    height: 62,
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  chartBar: {
    width: 14,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  applicantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  emptyApplicantsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  emptyApplicantsIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyApplicantsSub: {
    marginTop: 2,
    textAlign: 'center',
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
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  emptyJobsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyJobsIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
});