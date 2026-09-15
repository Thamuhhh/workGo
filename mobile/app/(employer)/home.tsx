import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Badge } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { ScalePress, FadeSlide } from '../../src/components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';
import { useApplicationsStore } from '../../src/store/applicationsStore';
import { useMessagesStore } from '../../src/store/messagesStore';

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
  status: 'NEW' | 'SHORTLISTED' | 'HIRED';
}

const REVIEW_APPLICANTS: Applicant[] = [
  { id: 'a1', name: 'Murugan S', service: 'Catering Staff', area: 'Kanchipuram', status: 'NEW' },
  { id: 'a2', name: 'Priya R', service: 'Event Coordinator', area: 'Chengalpattu', status: 'NEW' },
  { id: 'a3', name: 'Karthik V', service: 'MC/Anchor', area: 'Chennai', status: 'SHORTLISTED' },
];

interface PostedJob {
  id: string;
  title: string;
  service: string;
  status: 'OPEN' | 'FILLING' | 'CLOSED';
  hired: number;
  needed: number;
  pay: string;
  date: string;
}

const ACTIVE_JOBS: PostedJob[] = [
  {
    id: 'j1',
    title: 'Wedding Catering Staff',
    service: 'Catering',
    status: 'OPEN',
    hired: 12,
    needed: 15,
    pay: '₹900/day',
    date: 'Tomorrow, 6 AM - 4 PM',
  },
  {
    id: 'j2',
    title: 'Product Launch Promoters',
    service: 'Promoter',
    status: 'FILLING',
    hired: 8,
    needed: 10,
    pay: '₹1,100/day',
    date: 'Sat, 9 AM - 6 PM',
  },
];

export default function EmployerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { toggleMode } = useUserModeStore();
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'messages'>('home');
  const applications = useApplicationsStore((s) => s.applications);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const unreadCount = applications.filter((a) => !readThreadIds.includes(a.jobId)).length;
  const businessName = user?.businessName || user?.name || 'there';
  const businessFirstName = businessName.split(' ')[0];

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 8], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });

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
          {/* Sticky header */}
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
                  <Text variant="caption" weight="medium" color="#64748B" style={styles.brandTagline}>
                    {GREETING_MSG}, <Text variant="caption" weight="bold" color="#0277F4">{businessFirstName}</Text>!
                  </Text>
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
                colors={['#012169', '#0277F4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCta}
              >
                <View style={styles.heroCtaIconWrap}>
                  <Ionicons name="add" size={28} color="#FFFFFF" weight="bold" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="h3" weight="bold" color="#FFFFFF">
                    Post a New Job
                  </Text>
                  <Text variant="caption" color="#BFDBFE">
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
                <Text variant="h3" weight="heavy" color="#0F172A">3</Text>
                <Text variant="caption" weight="medium" color="#475569">Active Jobs</Text>
              </ScalePress>
              <ScalePress
                scaleTo={0.95}
                onPress={() => router.push('/(employer)/bookings')}
                style={styles.statCard}
              >
                <View style={styles.statIconRow}>
                  <Text variant="h3" weight="heavy" color="#0F172A">2</Text>
                  <View style={styles.statNewDot} />
                </View>
                <Text variant="caption" weight="medium" color="#475569">New Applicants</Text>
              </ScalePress>
              <ScalePress
                scaleTo={0.95}
                onPress={() => router.push('/(employer)/jobs')}
                style={styles.statCard}
              >
                <Text variant="h3" weight="heavy" color="#0F172A">12</Text>
                <Text variant="caption" weight="medium" color="#475569">Workers Hired</Text>
              </ScalePress>
            </View>
          </FadeSlide>

          {/* Applicants To Review */}
          <FadeSlide delay={240}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Applicants to Review
                </Text>
                <TouchableOpacity onPress={() => router.push('/(employer)/bookings')}>
                  <Text variant="caption" weight="bold" color="#0277F4">
                    View All →
                  </Text>
                </TouchableOpacity>
              </View>

              {REVIEW_APPLICANTS.map((applicant) => (
                <TouchableOpacity
                  key={applicant.id}
                  activeOpacity={0.85}
                  onPress={() => router.push('/(employer)/bookings')}
                  style={styles.applicantCard}
                >
                  <View style={styles.avatar}>
                    <Text variant="body" weight="bold" color="#0277F4">
                      {applicant.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.applicantNameRow}>
                      <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {applicant.name}
                      </Text>
                      <Badge
                        label={applicant.status}
                        variant={applicant.status === 'NEW' ? 'info' : applicant.status === 'SHORTLISTED' ? 'warning' : 'success'}
                        size="sm"
                      />
                    </View>
                    <Text variant="caption" color="#64748B" numberOfLines={1}>
                      {applicant.service} • {applicant.area}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
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
                  <Text variant="caption" weight="bold" color="#0277F4">
                    View All →
                  </Text>
                </TouchableOpacity>
              </View>

              {ACTIVE_JOBS.map((job) => {
                const pct = Math.min(100, Math.round((job.hired / job.needed) * 100));
                return (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(employer)/jobs')}
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
                      {job.service} • {job.date} • {job.pay}
                    </Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text variant="caption" weight="medium" color="#64748B">
                        {job.hired} / {job.needed} hired
                      </Text>
                      <Text variant="caption" weight="bold" color="#0277F4">
                        {pct}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FadeSlide>

          {/* Switch to Worker Mode */}
          <FadeSlide delay={400}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSwitchMode} style={styles.switchCard}>
              <View style={styles.switchIconWrap}>
                <Ionicons name="person-outline" size={18} color="#64748B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Switch to Worker Mode
                </Text>
                <Text variant="caption" color="#64748B">
                  Find & apply for gig work near you
                </Text>
              </View>
              <Ionicons name="swap-horizontal" size={18} color="#0277F4" />
            </TouchableOpacity>
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
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    shadowColor: '#012169',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
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
    backgroundColor: '#EAF4FF',
    borderColor: '#BFDCFF',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  applicantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF0FF',
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
    backgroundColor: '#0277F4',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  switchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
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