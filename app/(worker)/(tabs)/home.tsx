import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button, Card } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';

import { FadeSlide, ScalePress } from '../../../src/components/AppHeader';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { SAMPLE_JOBS } from '../../../src/data/sampleJobs';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useMessagesStore } from '../../../src/store/messagesStore';
import { useUserModeStore } from '../../../src/store/userModeStore';

interface ServiceCategory {
  id: string;
  name: string;
  image?: any;
  isOthers?: boolean;
}

const DAILY_TIPS: string[] = [
  'Always verify the employer identity before accepting any job.',
  'Keep your profile photo updated — verified workers get hired first.',
  'Arrive 10 minutes early; punctuality keeps your rating high.',
  'Update your skills list — workers with more skills earn more jobs.',
  'Complete every job you accept; reliability builds repeat clients.',
  'Ask the employer about food and transport before you start.',
  'Keep last month\'s earnings in your wallet for quick cash-outs.',
  'Mark your availability "yes" to show up in employer search first.',
  'Read the job requirements fully before applying — fewer rejections.',
  'Leave a polite follow-up after a job to get rebooked.',
  'Emergency slot? Apply instantly — early applications win.',
  'Keep WhatsApp notifications on to catch new nearby jobs fast.',
];

const DAY_OF_YEAR = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
);
const DAILY_TIP = DAILY_TIPS[DAY_OF_YEAR % DAILY_TIPS.length];
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
    image: require('../../../assets/Catter.png'),
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
  const { toggleMode } = useUserModeStore();
  const userName = useAuthStore((s) => s.user?.name);
  const firstName = userName?.split(' ')[0] || 'there';
  const applications = useApplicationsStore((s) => s.applications);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const unreadCount = applications.filter((a) => !readThreadIds.includes(a.jobId)).length;
  const [area, setArea] = useState<AreaOption>({ label: 'Home', address: 'Gandhi Road, Kanchipuram' });
  const [picked, setPicked] = useState<AreaOption>(area);
  const [modalVisible, setModalVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const MAP_SIZE = 1200;
  const MAP_NODES = [
    { label: 'Kanchipuram', kms: 3, x: 300, y: 250, jobs: 12 },
    { label: 'Sriperumbudur', kms: 8, x: 560, y: 120, jobs: 14 },
    { label: 'Oragadam', kms: 9, x: 660, y: 360, jobs: 11 },
    { label: 'Uthiramerur', kms: 15, x: 900, y: 330, jobs: 4 },
    { label: 'Chengalpattu', kms: 12, x: 780, y: 580, jobs: 9 },
    { label: 'Tambaram', kms: 10, x: 400, y: 640, jobs: 21 },
    { label: 'Maraimalai Nagar', kms: 11, x: 810, y: 700, jobs: 8 },
    { label: 'Madurantakam', kms: 18, x: 1030, y: 790, jobs: 6 },
  ];
  const PARKS = [
    { x: 620, y: 50, w: 210, h: 140 },
    { x: 80, y: 700, w: 150, h: 130 },
    { x: 950, y: 90, w: 130, h: 100 },
  ];
  const LAKES = [
    { x: 170, y: 380, w: 240, h: 150 },
  ];

  const mapViewport = useRef({ w: 0, h: 0 });
  const mapXY = useRef({ x: 0, y: 0 });
  const mapDragStart = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const selectedRef = useRef(MAP_NODES[0]);
  const mapInit = useRef(false);
  const [mapPos, setMapPos] = useState({ x: 0, y: 0 });
  const [mapScale, setMapScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState(MAP_NODES[0]);
  const [mapReady, setMapReady] = useState(false);

  const clampX = (w: number, x: number) => {
    const min = Math.min(0, w - MAP_SIZE * scaleRef.current);
    return Math.max(min, Math.min(0, x));
  };
  const clampY = (h: number, y: number) => {
    const min = Math.min(0, h - MAP_SIZE * scaleRef.current);
    return Math.max(min, Math.min(0, y));
  };

  const setSelectionFromPin = (x: number, y: number) => {
    const { w, h } = mapViewport.current;
    if (!w || !h) return;
    const s = scaleRef.current;
    const cwx = (w / 2 - x) / s;
    const cwy = (h / 2 - y) / s;
    let best = MAP_NODES[0];
    let bd = Infinity;
    for (const n of MAP_NODES) {
      const d = (n.x - cwx) * (n.x - cwx) + (n.y - cwy) * (n.y - cwy);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    selectedRef.current = best;
    setSelectedNode(best);
  };

  const mapPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        mapDragStart.current = { ...mapXY.current };
      },
      onPanResponderMove: (_evt, g) => {
        const { w, h } = mapViewport.current;
        const nx = clampX(w, mapDragStart.current.x + g.dx);
        const ny = clampY(h, mapDragStart.current.y + g.dy);
        mapXY.current = { x: nx, y: ny };
        setMapPos(mapXY.current);
        setSelectionFromPin(nx, ny);
      },
    })
  ).current;

  const onMapLayout = (e: any) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    mapViewport.current = { w, h };
    if (!mapInit.current) {
      mapInit.current = true;
      const n = MAP_NODES[0];
      const x = clampX(w, w / 2 - n.x * scaleRef.current);
      const y = clampY(h, h / 2 - n.y * scaleRef.current);
      mapXY.current = { x, y };
      setMapPos({ x, y });
      setSelectedNode(n);
    }
    setMapReady(true);
  };

  const recenterMap = () => {
    const { w, h } = mapViewport.current;
    if (!w) return;
    const s = scaleRef.current;
    const n = selectedRef.current;
    const x = clampX(w, w / 2 - n.x * s);
    const y = clampY(h, h / 2 - n.y * s);
    mapXY.current = { x, y };
    setMapPos({ x, y });
  };

  const zoomMap = (dir: number) => {
    const ns = Math.min(1.7, Math.max(0.8, +(scaleRef.current + dir * 0.3).toFixed(2)));
    scaleRef.current = ns;
    setMapScale(ns);
    recenterMap();
  };

  const openMapPicker = () => {
    closeModal();
    setMapReady(false);
    setTimeout(() => {
      mapInit.current = false;
      setMapVisible(true);
    }, 300);
  };

  const confirmMapLocation = () => {
    const node = selectedRef.current;
    setPicked({ label: node.label, address: `${node.label} area · ${node.kms} km` });
    setArea({ label: node.label, address: `${node.label} area` });
    setMapVisible(false);
  };

  const sheetY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [20, 10], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });
  const taglineOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [1, 0], extrapolate: 'clamp' });
  const taglineHeight = scrollY.interpolate({ inputRange: [0, 48], outputRange: [16, 0], extrapolate: 'clamp' });
  const comboMargin = scrollY.interpolate({ inputRange: [0, 64], outputRange: [Spacing.md, 4], extrapolate: 'clamp' });
  const comboScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.97], extrapolate: 'clamp' });
  const listScrollY = useRef(0);
  const backdropOpacity = sheetY.interpolate({
    inputRange: [0, 420],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const closeModal = () => {
    Animated.timing(sheetY, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_evt, g) =>
        listScrollY.current <= 0 && g.dy > 6 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_evt, g) => {
        sheetY.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_evt, g) => {
        if (g.dy > 110 || g.vy > 0.6) {
          closeModal();
        } else {
          Animated.spring(sheetY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(sheetY, {
          toValue: 0,
          bounciness: 4,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const openLocationPicker = () => {
    sheetY.setValue(420);
    setPicked(area);
    setModalVisible(true);
    requestAnimationFrame(() => {
      Animated.spring(sheetY, {
        toValue: 0,
        bounciness: 6,
        useNativeDriver: true,
      }).start();
    });
  };

  const confirmLocation = () => {
    setArea(picked);
    closeModal();
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        openLocationPicker();
        return;
      }
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          const res = await Location.requestForegroundPermissionsAsync();
          status = res.status;
        }
        if (status === Location.PermissionStatus.GRANTED) {
          openLocationPicker();
        }
      } catch {
        // ignore permission errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (Platform.OS !== 'web' && perm.status !== Location.PermissionStatus.GRANTED) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (Platform.OS !== 'web' && perm.status !== Location.PermissionStatus.GRANTED) {
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let address = 'Current location';
      if (Platform.OS !== 'web') {
        try {
          const [place] = await Location.reverseGeocodeAsync(pos.coords);
          if (place) {
            const parts = [place.district, place.city, place.region].filter(Boolean);
            if (parts.length) address = parts.slice(0, 2).join(', ');
          }
        } catch {
          // keep fallback address
        }
      }
      setPicked({ label: 'Current location', address });
      setArea({ label: 'Current location', address });
      closeModal();
    } catch {
      setPicked({ label: 'Current location', address: 'Gandhi Road, Kanchipuram' });
    } finally {
      setLocating(false);
    }
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
                    Work<Text variant="h2" weight="heavy" color="#0277F4">Go</Text>
                  </Text>
                  <Animated.View style={{ height: taglineHeight, opacity: taglineOpacity }}>
                    <Text variant="caption" weight="medium" color="#64748B" style={styles.brandTagline}>
                      {GREETING_MSG}, <Text variant="caption" weight="bold" color="#0277F4">{firstName}</Text>!
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
                  style={styles.comboLocationZone}
                  onPress={openLocationPicker}
                >
                  <View style={styles.locationIconChip}>
                    <Ionicons name="location-outline" size={16} color="#0277F4" />
                  </View>
                  <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.comboLocationLabel}>
                    {area.label}
                  </Text>
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
                        {!cat.image ? (
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

          {/* WorkGo Tip of the Day */}
          <FadeSlide delay={200}>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb-outline" size={20} color="#0277F4" />
              </View>
              <View style={styles.tipContent}>
                <Text variant="caption" weight="bold" color="#0277F4" style={styles.tipLabel}>
                  WORKGO TIP OF THE DAY
                </Text>
                <Text variant="bodySm" weight="medium" color="#334155" style={styles.tipText}>
                  {DAILY_TIP}
                </Text>
              </View>
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
                  padding="md"
                  style={styles.jobCard}
                  onPress={() =>
                    router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                  }
                >
                  <View style={styles.jobCardTop}>
                    <View style={styles.jobTitleCol}>
                      <Text variant="body" weight="semibold" color="#0F172A" numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text variant="caption" color="#64748B" style={styles.categoryTag}>
                        {job.category} • {job.location} ({job.distance})
                      </Text>
                    </View>
                    <View style={styles.salaryBadge}>
                      <Text variant="bodySm" weight="heavy" color="#0F172A">
                        {job.salary}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobMetaRow}>
                    <Text variant="caption" color="#64748B">
                      {job.date} • {job.timing}
                    </Text>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text variant="caption" weight="bold" color="#0F172A">
                        {job.employerRating.replace(' Rating', '')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.applyRow}>
                    <Text variant="bodySm" weight="bold" color="#0277F4">
                      Apply now
                    </Text>
                    <Ionicons name="arrow-right" size={12} color="#0277F4" weight="bold" />
                  </View>
                </Card>
              ))}
            </View>
          </FadeSlide>

          {/* Refer & Earn */}
          <FadeSlide delay={440}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/(worker)/refer')}
              style={styles.referCardWrap}
            >
              <LinearGradient
                colors={['#0277F4', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.referCard}
              >
                <View style={styles.referTextCol}>
                  <Text variant="caption" weight="bold" color="#BAE6FD" style={styles.referLabel}>
                    REFER & EARN
                  </Text>
                  <Text variant="h3" weight="bold" color="#FFFFFF">
                    Earn ₹100 per friend
                  </Text>
                  <Text variant="bodySm" color="#E0F2FE">
                    Share your code — you both get rewards.
                  </Text>
                </View>
                <View style={styles.referIconCircle}>
                  <Ionicons name="gift" size={22} color="#FFFFFF" />
                </View>
                <Ionicons name="arrow-right" size={18} color="#FFFFFF" weight="bold" />
              </LinearGradient>
            </TouchableOpacity>
          </FadeSlide>
        </ScrollView>
      </View>
      </LinearGradient>

      {/* Location Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.modalDim, { opacity: backdropOpacity }]} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[styles.modalSheet, { transform: [{ translateY: sheetY }] }]}
            {...panResponder.panHandlers}
          >
            {/* Grabber */}
            <View style={styles.modalGrabber} />

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              scrollEventThrottle={16}
              onScroll={(e) => {
                listScrollY.current = e.nativeEvent.contentOffset.y;
              }}
            >
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
              onPress={handleUseCurrentLocation}
              style={[styles.modalPlaceRow, picked.label === 'Current location' && styles.modalPlaceRowActive]}
            >
              <View style={[styles.modalPlaceIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="navigate" size={16} color="#0277F4" />
              </View>
              <View style={styles.modalPlaceCol}>
                <Text variant="body" weight="bold" color="#0F172A">
                  {locating ? 'Locating you…' : 'Use current location'}
                </Text>
                <Text variant="caption" color="#64748B">
                  {locating ? 'Finding your area…' : picked.label === 'Current location' ? picked.address : 'Gandhi Road, Kanchipuram'}
                </Text>
              </View>
              {picked.label === 'Current location' && !locating && (
                <Ionicons name="checkmark-circle" size={20} color="#0277F4" />
              )}
            </TouchableOpacity>

            {/* Choose on Map */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openMapPicker}
              style={[styles.modalPlaceRow, picked.label === selectedNode?.label && styles.modalPlaceRowActive]}
            >
              <View style={[styles.modalPlaceIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="map-outline" size={16} color="#0277F4" />
              </View>
              <View style={styles.modalPlaceCol}>
                <Text variant="body" weight="bold" color="#0F172A">Choose on map</Text>
                <Text variant="caption" color="#64748B">Pan the map · drop your pin</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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

            </ScrollView>

            {/* Apply button */}
            <View style={styles.modalFooter}>
              <Button
                title={`Show jobs in ${picked.label}`}
                fullWidth
                onPress={confirmLocation}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── Select on Map ─── */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <SafeAreaView style={styles.mapScreen}>
          <View style={styles.mapTopBar}>
            <TouchableOpacity
              onPress={() => setMapVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.mapTopBackBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.mapTopTitleCol}>
              <Text variant="body" weight="bold" color="#0F172A">
                Select on map
              </Text>
              <Text variant="caption" color="#64748B">
                Drag the map — pin picks the area
              </Text>
            </View>
          </View>

          <View style={styles.mapViewport} onLayout={onMapLayout}>
            {mapReady ? (
            <View
              style={[styles.mapWorld, { transform: [{ scale: mapScale }, { translateX: mapPos.x }, { translateY: mapPos.y }] }]}
              {...mapPanResponder.panHandlers}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={`h${i}`} style={[styles.mapRoadH, { top: i * 78 }]} />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <View key={`v${i}`} style={[styles.mapRoadV, { left: i * 78 }]} />
              ))}

              {PARKS.map((p, i) => (
                <View key={`p${i}`} style={[styles.mapPark, { left: p.x, top: p.y, width: p.w, height: p.h }]} />
              ))}
              {LAKES.map((l, i) => (
                <View key={`l${i}`} style={[styles.mapLake, { left: l.x, top: l.y, width: l.w, height: l.h }]}>
                  <Text variant="caption" color="#3B82F6" weight="semibold">PALAR LAKE</Text>
                </View>
              ))}

              {MAP_NODES.map((n) => {
                const active = selectedNode?.label === n.label;
                return (
                  <View key={n.label} style={{ position: 'absolute', left: n.x, top: n.y }}>
                    <View style={[styles.mapNode, active && styles.mapNodeActive]}>
                      <View style={[styles.mapNodeDot, active && styles.mapNodeDotActive]} />
                    </View>
                    <Text
                      variant="caption"
                      weight="bold"
                      style={[styles.mapNodeLabel, active ? styles.mapNodeLabelActive : null]}
                    >
                      {n.label} · {n.kms} km
                    </Text>
                    <Text variant="caption" weight="semibold" style={styles.mapNodeJobs}>
                      {n.jobs} jobs
                    </Text>
                  </View>
                );
              })}
            </View>
            ) : null}

            <View style={styles.mapPinWrap} pointerEvents="none">
              <View style={styles.mapPinPulse} />
              <View style={styles.mapPinShadow} />
              <View style={styles.mapPin}>
                <View style={styles.mapPinDot} />
              </View>
            </View>

            <View style={styles.mapHintPill} pointerEvents="none">
              <Ionicons name="map-outline" size={13} color="#334155" />
              <Text variant="caption" weight="semibold" color="#334155">
                Drag anywhere — pin follows the center
              </Text>
            </View>

            <View style={styles.mapZoomCol}>
              <TouchableOpacity style={styles.mapZoomBtn} activeOpacity={0.8} onPress={() => zoomMap(1)}>
                <Text variant="body" weight="heavy" color="#0F172A">+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapZoomBtn} activeOpacity={0.8} onPress={() => zoomMap(-1)}>
                <Text variant="body" weight="heavy" color="#0F172A">−</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.mapRecenter} activeOpacity={0.85} onPress={recenterMap}>
              <Ionicons name="navigate" size={18} color="#0277F4" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapBottomBar}>
            <View style={styles.mapSelectedPill}>
              <Ionicons name="location-outline" size={14} color="#0277F4" />
              <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1} style={styles.mapSelectedText}>
                {selectedNode?.label} · {selectedNode?.kms} km away
              </Text>
            </View>
            <Button
              title={`Use ${selectedNode?.label ?? 'location'}`}
              size="lg"
              fullWidth
              onPress={confirmMapLocation}
            />
          </View>
        </SafeAreaView>
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
    paddingTop: Spacing.md,
    paddingBottom: 110,
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
  },
  comboLocationLabel: {
    flexShrink: 1,
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  tipText: {
    lineHeight: 18,
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
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  applyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  referCardWrap: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  referTextCol: {
    flex: 1,
  },
  referLabel: {
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  referIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDim: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: Spacing.xl,
    maxHeight: '88%',
  },
  modalScroll: {
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingBottom: Spacing.lg,
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

  /* Select on Map */
  mapScreen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  mapTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF6',
  },
  mapTopBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTopTitleCol: {
    flex: 1,
  },
  mapViewport: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  mapWorld: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1200,
    height: 1200,
    backgroundColor: '#E3EAF2',
  },
  mapRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  mapPark: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: '#C8E6C9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  mapLake: {
    position: 'absolute',
    borderRadius: 18,
    backgroundColor: '#BFE0F5',
    borderWidth: 1,
    borderColor: '#9CC8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0277F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    marginTop: -8,
  },
  mapNodeActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    marginTop: -12,
  },
  mapNodeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0277F4',
  },
  mapNodeDotActive: {
    backgroundColor: '#FFFFFF',
  },
  mapNodeLabel: {
    position: 'absolute',
    top: 10,
    left: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    color: '#334155',
    fontSize: 10,
  },
  mapNodeLabelActive: {
    backgroundColor: '#0277F4',
    color: '#FFFFFF',
  },
  mapNodeJobs: {
    position: 'absolute',
    top: 26,
    left: 8,
    color: '#64748B',
    fontSize: 10,
  },
  mapPinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(2,119,244,0.14)',
  },
  mapPinShadow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15,23,42,0.18)',
  },
  mapPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0277F4',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  mapHintPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    ...Shadows.sm,
  },
  mapZoomCol: {
    position: 'absolute',
    right: 14,
    top: 14,
    gap: 8,
  },
  mapZoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  mapRecenter: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  mapBottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF6',
  },
  mapSelectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  mapSelectedText: {
    flexShrink: 1,
  },
});
