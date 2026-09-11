import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Badge, Button, Card } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useApplicationsStore } from '../../src/store/applicationsStore';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

const CATEGORY_ICONS: Record<string, string> = {
  Catering: 'restaurant-outline',
  Promoter: 'megaphone-outline',
  Cleaner: 'sparkles-outline',
  'MC/Anchor': 'mic-outline',
  'Event Coordinator': 'calendar-outline',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function JobDetailScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const applications = useApplicationsStore((s) => s.applications);
  const apply = useApplicationsStore((s) => s.apply);
  const [showApplied, setShowApplied] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.8)).current;

  const job = SAMPLE_JOBS.find((j) => j.id === params.jobId);
  const similarJobs = job
    ? SAMPLE_JOBS.filter((j) => j.id !== job.id && j.category === job.category)
    : [];

  const slotsLeft = job ? job.workersRequired - job.workersAccepted : 0;
  const fillPercent = job ? Math.round((job.workersAccepted / job.workersRequired) * 100) : 0;
  const isUrgent = job ? job.workersAccepted / job.workersRequired >= 0.8 : false;
  const hasApplied = job ? applications.some((a) => a.jobId === job.id) : false;
  const [startTime = '', endTime = ''] = (job?.timing ?? '').split(' - ');

  useEffect(() => {
    if (showApplied) {
      overlayOpacity.setValue(0);
      cardScale.setValue(0.8);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showApplied, overlayOpacity, cardScale]);

  const hideAppliedPopup = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowApplied(false));
  };

  const openApplications = () => {
    hideAppliedPopup();
    router.push('/(worker)/(tabs)/applications');
  };

  if (!job) {
    return (
      <>
        <Stack.Screen options={{ title: 'Job Details' }} />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text variant="h3" weight="semibold" color={Colors.textSecondary} style={styles.notFoundTitle}>
            Job not found
          </Text>
          <Button title="Go Back" size="sm" variant="outline" onPress={() => router.back()} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: job.title, headerShown: false }} />
      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.topBackBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.topBarTitle}>
            {job.category}
          </Text>
        </SafeAreaView>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ─── Applied Banner ─── */}
          {hasApplied && (
            <FadeSlide delay={60}>
              <View style={styles.appliedBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text variant="bodySm" weight="semibold" color="#FFFFFF" style={styles.appliedBannerText}>
                  Application submitted
                </Text>
                <TouchableOpacity onPress={() => router.push('/(worker)/(tabs)/applications')}>
                  <Text variant="bodySm" weight="bold" color="#FFFFFF" style={styles.appliedBannerLink}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </FadeSlide>
          )}
          {/* ─── Header ─── */}
          <FadeSlide delay={40}>
            <View style={styles.header}>
              <View style={styles.categoryChip}>
                <Ionicons
                  name={(CATEGORY_ICONS[job.category] ?? 'briefcase-outline') as any}
                  size={14}
                  color={Colors.primary}
                />
                <Text variant="caption" weight="semibold" color={Colors.primary} style={styles.categoryChipText}>
                  {job.category}
                </Text>
              </View>

              <Text variant="h1" weight="heavy" color="#0F172A" style={styles.jobTitle}>
                {job.title}
              </Text>

              <View style={styles.headerMeta}>
                <View style={styles.headerMetaItem}>
                  <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
                  <Text
                    variant="bodySm"
                    color={Colors.textSecondary}
                    numberOfLines={1}
                    style={[styles.headerMetaText, styles.headerMetaLocation]}
                  >
                    {job.location} · {job.distance}
                  </Text>
                </View>
                <View style={styles.headerMetaBadges}>
                  {isUrgent && <Badge label="Almost Full" variant="danger" size="sm" />}
                  {job.date === 'Today' && <Badge label="Today" variant="warning" size="sm" />}
                </View>
              </View>
            </View>
          </FadeSlide>

          <View style={styles.body}>
            {/* ─── Salary + Rating Row ─── */}
            <FadeSlide delay={80}>
              <View style={styles.salaryRow}>
                <View style={styles.salaryBlock}>
                  <Text variant="caption" color={Colors.textMuted}>Daily Pay</Text>
                  <Text variant="h2" weight="heavy" color={Colors.primary}>
                    {job.salary}
                  </Text>
                </View>
                <View style={styles.ratingBlock}>
                  <Ionicons name="star" size={20} color="#FBBF24" />
                  <View>
                    <Text variant="body" weight="bold" color="#0F172A">
                      {job.employerRating.split(' ')[0]}
                    </Text>
                    <Text variant="caption" color={Colors.textMuted}>Rating</Text>
                  </View>
                </View>
              </View>
            </FadeSlide>

            {/* ─── Employer Card ─── */}
            <FadeSlide delay={140}>
              <Card padding="lg" variant="outlined" style={styles.section}>
                <View style={styles.employerRow}>
                  <View style={styles.employerAvatar}>
                    <Text variant="body" weight="bold" color="#FFFFFF">
                      {getInitials(job.employerName)}
                    </Text>
                  </View>
                  <View style={styles.employerInfo}>
                    <View style={styles.employerNameRow}>
                      <Text variant="body" weight="bold" color="#0F172A">
                        {job.employerName}
                      </Text>
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    </View>
                    <Text variant="caption" color={Colors.textMuted}>
                      Verified Employer
                    </Text>
                  </View>
                </View>
              </Card>
            </FadeSlide>

            {/* ─── Info Tiles ─── */}
            <FadeSlide delay={200}>
              <View style={styles.tilesRow}>
                <View style={[styles.tile, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
                  <Text variant="caption" color={Colors.textMuted}>Date</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{job.date}</Text>
                </View>
                <View style={[styles.tile, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="time-outline" size={18} color="#7C3AED" />
                  <Text variant="caption" color={Colors.textMuted}>Timing</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{startTime}</Text>
                  <Text variant="caption" color="#6B7280" numberOfLines={1}>{endTime ? `till ${endTime}` : '—'}</Text>
                </View>
                <View style={[styles.tile, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="navigate-outline" size={18} color="#059669" />
                  <Text variant="caption" color={Colors.textMuted}>Distance</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{job.distance.replace(' away', '')}</Text>
                </View>
              </View>
            </FadeSlide>

            {/* ─── Slots Progress ─── */}
            <FadeSlide delay={260}>
              <Card padding="lg" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="people-outline" size={18} color={Colors.primary} />
                  <Text variant="body" weight="bold" color="#0F172A">
                    Hiring Progress
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${fillPercent}%` }]} />
                </View>
                <View style={styles.slotsFooter}>
                  <Text variant="bodySm" color={Colors.textSecondary}>
                    {job.workersAccepted} of {job.workersRequired} slots filled
                  </Text>
                  <Badge
                    label={`${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left`}
                    variant={slotsLeft <= 2 ? 'danger' : 'success'}
                    size="sm"
                  />
                </View>
              </Card>
            </FadeSlide>

            {/* ─── Amenities ─── */}
            <FadeSlide delay={320}>
              <Text variant="body" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                What's Included
              </Text>
              <View style={styles.amenitiesRow}>
                <View style={[styles.amenityCard, { backgroundColor: job.foodProvided ? '#ECFDF5' : '#F8FAFC' }]}>
                  <Ionicons
                    name={job.foodProvided ? 'restaurant' : 'restaurant-outline'}
                    size={24}
                    color={job.foodProvided ? '#059669' : Colors.textMuted}
                  />
                  <Text variant="bodySm" weight="bold" color={job.foodProvided ? '#059669' : Colors.textMuted}>
                    Food
                  </Text>
                  <Text variant="caption" color={job.foodProvided ? '#059669' : Colors.textMuted}>
                    {job.foodProvided ? 'Meals provided' : 'Not included'}
                  </Text>
                </View>
                <View style={[styles.amenityCard, { backgroundColor: job.transportProvided ? '#EEF2FF' : '#F8FAFC' }]}>
                  <Ionicons
                    name={job.transportProvided ? 'car' : 'car-outline'}
                    size={24}
                    color={job.transportProvided ? '#4F46E5' : Colors.textMuted}
                  />
                  <Text variant="bodySm" weight="bold" color={job.transportProvided ? '#4F46E5' : Colors.textMuted}>
                    Transport
                  </Text>
                  <Text variant="caption" color={job.transportProvided ? '#4F46E5' : Colors.textMuted}>
                    {job.transportProvided ? 'Pickup available' : 'Not included'}
                  </Text>
                </View>
              </View>
            </FadeSlide>

            {/* ─── Requirements ─── */}
            <FadeSlide delay={380}>
              <Text variant="body" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                Requirements
              </Text>
              <Card padding="lg" variant="outlined" style={styles.reqCard}>
                {[
                  job.requirements,
                  `Must be available on ${job.date}`,
                  'Punctual and reliable',
                  `Report at least 15 min before ${job.timing.split(' - ')[0]}`,
                ].map((req, i) => (
                  <View key={i} style={styles.reqRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <Text variant="bodySm" color="#334155" style={styles.reqText}>
                      {req}
                    </Text>
                  </View>
                ))}
              </Card>
            </FadeSlide>

            {/* ─── Tips ─── */}
            <FadeSlide delay={440}>
              <Card padding="lg" style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
                  <Text variant="body" weight="bold" color="#0F172A">
                    Quick Tips
                  </Text>
                </View>
                {[
                  'Apply early — slots fill fast',
                  'Keep your phone charged for OTP verification',
                  'Dress code info will be shared after approval',
                ].map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text variant="caption" weight="bold" color={Colors.primary}>{i + 1}.</Text>
                    <Text variant="bodySm" color={Colors.textSecondary} style={styles.tipText}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </Card>
            </FadeSlide>

            {/* ─── Similar Jobs ─── */}
            {similarJobs.length > 0 && (
              <FadeSlide delay={500}>
                <Text variant="body" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                  Similar Jobs
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.similarScroll}
                >
                  {similarJobs.map((sj) => (
                    <TouchableOpacity
                      key={sj.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({ pathname: '/(worker)/job-detail', params: { jobId: sj.id } })
                      }
                      style={styles.similarCard}
                    >
                      <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>
                        {sj.title}
                      </Text>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {sj.location}  ·  {sj.salary}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </FadeSlide>
            )}

            {/* Bottom spacer */}
            <View style={{ height: 110 }} />
          </View>
        </ScrollView>

        {/* ─── Fixed Bottom Bar ─── */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            <Text variant="caption" color={Colors.textMuted}>You'll earn</Text>
            <Text variant="h3" weight="bold" color={Colors.primary}>
              {job.salary}
            </Text>
          </View>
          <Button
            title={hasApplied ? 'Applied' : slotsLeft > 0 ? 'Apply Now' : 'Join Waitlist'}
            size="lg"
            variant={hasApplied ? 'ghost' : 'primary'}
            disabled={hasApplied}
            icon={hasApplied ? <Ionicons name="checkmark" size={16} color={Colors.text} /> : undefined}
            onPress={() => {
              apply(job.id);
              setShowApplied(true);
            }}
            style={styles.applyBtn}
          />
        </View>

        {/* ─── Applied Success Popup ─── */}
        <Modal
          visible={showApplied}
          transparent
          statusBarTranslucent
          animationType="none"
          onRequestClose={hideAppliedPopup}
        >
          <Animated.View style={[styles.popupOverlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[styles.popupCard, { transform: [{ scale: cardScale }] }]}>
              <View style={styles.popupCheck}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </View>
              <Text variant="h3" weight="bold" color="#0F172A" style={styles.popupTitle}>
                Application Sent!
              </Text>
              <Text variant="bodySm" color={Colors.textSecondary} align="center" style={styles.popupText}>
                Your application for “{job.title}” has been submitted to {job.employerName}. They may call you soon!
              </Text>
              <Button
                title="View My Applications"
                size="md"
                fullWidth
                onPress={openApplications}
                style={styles.popupBtn}
              />
              <TouchableOpacity onPress={hideAppliedPopup} hitSlop={8} activeOpacity={0.6}>
                <Text variant="bodySm" weight="bold" color={Colors.textSecondary}>
                  Close
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  topBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  appliedBannerText: {
    flex: 1,
    marginLeft: 2,
  },
  appliedBannerLink: {
    textDecorationLine: 'underline',
  },
  scroll: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  notFoundTitle: {
    marginTop: Spacing.sm,
  },

  /* Header */
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  categoryChipText: {
    marginLeft: 4,
  },
  jobTitle: {
    marginBottom: Spacing.xs,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerMetaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerMetaText: {
    marginLeft: 2,
  },
  headerMetaLocation: {
    flex: 1,
  },
  headerMetaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  /* Body */
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* Salary + Rating */
  salaryRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  salaryBlock: {
    flex: 1,
  },
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    gap: 6,
  },

  /* Employer */
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  employerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employerInfo: {
    flex: 1,
    gap: 2,
  },
  employerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  /* Tiles */
  tilesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tile: {
    flex: 1,
    minHeight: 104,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  /* Slots */
  slotsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  /* Amenities */
  amenitiesRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  amenityCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },

  /* Requirements */
  reqCard: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reqText: {
    flex: 1,
    lineHeight: 20,
  },

  /* Tips */
  tipsCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
  },

  /* Similar Jobs */
  similarScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  similarCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: 200,
    gap: 4,
  },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Shadows.md,
  },
  bottomLeft: {
    marginRight: Spacing.md,
  },
  applyBtn: {
    flex: 1,
  },

  /* Applied Popup */
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  popupCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  popupCheck: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  popupTitle: {
    marginTop: Spacing.xs,
  },
  popupText: {
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  popupBtn: {
    marginTop: Spacing.xs,
  },
});
