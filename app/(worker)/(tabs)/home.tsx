import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  PanResponder,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';

import { FadeSlide, ScalePress } from '../../../src/components/AppHeader';
import { LocationPickerMap } from '../../../src/components/LocationPickerMap';
import { BannerCarousel, Banner as HomeBanner } from '../../../src/components/BannerCarousel';
import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
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

const AREA_COORDS: Record<string, [number, number]> = {
  Home: [79.7000, 12.8352],
  Work: [80.2110, 13.0827],
  Kanchipuram: [79.7000, 12.8352],
  Chengalpattu: [79.9750, 12.6850],
  Madurantakam: [79.8593, 12.5111],
  Sriperumbudur: [79.9420, 12.9670],
  Uthiramerur: [79.7610, 12.6080],
  Oragadam: [79.9569, 12.9111],
  'Maraimalai Nagar': [80.0350, 12.7930],
  Tambaram: [80.1170, 12.9230],
};

// Known Chennai localities — reverse geocoders return "Ward/Zone" junk,
// so we snap to the nearest real locality first.
const LOCALITY_COORDS: Record<string, [number, number]> = {
  Virugambakkam: [80.1931, 13.0502],
  Kodambakkam: [80.2010, 13.0530],
  Vadapalani: [80.2130, 13.0490],
  Valasaravakkam: [80.1800, 13.0600],
  Saligramam: [80.2050, 13.0360],
  Koyambedu: [80.2010, 13.0730],
  'Maduravoyal': [80.1560, 13.0620],
  'MMDA Colony': [80.1780, 13.0520],
  'Anna Nagar': [80.2110, 13.0820],
  'Mogappair': [80.1780, 13.0820],
  Ambattur: [80.1320, 13.0980],
  'Poonamallee': [80.1070, 13.0840],
  'Guindy': [80.2160, 13.0060],
  'Nungambakkam': [80.2420, 13.0580],
  'T. Nagar': [80.2310, 13.0410],
  'West Mambalam': [80.2230, 13.0340],
  'Ashok Nagar': [80.2170, 13.0320],
  'Arumbakkam': [80.2190, 13.0740],
  'Alwarthirunagar': [80.2210, 13.0350],
  'Porur': [80.1570, 13.0370],
  'Ramapuram': [80.1720, 13.0320],
  'Iyyapanthangal': [80.1580, 13.0280],
  'Vellala Nagar': [80.2260, 13.0110],
  'Ekkaduthangal': [80.2050, 13.0150],
  'Nandanam': [80.2370, 13.0280],
  'Adyar': [80.2550, 13.0050],
  'Teynampet': [80.2460, 13.0350],
  'Royapettah': [80.2600, 13.0500],
  'Mylapore': [80.2700, 13.0360],
  'Velachery': [80.2210, 12.9750],
  'Chromepet': [80.1510, 12.9520],
  'Pallavaram': [80.1600, 12.9670],
  'Tambaram': [80.1170, 12.9230],
  'Perungudi': [80.2410, 12.9600],
  'Thoraipakkam': [80.2400, 12.9340],
  'Sholinganallur': [80.2300, 12.9010],
  'OMR': [80.2460, 12.9700],
  'Medavakkam': [80.1850, 12.9160],
  'Madipakkam': [80.1990, 12.9600],
  'Pallikaranai': [80.2100, 12.9360],
  'Guduvancheri': [80.0720, 12.8450],
  'Urapakkam': [80.0950, 12.8680],
  'Vandalur': [80.0900, 12.8920],
};

const nearestLocality = (coords: [number, number]): string | null => {
  let best: string | null = null;
  let bestD = Infinity;
  for (const name of Object.keys(LOCALITY_COORDS)) {
    const d = distKm(coords, LOCALITY_COORDS[name]);
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return bestD < 6 ? best : null;
};

const reverseGeocodeName = async (coords: [number, number]): Promise<string | null> => {
  const local = nearestLocality(coords);
  if (local) return local;
  const [lng, lat] = coords;
  try {
    if (Platform.OS === 'web') {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const admins: { name: string; adminLevel: number; order: number }[] =
        data.localityInfo?.administrative ?? [];
      const suburb =
        admins
          .filter((a) => a.adminLevel >= 7 && a.adminLevel <= 10)
          .sort((a, b) => b.adminLevel - a.adminLevel)[0]?.name ?? null;
      const locality = data.locality && data.locality !== data.city ? data.locality : null;
      const city = data.city ?? null;
      return suburb ?? locality ?? city ??
        admins.sort((a, b) => b.order - a.order)[0]?.name ?? null;
    }
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (place) {
      const parts = [place.subregion, place.city, place.district, place.region].filter(Boolean);
      return parts[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
};

const distKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const la = toRad(a[1]);
  const lb = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const nearestArea = (coords: [number, number]): string => {
  const names = Object.keys(AREA_COORDS).filter((k) => k !== 'Home' && k !== 'Work');
  let best = names[0];
  let bestD = Infinity;
  for (const n of names) {
    const d = distKm(coords, AREA_COORDS[n]);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
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
  const [query, setQuery] = useState('');
  const [mapMode, setMapMode] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number]>(AREA_COORDS['Kanchipuram']);
  const [snappedArea, setSnappedArea] = useState('Kanchipuram');
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [mapDist, setMapDist] = useState(0);
  const placeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jobsNearby = AREA_JOB_COUNT[area.label] ?? 24;

  const sheetY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  const headerPadTop = scrollY.interpolate({ inputRange: [0, 64], outputRange: [16, 9], extrapolate: 'clamp' });
  const headerPadBottom = scrollY.interpolate({ inputRange: [0, 64], outputRange: [20, 10], extrapolate: 'clamp' });
  const brandScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.93], extrapolate: 'clamp' });
  const taglineOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [1, 0], extrapolate: 'clamp' });
  const taglineHeight = scrollY.interpolate({ inputRange: [0, 48], outputRange: [16, 0], extrapolate: 'clamp' });
  const comboMargin = scrollY.interpolate({ inputRange: [0, 64], outputRange: [Spacing.md, 4], extrapolate: 'clamp' });
  const comboScale = scrollY.interpolate({ inputRange: [0, 64], outputRange: [1, 0.97], extrapolate: 'clamp' });
  const listScrollY = useRef(0);
  const mapModeRef = useRef(mapMode);
  mapModeRef.current = mapMode;
  const backdropOpacity = sheetY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const closeModal = () => {
    Animated.timing(sheetY, {
      toValue: SCREEN_HEIGHT,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, g) =>
        !mapModeRef.current && listScrollY.current <= 0 && g.dy > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onMoveShouldSetPanResponderCapture: (_evt, g) =>
        !mapModeRef.current && listScrollY.current <= 0 && g.dy > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {},
      onPanResponderMove: (_evt, g) => {
        if (g.dy > 0) sheetY.setValue(g.dy);
      },
      onPanResponderRelease: (_evt, g) => {
        if (g.dy > 80 || g.vy > 0.45) {
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
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  const openLocationPicker = () => {
    sheetY.setValue(SCREEN_HEIGHT);
    setPicked(area);
    setQuery('');
    setMapMode(false);
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
      let lat: number;
      let lng: number;

      if (Platform.OS === 'web') {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('no geolocation'));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } else {
        let perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== Location.PermissionStatus.GRANTED) {
          perm = await Location.requestForegroundPermissionsAsync();
        }
        if (perm.status !== Location.PermissionStatus.GRANTED) {
          setLocating(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      setMapCoords([lng, lat]);
      const snap = nearestArea([lng, lat]);
      setSnappedArea(snap);
      setMapDist(Math.round(distKm([lng, lat], AREA_COORDS[snap]) * 10) / 10);
      const name = (await reverseGeocodeName([lng, lat])) ?? 'Current location';
      if (name) setSnappedArea(name);
      setPicked({ label: 'Current location', address: `${name}` });
      setMapMode(true);
    } catch {
      setLocating(false);
      Alert.alert('Location unavailable', 'Could not get your location. Try the map instead.');
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
                    Gig<Text variant="h2" weight="heavy" color="#0277F4">ro</Text>
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
                  style={[
                    styles.comboLocationZone,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  ]}
                  onPress={openLocationPicker}
                >
                  <View style={styles.locationIconChip}>
                    <Ionicons name="location-outline" size={16} color="#0277F4" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.comboLocationLabel}>
                      {area.label}
                    </Text>
                    {area.address && area.label !== area.address && (
                      <Text variant="caption" color="#64748B" numberOfLines={1}>
                        {area.address}
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
            <BannerCarousel banners={HOME_BANNERS} />
          </FadeSlide>

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

          {/* Earnings Stat Strip */}
          <FadeSlide delay={280}>
            <LinearGradient
              colors={['#0EA5E9', '#0277F4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  {jobsNearby}
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Jobs nearby you
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  ₹1,200
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Highest pay today
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text variant="h3" weight="heavy" color="#FFFFFF">
                  ₹550
                </Text>
                <Text variant="caption" weight="medium" color="#E0F2FE">
                  Avg. daily earning
                </Text>
              </View>
            </LinearGradient>
          </FadeSlide>

          {/* How It Works */}
          <FadeSlide delay={380}>
            <View style={styles.sectionContainer}>
              <Text variant="h3" weight="bold" color="#0F172A" style={styles.sectionTitle}>
                How it works
              </Text>
              <View style={styles.stepsRow}>
                {WORK_STEPS.map((step, i) => (
                  <View key={step.title} style={styles.stepItem}>
                    <View style={styles.stepIconWrap}>
                      <Ionicons name={step.icon} size={18} color="#0277F4" />
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

      {/* Location Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        statusBarTranslucent={Platform.OS === 'android'}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.modalDim, { opacity: backdropOpacity }]} />
          <TouchableOpacity
            style={[
              StyleSheet.absoluteFill,
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
            ]}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalSheet,
              { transform: [{ translateY: sheetY }] },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
            ]}
            {...panResponder.panHandlers}
          >
            {/* Grabber - visual handle */}
            <View style={styles.dragHandleArea}>
              <View style={styles.modalGrabber} />
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              onScroll={(e) => {
                listScrollY.current = e.nativeEvent.contentOffset.y;
              }}
            >
            <View style={styles.modalHeader}>
              {mapMode && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setMapMode(false)}
                  style={styles.mapBack}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-back" size={22} color="#0F172A" />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <Text variant="h3" weight="bold" color="#0F172A">
                  {mapMode ? 'Pick on map' : 'Select your location'}
                </Text>
                <Text variant="bodySm" color="#64748B" style={styles.modalSubheader}>
                  {mapMode ? 'Move the pin to your exact spot' : 'Jobs near your area will show on your home screen'}
                </Text>
              </View>
            </View>

            {mapMode ? (
              <>
                <View style={styles.mapContainer}>
                  <LocationPickerMap
                    initial={mapCoords}
                    onPick={(coords) => {
                      setMapCoords(coords);
                      const snap = nearestArea(coords);
                      setSnappedArea(snap);
                      setMapDist(Math.round(distKm(coords, AREA_COORDS[snap]) * 10) / 10);
                      if (placeTimer.current) clearTimeout(placeTimer.current);
                      placeTimer.current = setTimeout(async () => {
                        const name = await reverseGeocodeName(coords);
                        if (name) setSnappedArea(name);
                        else setPlaceName(null);
                      }, 400);
                    }}
                  />
                  <View style={styles.mapBadge}>
                    <Ionicons name="location-outline" size={14} color="#059669" />
                    <Text variant="caption" weight="bold" color="#0F172A">
                      {snappedArea}
                    </Text>
                  </View>
                </View>
                <View style={styles.mapHelper}>
                  <Ionicons name="finger-print" size={13} color="#94A3B8" />
                  <Text variant="caption" color="#94A3B8">
                    {'Drag the pin or tap anywhere on the map'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Search */}
                <View style={styles.modalSearchBox}>
                  <Ionicons name="search-outline" size={18} color="#64748B" />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search for area, street, locality"
                    placeholderTextColor="#94A3B8"
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={styles.modalSearchInput}
                  />
                  {query.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setQuery('')}
                      hitSlop={8}
                      style={styles.modalSearchClear}
                    >
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Use My Current Location CTA */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleUseCurrentLocation}
                  style={[styles.modalPlaceRow, picked.label === 'Current location' && styles.modalPlaceRowActive]}
                >
                  <View style={[styles.modalPlaceIcon, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="navigate" size={18} color="#0277F4" />
                  </View>
                  <View style={styles.modalPlaceCol}>
                    <Text variant="body" weight="bold" color="#0F172A">
                      {locating ? 'Locating you…' : 'Use my current location'}
                    </Text>
                    <Text variant="caption" color="#64748B">
                      {locating
                        ? 'Finding your area…'
                        : picked.label === 'Current location'
                        ? picked.address
                        : 'Detect your area automatically'}
                    </Text>
                  </View>
                  {picked.label === 'Current location' && !locating && (
                    <Ionicons name="checkmark-circle" size={20} color="#0277F4" />
                  )}
                </TouchableOpacity>

                {/* Choose on map */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const base =
                      picked.label === 'Current location'
                        ? mapCoords
                        : AREA_COORDS[picked.label] ?? AREA_COORDS['Kanchipuram'];
                    setMapCoords(base);
                    const snap = nearestArea(base);
                    setSnappedArea(snap);
                    setMapDist(Math.round(distKm(base, AREA_COORDS[snap]) * 10) / 10);
                    reverseGeocodeName(base).then((name) => {
                      if (name) setSnappedArea(name);
                    });
                    setMapMode(true);
                  }}
                  style={styles.modalPlaceRow}
                >
                  <View style={[styles.modalPlaceIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="map" size={18} color="#059669" />
                  </View>
                  <View style={styles.modalPlaceCol}>
                    <Text variant="body" weight="bold" color="#0F172A">
                      Choose on map
                    </Text>
                    <Text variant="caption" color="#64748B">
                      Drop the pin on your exact spot
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>

                {query.trim().length > 0 ? (
                  (() => {
                    const q = query.trim().toLowerCase();
                    const savedMatches = SAVED_PLACES.filter((p) =>
                      p.label.toLowerCase().includes(q)
                    );
                    const areaMatches = QUICK_AREAS.filter((a) => a.toLowerCase().includes(q));
                    return (
                      <View style={styles.modalSection}>
                        <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.modalSectionLabel}>
                          SEARCH RESULTS
                        </Text>
                        {savedMatches.map((p) => (
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
                        {areaMatches.map((a) => (
                          <TouchableOpacity
                            key={a}
                            activeOpacity={0.8}
                            onPress={() => {
                              const option = { label: a, address: a };
                              setPicked(option);
                              setArea(option);
                              closeModal();
                            }}
                            style={[styles.modalPlaceRow, picked.label === a && styles.modalPlaceRowActive]}
                          >
                            <View style={[styles.modalPlaceIcon, { backgroundColor: '#F1F5F9' }]}>
                              <Ionicons name="location-outline" size={16} color="#64748B" />
                            </View>
                            <View style={styles.modalPlaceCol}>
                              <Text variant="body" weight="bold" color="#0F172A">{a}</Text>
                              <Text variant="caption" color="#64748B">
                                {AREA_JOB_COUNT[a] ?? 0} jobs near here
                              </Text>
                            </View>
                        {picked.label === a && (
                          <Ionicons name="checkmark-circle" size={20} color="#0277F4" />
                        )}
                      </TouchableOpacity>
                    ))}
                    {savedMatches.length === 0 && areaMatches.length === 0 && (
                      <Text variant="bodySm" color="#64748B" style={styles.noResults}>
                        No areas found for “{query.trim()}”. Try a different name.
                      </Text>
                    )}
                  </View>
                );
              })()
            ) : (
              <>
                {/* Saved Places */}
                <View style={styles.modalSection}>
                  <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.modalSectionLabel}>
                    SAVED ADDRESSES
                  </Text>
                  {SAVED_PLACES.map((p) => (
                    <TouchableOpacity
                      key={p.label}
                      activeOpacity={0.8}
                      onPress={() => {
                        setPicked(p);
                        setArea(p);
                        closeModal();
                      }}
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
                        onPress={() => {
                          const option = { label: a, address: a };
                          setPicked(option);
                          setArea(option);
                          closeModal();
                        }}
                        style={[styles.modalChip, picked.label === a && styles.modalChipActive]}
                      >
                        <Text variant="caption" weight="bold" color={picked.label === a ? '#FFFFFF' : '#334155'}>
                          {a}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            </>
          )}

            </ScrollView>

            {/* Apply button */}
            <View style={styles.modalFooter}>
              <Button
                title={mapMode ? `Confirm in ${snappedArea}` : `Show jobs in ${picked.label}`}
                fullWidth
                onPress={() => {
                  if (mapMode) {
                    const label = picked.label === 'Current location' ? 'Current location' : snappedArea;
                    const option = { label, address: `${snappedArea}` };
                    setPicked(option);
                    setArea(option);
                    closeModal();
                  } else {
                    confirmLocation();
                  }
                }}
              />
            </View>
          </Animated.View>
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
    backgroundColor: '#DBEAFE',
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
    backgroundColor: '#0277F4',
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDim: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: Spacing.xxxl,
    height: '100%',
    width: '100%',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    minHeight: 46,
    marginBottom: Spacing.lg,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  modalSearchClear: {
    marginLeft: Spacing.sm,
  },
  mapBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  mapContainer: {
    height: 360,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  mapBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  mapHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  noResults: {
    marginTop: Spacing.xs,
  },
  dragHandleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginTop: -4,
    // larger hit area for swipe down
    minHeight: 24,
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
});
