import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';

import { FadeSlide, ScalePress } from '../../../src/components/AppHeader';
import { BannerCarousel, Banner as HomeBanner } from '../../../src/components/BannerCarousel';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useWalletStore } from '../../../src/store/walletStore';
import { useMessagesStore } from '../../../src/store/messagesStore';
import { useUserModeStore } from '../../../src/store/userModeStore';
import { useLocationStore } from '../../../src/store/locationStore';
import { useJobsStore, areaJobCount, WorkerJob } from '../../../src/store/jobsStore';

interface ServiceCategory {
  id: string;
  name: string;
  image?: any;
  isOthers?: boolean;
}

const DAY_OF_YEAR = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
);
const GREETING_MSG = (() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Vanakkam';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
})();

const CATEGORIES: ServiceCategory[] = [
  {
    id: 'promoter',
    name: 'Promoter',
    image: require('../../../assets/Promoter.png'),
  },
  {
    id: 'catering',
    name: 'Catering',
    image: require('../../../assets/Catering.png'),
  },
  {
    id: 'mc_anchor',
    name: 'MC/Anchor',
    image: require('../../../assets/MC.png'),
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    image: require('../../../assets/Cleaner.png'),
  },
  {
    id: 'coordinator',
    name: 'Event Coordinator',
    image: require('../../../assets/Coordinator.png'),
  },
  {
    id: 'others',
    name: 'Others',
    image: require('../../../assets/Others.png'),
  },
];

const WORK_STEPS = [
  { icon: 'search-outline', title: 'Find jobs', desc: 'Browse gigs near you by category or area' },
  { icon: 'paper-plane-outline', title: 'Apply in a tap', desc: 'Employers see your profile instantly' },
  { icon: 'wallet-outline', title: 'Earn same day', desc: 'Get paid to your wallet after every gig' },
];

const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'weekend',
    title: 'Weekend Gig Surge',
    subtitle: 'Catering, events & retail are hiring big this weekend.',
    cta: 'See weekend jobs',
    icon: 'calendar-outline',
    onPress: () => router.push('/(worker)/jobs'),
  },
  {
    id: 'bonus',
    title: 'First Job Bonus',
    subtitle: 'Earn an extra ₹100 on top of your first gig.',
    cta: 'Learn how',
    icon: 'ticket-outline',
    onPress: () => router.push('/(worker)/jobs'),
  },
  {
    id: 'highpay',
    title: 'Highest Pay This Week',
    subtitle: 'Catering staff at ₹1,200/day is trending nearby.',
    cta: 'Browse now',
    icon: 'arrow-up-right',
    onPress: () => router.push('/(worker)/jobs'),
  },
];

function SectionHead({ children }: { children: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
        {children.toUpperCase()}
      </Text>
      <View style={styles.headRule} />
    </View>
  );
}

export default function WorkerHomeScreen() {
  const { toggleMode } = useUserModeStore();
  const userName = useAuthStore((s) => s.user?.name);
  const firstName = userName?.split(' ')[0] || 'there';
  const applications = useApplicationsStore((s) => s.applications);
  const unreadCount = useMessagesStore((s) =>
    Object.values(s.threadMeta).reduce((n, t) => n + (t.unread > 0 ? 1 : 0), 0)
  );
  const locationLabel = useLocationStore((s) => s.label);
  const locationAddress = useLocationStore((s) => s.address);
  const liveJobs = useJobsStore((s) => s.jobs);
  const loadJobs = useJobsStore((s) => s.loadJobs);
  const jobsNearby =
    locationLabel.toLowerCase() === 'current location'
      ? liveJobs.length
      : areaJobCount(liveJobs, locationLabel, locationAddress);
  const highestPay = liveJobs.length ? Math.max(...liveJobs.map((j) => j.salaryNum)) : 0;
  const totalEarned = useWalletStore((s) => s.totalEarned);
  const completedGigs = applications.filter((a) => a.status === 'COMPLETED').length;
  const avgDaily = completedGigs > 0 ? Math.round(totalEarned / completedGigs) : 0;

  useEffect(() => {
    loadJobs().catch(() => {});
  }, [loadJobs]);

  const topJob = liveJobs.reduce<WorkerJob | null>(
    (best, j) => (!best || j.salaryNum > best.salaryNum ? j : best),
    null
  );
  const homeBanners: HomeBanner[] = HOME_BANNERS.map((b) =>
    b.id === 'highpay'
      ? {
          ...b,
          subtitle: topJob
            ? `${topJob.category} roles paying up to ₹${topJob.salaryNum.toLocaleString('en-IN')}/day right now`
            : 'High-paying gigs land here daily',
        }
      : b
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [20, 10], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });
  const taglineOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [1, 0], extrapolate: 'clamp' });
  const taglineHeight = scrollY.interpolate({ inputRange: [0, 48], outputRange: [16, 0], extrapolate: 'clamp' });
  const comboMargin = scrollY.interpolate({ inputRange: [0, 64], outputRange: [Spacing.md, 4], extrapolate: 'clamp' });
  const comboScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.97], extrapolate: 'clamp' });

  const handleCategoryPress = (cat: ServiceCategory) => {
    router.push({
      pathname: '/(worker)/category-jobs',
      params: { category: cat.name },
    });
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(employer)/(tabs)/home');
  };

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
          {/* Sticky animated header — stays on top while scrolling */}
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
                      {GREETING_MSG}, <Text variant="caption" weight="bold" color="#0F172A">{firstName}</Text>!
                    </Text>
                  </Animated.View>
                </View>

                <View style={styles.headerActions}>
                  <View>
                    <ScalePress
                      onPress={() => router.push('/(worker)/applications')}
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
                </View>
              </Animated.View>

              {/* Combined Location + Search */}
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
                    </Text>
                    {locationAddress && locationLabel !== locationAddress && (
                      <Text variant="caption" color="#64748B" numberOfLines={1}>
                        {locationAddress}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.comboDivider} />

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.comboSearchZone}
                  onPress={() => router.push('/search')}
                >
                  <Ionicons name="search-outline" size={16} color="#0F172A" />
                  <Text variant="body" color={Colors.textMuted} numberOfLines={1} style={styles.comboSearchText}>
                    Search for jobs...
                  </Text>
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

          {/* Promo Banner Carousel */}
          <FadeSlide delay={80}>
            <BannerCarousel banners={homeBanners} />
          </FadeSlide>

          {/* Select Your Services Category Grid */}
          <FadeSlide delay={120}>
            <View style={styles.sectionContainer}>
              <SectionHead>Categories</SectionHead>

              <View style={styles.servicesGrid}>
{CATEGORIES.map((cat) => {
                  return (
                    <ScalePress
                      key={cat.id}
                      scaleTo={0.92}
                      onPress={() => handleCategoryPress(cat)}
                      style={styles.serviceItem}
                    >
                      <View style={styles.serviceItemInner}>
                        <View style={styles.serviceIconCard}>
                        {!cat.image ? (
                          <LinearGradient
                            colors={['#334155', '#0F172A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.othersIconCircle}
                          >
                            <Text style={styles.othersDots}>•••</Text>
                          </LinearGradient>
                        ) : (
                          <ExpoImage
                            source={cat.image}
                            style={styles.serviceImage}
                            contentFit="contain"
                          />
                        )}
                      </View>
                      <Text
                        variant="bodySm"
                        weight="medium"
                        align="center"
                        color="#0F172A"
                        numberOfLines={2}
                        style={styles.serviceLabel}
                      >
                        {cat.name}
                      </Text>
                      </View>
                    </ScalePress>
                  );
                })}
              </View>
            </View>
          </FadeSlide>

          {/* Earnings Stat Strip */}
          <FadeSlide delay={280}>
            <LinearGradient
              colors={['#334155', '#0F172A', '#020617']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.55, 1]}
              style={styles.statsCard}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
                style={styles.statsSheen}
              />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  {jobsNearby}
                </Text>
                <Text variant="caption" weight="medium" color="#94A3B8">
                  Jobs nearby you
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  {highestPay > 0 ? `₹${highestPay.toLocaleString('en-IN')}` : '—'}
                </Text>
                <Text variant="caption" weight="medium" color="#94A3B8">
                  Highest pay today
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  {avgDaily > 0 ? `₹${avgDaily.toLocaleString('en-IN')}` : '—'}
                </Text>
                <Text variant="caption" weight="medium" color="#94A3B8">
                  Avg. daily earning
                </Text>
              </View>
            </LinearGradient>
          </FadeSlide>

          {/* How It Works */}
          <FadeSlide delay={380}>
            <View style={styles.sectionContainer}>
              <SectionHead>How it works</SectionHead>
              <View style={styles.stepsRow}>
                {WORK_STEPS.map((step, i) => (
                  <View key={step.title} style={styles.stepItem}>
                    <View style={styles.stepIconWrap}>
                      <Ionicons name={step.icon} size={18} color="#0F172A" />
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{i + 1}</Text>
                      </View>
                    </View>
                    <Text variant="bodySm" weight="bold" color="#0F172A" style={styles.stepTitle}>
                      {step.title}
                    </Text>
                    <Text variant="caption" color="#64748B" align="center" style={styles.stepDesc}>
                      {step.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeSlide>

          {/* Brand Footer */}
          <FadeSlide delay={520}>
            <View style={styles.landingFooter}>
              <Text variant="caption" weight="bold" color="#64748B" style={styles.landingFooterTagline}>
                For India. For gig workers.
              </Text>
              <Text variant="caption" color="#94A3B8" style={styles.landingFooterMeta}>
                Find work nearby · Earn daily · Grow steady
              </Text>
              <View style={styles.landingFooterDivider} />
              <View style={styles.landingFooterMetaRow}>
                <Text variant="caption" color="#CBD5E1">
                  Created in{" "}
                </Text>
                <Ionicons name="heart" size={11} color="#F87171" />
                <Text variant="caption" color="#CBD5E1">
                  {" "}Tamilnadu
                </Text>
              </View>
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
    paddingBottom: 16,
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
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    flexShrink: 1,
    maxWidth: '60%',
    minWidth: 0,
  },
  comboLocationLabel: {
    flexShrink: 1,
    minWidth: 0,
  },
  comboDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EDF2F7',
    marginRight: Spacing.sm,
  },
  comboSearchZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  comboSearchText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  locationIconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  sectionHead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF2F7',
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    marginBottom: Spacing.lg,
    letterSpacing: -0.3,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  serviceItemInner: {
    alignItems: 'center',
  },
  serviceIconCard: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  othersIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  othersDots: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: -2,
  },
  serviceLabel: {
    marginTop: Spacing.xs,
    fontSize: 12,
    lineHeight: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  statsSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  stepIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  stepTitle: {
    textAlign: 'center',
    minHeight: 34,
    marginBottom: 2,
  },
  stepDesc: {
    textAlign: 'center',
    lineHeight: 15,
    minHeight: 30,
  },
  landingFooter: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: Spacing.xl,
  },
  landingFooterTagline: {
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  landingFooterMeta: {
    marginBottom: Spacing.md,
  },
  landingFooterDivider: {
    alignSelf: 'center',
    width: 40,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  landingFooterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
