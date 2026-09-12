import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button, Card } from '../../../src/components/ui';
import { FadeSlide, ScalePress } from '../../../src/components/AppHeader';
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

const SAVED_PLACES = [
  { label: 'Home', address: 'Gandhi Road, Kanchipuram', icon: 'home-outline' },
  { label: 'Work', address: 'Anna Nagar, Chennai', icon: 'briefcase-outline' },
];

const QUICK_AREAS = [
  'Kanchipuram',
  'Chengalpattu',
  'Madurantakam',
  'Sriperumbudur',
  'Uthiramerur',
  'Oragadam',
  'Maraimalai Nagar',
  'Tambaram',
];

const AREA_JOB_COUNT: Record<string, number> = {
  Home: 34,
  Work: 27,
  Kanchipuram: 12,
  Chengalpattu: 9,
  Madurantakam: 6,
  Sriperumbudur: 14,
  Uthiramerur: 4,
  Oragadam: 11,
  'Maraimalai Nagar': 8,
  Tambaram: 21,
  'Current location': 18,
};

interface AreaOption {
  label: string;
  address: string;
}

export default function WorkerHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { toggleMode } = useUserModeStore();
  const [area, setArea] = useState<AreaOption>({ label: 'Home', address: 'Gandhi Road, Kanchipuram' });
  const [picked, setPicked] = useState<AreaOption>(area);
  const [modalVisible, setModalVisible] = useState(false);

  const openLocationPicker = () => {
    setPicked(area);
    setModalVisible(true);
  };

  const confirmLocation = () => {
    setArea(picked);
    setModalVisible(false);
  };

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
          {/* Swiggy-style solid header */}
<LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#F5F9FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Row 1: Brand + actions */}
            <View style={styles.headerTopRow}>
              <View style={styles.brandCol}>
                <Text variant="h2" weight="heavy" color="#0F172A" style={styles.brandTitle}>
                  Work<Text variant="h2" weight="heavy" color="#172554">Go</Text>
                </Text>
                <Text variant="caption" weight="medium" color="#94A3B8" style={styles.brandTagline}>
                  Work nearby. Earn today.
                </Text>
              </View>

              <View style={styles.headerActions}>
                <ScalePress onPress={() => router.push('/(worker)/wallet')} style={styles.iconBtnDark} scaleTo={0.9}>
                  <Ionicons name="wallet-outline" size={20} color="#0F172A" />
                </ScalePress>
                <ScalePress onPress={() => router.push('/(worker)/profile')} style={styles.iconBtnDark} scaleTo={0.9}>
                  <Text variant="body" weight="heavy" color="#0F172A">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </ScalePress>
              </View>
            </View>

            {/* Row 2: Location selector */}
            <TouchableOpacity activeOpacity={0.85} style={styles.locationCard} onPress={openLocationPicker}>
              <View style={styles.locationIconChip}>
                <Ionicons name="location-outline" size={16} color="#0277F4" />
              </View>

              <View style={styles.locationCol}>
                <Text variant="caption" weight="bold" color="#94A3B8" style={styles.locationTag}>
                  {area.label.toUpperCase()} • {AREA_JOB_COUNT[area.label] ?? 12} JOBS NEARBY
                </Text>
                <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                  {area.address}
                </Text>
              </View>

              <View style={styles.locationChevron}>
                <Ionicons name="chevron-down" size={15} color="#0F172A" />
              </View>
            </TouchableOpacity>

            {/* Row 3: Search */}
            <View style={styles.headerSearchWrap}>
              <SearchBar
                placeholder="Find temporary jobs, Catering, Promoter..."
                onPress={() => router.push('/search')}
              />
            </View>
          </LinearGradient>

          {/* Select Your Services Category Grid */}
          <FadeSlide delay={120}>
            <View style={styles.sectionContainer}>
              <Text variant="h3" weight="bold" color="#0F172A" style={styles.sectionTitle}>
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

          {/* Ad Banner */}
          <FadeSlide delay={200}>
            <View style={styles.promoSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(worker)/jobs')}
              >
                <ExpoImage
                  source={require('../../../assets/ad_banner.jpg')}
                  style={styles.adBannerImage}
                  contentFit="cover"
                  transition={150}
                />
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* Nearby Jobs Section */}
          <FadeSlide delay={280}>
            <View style={styles.jobsHeader}>
              <Text variant="h3" weight="bold" color="#0F172A">
                Nearby Jobs
              </Text>
              <TouchableOpacity onPress={() => router.push('/(worker)/jobs')}>
                <Text variant="bodySm" weight="bold" color="#0F172A">
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
                      <Text variant="body" weight="heavy" color="#0F172A">
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
                      <Text variant="bodySm" weight="bold" color="#0F172A">
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

      {/* Location Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Grabber */}
            <View style={styles.modalGrabber} />

            <View style={styles.modalHeader}>
              <Text variant="h3" weight="bold" color="#0F172A">
                Choose your location
              </Text>
              <Text variant="bodySm" color="#64748B" style={styles.modalSubheader}>
                Jobs available in your area
              </Text>
            </View>

            {/* Current Location */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPicked({ label: 'Current location', address: 'Gandhi Road, Kanchipuram' })}
              style={[styles.modalPlaceRow, picked.label === 'Current location' && styles.modalPlaceRowActive]}
            >
              <View style={[styles.modalPlaceIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="navigate" size={16} color="#0277F4" />
              </View>
              <View style={styles.modalPlaceCol}>
                <Text variant="body" weight="bold" color="#0F172A">Use current location</Text>
                <Text variant="caption" color="#64748B">Gandhi Road, Kanchipuram</Text>
              </View>
              {picked.label === 'Current location' && (
                <Ionicons name="checkmark-circle" size={20} color="#0277F4" />
              )}
            </TouchableOpacity>

            {/* Saved Places */}
            <View style={styles.modalSection}>
              <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.modalSectionLabel}>
                SAVED PLACES
              </Text>
              {SAVED_PLACES.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  activeOpacity={0.8}
                  onPress={() => setPicked(p)}
                  style={[styles.modalPlaceRow, picked.label === p.label && styles.modalPlaceRowActive]}
                >
                  <View style={[styles.modalPlaceIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name={p.icon as any} size={16} color="#059669" />
                  </View>
                  <View style={styles.modalPlaceCol}>
                    <Text variant="body" weight="bold" color="#0F172A">{p.label}</Text>
                    <Text variant="caption" color="#64748B">{p.address}</Text>
                  </View>
                  {picked.label === p.label && (
                    <Ionicons name="checkmark-circle" size={20} color="#0277F4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Area Chips */}
            <View style={styles.modalSection}>
              <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.modalSectionLabel}>
                NEARBY AREAS
              </Text>
              <View style={styles.modalChipWrap}>
                {QUICK_AREAS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    activeOpacity={0.85}
                    onPress={() => setPicked({ label: a, address: a })}
                    style={[styles.modalChip, picked.label === a && styles.modalChipActive]}
                  >
                    <Text variant="caption" weight="bold" color={picked.label === a ? '#FFFFFF' : '#334155'}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply button */}
            <View style={styles.modalFooter}>
              <Button
                title={`Show jobs in ${picked.label}`}
                fullWidth
                onPress={confirmLocation}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  headerGradient: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E3F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCol: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  locationTag: {
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  locationChevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSearchWrap: {
    marginTop: 16,
    marginBottom: 2,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: Spacing.xxxl,
    maxHeight: '88%',
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  modalHeader: {
    marginBottom: Spacing.lg,
  },
  modalSubheader: {
    marginTop: 2,
  },
  modalPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalPlaceRowActive: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  modalPlaceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceCol: {
    flex: 1,
  },
  modalSection: {
    marginTop: Spacing.lg,
  },
  modalSectionLabel: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  modalChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  modalChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalChipActive: {
    backgroundColor: '#0277F4',
    borderColor: '#0277F4',
  },
  modalFooter: {
    marginTop: Spacing.xl,
  },
});