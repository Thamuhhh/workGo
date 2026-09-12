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
import { Icon as Ionicons } from '../../src/components/Icon';
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

const PARTICLE_COUNT = 12;

export default function JobDetailScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const applications = useApplicationsStore((s) => s.applications);
  const apply = useApplicationsStore((s) => s.apply);
  const [showApplied, setShowApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.35)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const checkPop = useRef(new Animated.Value(0)).current;
  const checkSpin = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.45)).current;
  const particles = useRef(Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0))).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, [params.jobId]);

  useEffect(() => {
    if (!showApplied) return;
    overlayOpacity.setValue(0);
    bubbleScale.setValue(0.35);
    ringScale.setValue(0);
    ripple2.setValue(0);
    checkPop.setValue(0);
    checkSpin.setValue(0);
    contentSlide.setValue(0);
    particles.forEach((p) => p.setValue(0));

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 1,
        duration: 640,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(ripple2, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(bubbleScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.stagger(
        40,
        particles.map((p) =>
          Animated.timing(p, {
            toValue: 1,
            duration: 620,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    const t1 = setTimeout(() => {
      Animated.spring(checkPop, {
        toValue: 1,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }).start();
      Animated.spring(checkSpin, {
        toValue: 1,
        friction: 5,
        tension: 240,
        useNativeDriver: true,
      }).start();
    }, 320);
    const t2 = setTimeout(() => {
      Animated.timing(contentSlide, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 470);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showApplied, overlayOpacity, bubbleScale, ringScale, ripple2, checkPop, checkSpin, contentSlide, particles]);

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

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Job Details', headerShown: false }} />
        <View style={styles.screen}>
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <Animated.View style={[styles.skelCircle, { opacity: pulse }]} />
            <Animated.View style={[styles.skel, styles.skelTitleBar, { opacity: pulse }]} />
          </SafeAreaView>
          <View style={styles.skelBody}>
            <Animated.View style={{ opacity: pulse }}>
              <View style={[styles.skel, styles.skelChip]} />
              <View style={[styles.skel, styles.skelBig]} />
              <View style={[styles.skel, styles.skelMed]} />
            </Animated.View>
            <Animated.View style={[styles.skel, styles.skelSalary, { opacity: pulse }]} />
            <Animated.View style={[styles.skel, styles.skelCard, { opacity: pulse }]} />
            <Animated.View style={[styles.skelRow, { opacity: pulse }]}>
              <View style={[styles.skel, styles.skelTile]} />
              <View style={[styles.skel, styles.skelTile]} />
              <View style={[styles.skel, styles.skelTile]} />
            </Animated.View>
            <Animated.View style={[styles.skel, styles.skelCard, { opacity: pulse }]} />
            <Animated.View style={[styles.skel, styles.skelCard, { opacity: pulse }]} />
          </View>
        </View>
      </>
    );
  }

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
                  color="#0F172A"
                />
                <Text variant="caption" weight="semibold" color="#0F172A" style={styles.categoryChipText}>
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
                  <Text variant="h2" weight="heavy" color="#0F172A">
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
                  <Ionicons name="calendar-outline" size={18} color="#0F172A" />
                  <Text variant="caption" color={Colors.textMuted}>Date</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{job.date}</Text>
                </View>
                <View style={[styles.tile, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="time-outline" size={18} color="#0F172A" />
                  <Text variant="caption" color={Colors.textMuted}>Timing</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{startTime}</Text>
                  <Text variant="caption" color="#52525B" numberOfLines={1}>{endTime ? `till ${endTime}` : '—'}</Text>
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
                  <Ionicons name="people-outline" size={18} color="#0F172A" />
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
                    <Text variant="bodySm" color="#0F172A" style={styles.reqText}>
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
                  <Ionicons name="bulb-outline" size={18} color="#0F172A" />
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
                    <Text variant="caption" weight="bold" color="#0F172A">{i + 1}.</Text>
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
            <Text variant="h3" weight="bold" color="#0F172A">
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
            <Animated.View style={[styles.popupCard, { transform: [{ scale: bubbleScale }] }]}>
              <Animated.View
                style={[
                  styles.popupCheck,
                  {
                    transform: [
                      { scale: checkPop },
                      { rotate: checkSpin.interpolate({ inputRange: [0, 1], outputRange: ['-140deg', '0deg'] }) },
                    ],
                  },
                ]}
              >
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: contentSlide,
                  transform: [
                    { translateY: contentSlide.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                  ],
                }}
              >
                <Text variant="h3" weight="bold" color="#0F172A" align="center" style={styles.popupTitle}>
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
                <TouchableOpacity onPress={hideAppliedPopup} hitSlop={8} activeOpacity={0.6} style={styles.popupCloseWrap}>
                  <Text variant="bodySm" weight="bold" color={Colors.textSecondary} align="center">
                    Close
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Rays + ripples ON TOP of card */}
            <View style={styles.razorCenter} pointerEvents="none">
              <Animated.View
                style={[
                  styles.razorRing,
                  {
                    opacity: ringScale.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.65, 0] }),
                    transform: [
                      { scale: ringScale.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.2] }) },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.razorRing,
                  styles.razorRingGreen,
                  {
                    opacity: ripple2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.55, 0] }),
                    transform: [
                      { scale: ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) },
                    ],
                  },
                ]}
              />
              {particles.map((p, i) => {
                const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
                const radius = 62 + (i % 3) * 36;
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.razorRay,
                      {
                        backgroundColor: i % 3 === 0 ? '#34D399' : i % 3 === 1 ? '#7EB8FF' : '#FFFFFF',
                        opacity: p.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 1, 0] }),
                        transform: [
                          { rotate: `${(angle * 180) / Math.PI}deg` },
                          {
                            translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, radius] }),
                          },
                          {
                            scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
                          },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </View>
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
  razorCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  razorRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  razorRingGreen: {
    borderColor: '#34D399',
    borderWidth: 2,
  },
  razorRay: {
    position: 'absolute',
    width: 3.5,
    height: 18,
    borderRadius: 2,
    marginTop: -9,
    marginLeft: -1.75,
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
  popupCloseWrap: {
    width: '100%',
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
  },
/* Skeleton */
  skelCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  skelTitleBar: {
    width: 120,
    height: 18,
    marginLeft: Spacing.sm,
    borderRadius: 6,
  },
  skelBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  skel: {
    backgroundColor: '#E2E8F0',
  },
  skelChip: {
    width: 90,
    height: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  skelBig: {
    width: '72%',
    height: 26,
    borderRadius: 8,
    marginBottom: 8,
  },
  skelMed: {
    width: '52%',
    height: 14,
    borderRadius: 6,
  },
  skelSalary: {
    width: '100%',
    height: 74,
    borderRadius: BorderRadius.lg,
  },
  skelCard: {
    width: '100%',
    height: 92,
    borderRadius: BorderRadius.lg,
  },
  skelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skelTile: {
    flex: 1,
    height: 104,
    borderRadius: BorderRadius.lg,
  },
});
