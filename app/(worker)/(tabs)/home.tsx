import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '../../../src/components/ui';
import AppHeader, { FadeSlide, ScalePress } from '../../../src/components/AppHeader';
import SearchBar from '../../../src/components/SearchBar';
import { Colors, Spacing, BorderRadius } from '../../../src/constants/theme';
import { SAMPLE_JOBS } from '../../../src/data/sampleJobs';
import { useAuthStore } from '../../../src/store/authStore';
import { useUserModeStore } from '../../../src/store/userModeStore';

interface ServiceCategory {
  id: string;
  name: string;
  image?: any;
  isOthers?: boolean;
}

const CATEGORIES: ServiceCategory[] = [
  {
    id: 'promoter',
    name: 'Promoter',
    image: require('../../../assets/cat_promoter.jpg'),
  },
  {
    id: 'catering',
    name: 'Catering',
    image: require('../../../assets/cat_catering.jpg'),
  },
  {
    id: 'mc_anchor',
    name: 'MC/Anchor',
    image: require('../../../assets/cat_anchor.jpg'),
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    image: require('../../../assets/cat_cleaner.jpg'),
  },
  {
    id: 'coordinator',
    name: 'Event Coordinator',
    image: require('../../../assets/cat_coordinator.jpg'),
  },
  {
    id: 'others',
    name: 'Others',
    isOthers: true,
  },
];

export default function WorkerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { toggleMode } = useUserModeStore();
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

  const handleCategoryPress = (cat: ServiceCategory) => {
    router.push({
      pathname: '/(worker)/category-jobs',
      params: { category: cat.name },
    });
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(employer)/home');
  };

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
              <Animated.Image
                source={require('../../../assets/hero_banner.jpg')}
                style={[styles.heroImage, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}
                resizeMode="cover"
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
                onProfilePress={() => router.push('/(worker)/profile')}
                userInitial={(user?.name || 'U').charAt(0).toUpperCase()}
              />
            </View>

            {/* Soft gradient fade — blends hero into the background */}
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', '#FFFFFF']}
              locations={[0, 0.6, 1]}
              style={styles.heroGradientOverlay}
            />

            {/* Floating Search Bar */}
            <View style={styles.floatingSearchWrapper}>
              <SearchBar
                placeholder="Find temporary jobs, Catering, Promoter..."
                onPress={() => router.push('/search')}
              />
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.searchSpacer} />

          {/* Select Your Services Category Grid */}
          <FadeSlide delay={120}>
            <View style={styles.sectionContainer}>
              <Text variant="h3" weight="bold" color="#334155" style={styles.sectionTitle}>
                Select Your Category
              </Text>

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
                        {cat.isOthers ? (
                          <LinearGradient
                            colors={['#A855F7', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.othersIconCircle}
                          >
                            <Text style={styles.othersDots}>•••</Text>
                          </LinearGradient>
                        ) : (
                          <Image
                            source={cat.image}
                            style={styles.serviceImage}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <Text
                        variant="bodySm"
                        weight="medium"
                        align="center"
                        color="#334155"
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

          {/* Promo Card */}
          <FadeSlide delay={200}>
            <View style={styles.promoSection}>
              <TouchableOpacity activeOpacity={0.9} style={styles.promoCard}>
                <LinearGradient
                  colors={['#1C274C', '#2B3A60', '#16203E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promoCardInner}
                >
                  <View style={styles.promoTextCol}>
                    <Text variant="body" weight="bold" color="#FFFFFF" style={styles.promoTitle}>
                      Get an Unlimited Pass
                    </Text>
                    <View style={styles.promoCodeBadge}>
                      <Text variant="bodySm" weight="bold" color={Colors.secondary}>
                        Use code NEW200
                      </Text>
                    </View>
                  </View>
                  <View style={styles.promoIconBadge}>
                    <Ionicons name="ticket-outline" size={22} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Nearby Jobs Section */}
          <FadeSlide delay={280}>
            <View style={styles.jobsHeader}>
              <Text variant="h3" weight="bold" color="#334155">
                Nearby Jobs
              </Text>
              <TouchableOpacity onPress={() => router.push('/(worker)/jobs')}>
                <Text variant="bodySm" weight="bold" color="#2B3A60">
                  View All (12) →
                </Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Job Cards */}
          <FadeSlide delay={360}>
            <View style={styles.jobsList}>
              {SAMPLE_JOBS.slice(0, 3).map((job) => (
                <Card
                  key={job.id}
                  padding="lg"
                  style={styles.jobCard}
                  onPress={() =>
                    router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                  }
                >
                  <View style={styles.jobCardTop}>
                    <View style={styles.jobTitleCol}>
                      <Text variant="h3" weight="bold" color="#0F172A">
                        {job.title}
                      </Text>
                      <Text variant="bodySm" color="#64748B" style={styles.categoryTag}>
                        {job.category} • {job.location} ({job.distance})
                      </Text>
                    </View>
                    <View style={styles.salaryBadge}>
                      <Text variant="body" weight="heavy" color={Colors.primary}>
                        {job.salary}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobMetaRow}>
                    <Text variant="bodySm" color="#64748B">
                      {job.date} • {job.timing}
                    </Text>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text variant="bodySm" weight="bold" color={Colors.primaryDark}>
                        {job.employerRating.replace(' Rating', '')}
                      </Text>
                    </View>
                  </View>

                  <Button
                    title="Apply for Job"
                    size="md"
                    fullWidth
                    onPress={() =>
                      router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                    }
                    style={styles.applyBtn}
                  />
                </Card>
              ))}
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
    paddingBottom: 110,
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  promoSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  promoCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#16203E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  promoCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  promoTextCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  promoTitle: {
    fontSize: 16,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  promoCodeBadge: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  promoIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  jobsList: {
    paddingHorizontal: Spacing.xl,
  },
  jobCard: {
    marginBottom: Spacing.lg,
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  jobTitleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryTag: {
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  applyBtn: {
    marginTop: Spacing.sm,
  },
});