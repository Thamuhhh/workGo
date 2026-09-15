import React, { useRef, useState } from 'react';
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
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Badge } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';

import { FadeSlide, ScalePress } from '../../src/components/AppHeader';
import { BannerCarousel, Banner as HomeBanner } from '../../src/components/BannerCarousel';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';
import { useApplicationsStore } from '../../src/store/applicationsStore';
import { useMessagesStore } from '../../src/store/messagesStore';
import { useLocationStore } from '../../src/store/locationStore';

interface ServiceCategory {
  id: string;
  name: string;
  image?: any;
  isOthers?: boolean;
}

const GREETING_MSG = (() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Vanakkam';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
})();

const SERVICES: ServiceCategory[] = [
  {
    id: 'promoter',
    name: 'Promoter',
    image: require('../../assets/Promoter.png'),
  },
  {
    id: 'catering',
    name: 'Catering',
    image: require('../../assets/Catter.png'),
  },
  {
    id: 'mc_anchor',
    name: 'MC/Anchor',
    image: require('../../assets/MC.png'),
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    image: require('../../assets/Cleaner.png'),
  },
  {
    id: 'coordinator',
    name: 'Event Coordinator',
    image: require('../../assets/Coordinator.png'),
  },
  {
    id: 'others',
    name: 'Others',
    image: require('../../assets/Others.png'),
  },
];

const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'firstjob',
    title: 'Post Your First Job',
    subtitle: 'Tell workers what you need and get applicants in minutes.',
    cta: 'Post a job',
    icon: 'add-circle-outline',
    onPress: () => router.push('/(employer)/post-job'),
  },
  {
    id: 'weekend',
    title: 'Hiring for this weekend?',
    subtitle: 'Catering staff, cleaners and MCs are active nearby right now.',
    cta: 'Manage jobs',
    icon: 'calendar-outline',
    onPress: () => router.push('/(employer)/jobs'),
  },
  {
    id: 'shortlist',
    title: 'Review applicants faster',
    subtitle: 'Shortlist, call or message your shortlisted workers.',
    cta: 'View bookings',
    icon: 'people-outline',
    onPress: () => router.push('/(employer)/bookings'),
  },
];

export default function EmployerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { toggleMode } = useUserModeStore();
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'messages'>('home');
  const applications = useApplicationsStore((s) => s.applications);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const unreadCount = applications.filter((a) => !readThreadIds.includes(a.jobId)).length;
  const locationLabel = useLocationStore((s) => s.label);
  const locationAddress = useLocationStore((s) => s.address);
  const businessName = user?.businessName || user?.name || 'there';
  const businessFirstName = businessName.split(' ')[0];

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [20, 10], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });
  const taglineOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [1, 0], extrapolate: 'clamp' });
  const taglineHeight = scrollY.interpolate({ inputRange: [0, 48], outputRange: [16, 0], extrapolate: 'clamp' });
  const comboMargin = scrollY.interpolate({ inputRange: [0, 64], outputRange: [Spacing.md, 4], extrapolate: 'clamp' });
  const comboScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.97], extrapolate: 'clamp' });

  const handleSelectService = () => {
    router.push({
      pathname: '/(employer)/post-job',
    });
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(worker)/(tabs)/home');
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
              colors={['#FFFFFF', '#FFFFFF', '#F5F9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Animated.View style={[styles.headerTopRow, { transform: [{ scale: brandScale }] }]}>
                <View style={styles.brandCol}>
                  <Text variant="h2" weight="heavy" color="#0F172A" style={styles.brandTitle}>
                    Gig<Text variant="h2" weight="heavy" color="#0277F4">ro</Text>
                  </Text>
                  <Animated.View style={{ height: taglineHeight, opacity: taglineOpacity }}>
                    <Text variant="caption" weight="medium" color="#64748B" style={styles.brandTagline}>
                      {GREETING_MSG}, <Text variant="caption" weight="bold" color="#0277F4">{businessFirstName}</Text>!
                    </Text>
                  </Animated.View>
                </View>

                <View style={styles.headerActions}>
                  <View>
                    <ScalePress
                      onPress={() => router.push('/(employer)/bookings')}
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
                    <Ionicons name="location-outline" size={16} color="#0277F4" />
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
                  <Ionicons name="search-outline" size={16} color="#0277F4" />
                  <Text variant="body" color={Colors.textMuted} numberOfLines={1} style={styles.comboSearchText}>
                    Search for services...
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
            <BannerCarousel banners={HOME_BANNERS} />
          </FadeSlide>

          {/* Select Your Services Grid */}
          <FadeSlide delay={120}>
            <View style={styles.sectionContainer}>
              <Text variant="h3" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                Select Your Services
              </Text>

              <View style={styles.servicesGrid}>
                {SERVICES.map((service) => {
                  return (
                    <ScalePress
                      key={service.id}
                      scaleTo={0.92}
                      onPress={handleSelectService}
                      style={styles.serviceItem}
                    >
                      <View style={styles.serviceItemInner}>
                        <View style={styles.serviceIconCard}>
                        {!service.image ? (
                          <LinearGradient
                            colors={['#A855F7', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.othersIconCircle}
                          >
                            <Text style={styles.othersDots}>•••</Text>
                          </LinearGradient>
                        ) : (
                          <ExpoImage
                            source={service.image}
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
                        {service.name}
                      </Text>
                      </View>
                    </ScalePress>
                  );
                })}
              </View>
            </View>
          </FadeSlide>

          {/* Hiring Stat Strip */}
          <FadeSlide delay={280}>
            <LinearGradient
              colors={['#0EA5E9', '#0277F4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  3
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Active jobs
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  12
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Workers hired
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  4
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Pending reviews
                </Text>
              </View>
            </LinearGradient>
          </FadeSlide>

          {/* Quick Post CTA */}
          <FadeSlide delay={380}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(employer)/post-job')}>
              <LinearGradient
                colors={['#012169', '#0277F4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postCta}
              >
                <View style={styles.postCtaIconWrap}>
                  <Ionicons name="add" size={26} color="#FFFFFF" weight="bold" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold" color="#FFFFFF">
                    Post a New Job
                  </Text>
                  <Text variant="caption" color="#BFDBFE">
                    Get workers applied within minutes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </FadeSlide>

          {/* Active Jobs Summary */}
          <FadeSlide delay={440}>
            <View style={styles.sectionContainer}>
              <View style={styles.activeSummaryHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Active Jobs
                </Text>
                <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
                  <Text variant="caption" weight="bold" color="#0277F4">
                    View All →
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(employer)/jobs')}
                style={styles.miniJobCard}
              >
                <View style={styles.miniJobTop}>
                  <Text variant="body" weight="bold" color="#0F172A">
                    Wedding Catering Staff
                  </Text>
                  <Badge label="12 / 15 Hired" variant="success" size="sm" />
                </View>
                <Text variant="caption" color="#64748B" style={styles.miniJobDetails}>
                  Kanchipuram • Tomorrow, 6:00 AM - 4:00 PM • ₹900/day
                </Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <ScalePress
            style={styles.navTab}
            scaleTo={0.9}
            activeOpacity={0.7}
            onPress={() => setActiveTab('home')}
          >
            <View style={styles.navTabInner}>
              <View style={[styles.navIconPill, activeTab === 'home' && styles.navIconPillActive]}>
                <Ionicons
                  name={activeTab === 'home' ? 'home' : 'home-outline'}
                  size={20}
                  color={activeTab === 'home' ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
              <Text
                variant="caption"
                weight={activeTab === 'home' ? 'bold' : 'regular'}
                color={activeTab === 'home' ? Colors.primaryDark : '#94A3B8'}
                style={styles.navLabel}
              >
                Home
              </Text>
            </View>
          </ScalePress>

          <ScalePress
            style={styles.navTab}
            scaleTo={0.9}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('activity');
              router.push('/(employer)/jobs');
            }}
          >
            <View style={styles.navTabInner}>
              <View style={[styles.navIconPill, activeTab === 'activity' && styles.navIconPillActive]}>
                <Ionicons
                  name={activeTab === 'activity' ? 'document-text' : 'document-text-outline'}
                  size={20}
                  color={activeTab === 'activity' ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
              <Text
                variant="caption"
                weight={activeTab === 'activity' ? 'bold' : 'regular'}
                color={activeTab === 'activity' ? Colors.primaryDark : '#94A3B8'}
                style={styles.navLabel}
              >
                Activity
              </Text>
            </View>
          </ScalePress>

          <ScalePress
            style={styles.navTab}
            scaleTo={0.9}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('messages');
              router.push('/(employer)/bookings');
            }}
          >
            <View style={styles.navTabInner}>
              <View style={[styles.navIconPill, activeTab === 'messages' && styles.navIconPillActive]}>
                <Ionicons
                  name={activeTab === 'messages' ? 'chatbubble' : 'chatbubble-outline'}
                  size={20}
                  color={activeTab === 'messages' ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
              <Text
                variant="caption"
                weight={activeTab === 'messages' ? 'bold' : 'regular'}
                color={activeTab === 'messages' ? Colors.primaryDark : '#94A3B8'}
                style={styles.navLabel}
              >
                Messages
              </Text>
            </View>
          </ScalePress>
        </View>
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
    shadowColor: '#1E3A8A',
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
    backgroundColor: '#E3F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
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
    shadowColor: '#9333EA',
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
  postCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  postCtaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  miniJobCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
  },
  miniJobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniJobDetails: {
    lineHeight: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navTabInner: {
    alignItems: 'center',
  },
  navIconPill: {
    width: 40,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  navIconPillActive: {
    backgroundColor: '#0277F4',
    shadowColor: '#0255C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 3,
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});