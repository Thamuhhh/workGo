import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Badge } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import AppHeader, { FadeSlide, ScalePress } from '../../src/components/AppHeader';
import SearchBar from '../../src/components/SearchBar';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

interface ServiceCategory {
  id: string;
  name: string;
  image?: any;
  isOthers?: boolean;
}

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

export default function EmployerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { toggleMode } = useUserModeStore();
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'messages'>('home');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const heroZoom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroZoom, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heroZoom]);

  const heroScale = heroZoom.interpolate({ inputRange: [0, 1], outputRange: [1.14, 1] });
  const heroOpacity = heroZoom.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const handleSelectService = (id: string) => {
    setSelectedService(id);
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Illustrated Banner with overlaid top nav */}
          <View style={styles.heroContainer}>
            <View style={styles.heroImageWrap}>
              <AnimatedImage
                source={require('../../assets/hero_banner.jpg')}
                style={[styles.heroImage, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}
                contentFit="cover"
                transition={150}
              />
            </View>

            {/* Top scrim so the overlaid logo stays readable */}
            <LinearGradient
              colors={['rgba(255,247,237,0.95)', 'rgba(255,247,237,0.0)']}
              style={styles.heroTopScrim}
            />

            {/* Overlaid Top Nav */}
            <View style={styles.headerOverlay}>
              <AppHeader
                onProfilePress={() => router.push('/(employer)/profile')}
                userInitial={(user?.businessName || user?.name || 'U').charAt(0).toUpperCase()}
              />
            </View>

            {/* Soft bottom fade overlay — blends hero into the background */}
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', '#FFFFFF']}
              locations={[0, 0.6, 1]}
              style={styles.heroGradientOverlay}
            />

            {/* Floating Search Bar */}
            <View style={styles.floatingSearchWrapper}>
              <SearchBar
                placeholder="Find Services, Promoter, Catering..."
                onPress={() => router.push('/search')}
              />
            </View>
          </View>

          {/* Spacer to account for floating search bar overlap */}
          <View style={styles.searchSpacer} />

          {/* Select Your Services Grid */}
          <FadeSlide delay={120}>
            <View style={styles.sectionContainer}>
              <Text variant="h3" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                Select Your Services
              </Text>

              <View style={styles.servicesGrid}>
                {SERVICES.map((service) => {
                  const isSelected = selectedService === service.id;
                  return (
                    <ScalePress
                      key={service.id}
                      scaleTo={0.92}
                      onPress={() => handleSelectService(service.id)}
                      style={styles.serviceItem}
                    >
                      <View style={styles.serviceItemInner}>
                        <View
                          style={[
                            styles.serviceIconCard,
                            isSelected && styles.serviceIconCardSelected,
                          ]}
                        >
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
                          {isSelected ? (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                            </View>
                          ) : null}
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

          {/* Ad Banner */}
          <FadeSlide delay={200}>
            <View style={styles.promoSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(employer)/jobs')}
              >
                <ExpoImage
                  source={require('../../assets/ad_banner.jpg')}
                  style={styles.adBannerImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Quick Active Bookings / Posted Jobs Summary */}
          <FadeSlide delay={280}>
            <View style={styles.activeSummarySection}>
              <View style={styles.activeSummaryHeader}>
                <Text variant="body" weight="bold" color="#0F172A">
                  Active Job Status
                </Text>
                <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
                  <Text variant="caption" weight="bold" color="#0F172A">
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
    paddingBottom: 90,
  },
  heroContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    overflow: 'visible',
  },
  heroImageWrap: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    zIndex: 10,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  floatingSearchWrapper: {
    position: 'absolute',
    bottom: -26,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  searchSpacer: {
    height: 38,
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  serviceIconCardSelected: {
    backgroundColor: '#EFF6FF',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  promoSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  adBannerImage: {
    width: '100%',
    aspectRatio: 1080 / 450,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0277F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#E2E8F0',
  },
  activeSummarySection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
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
