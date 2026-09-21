import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Button } from '../../src/components/ui';
import { ScalePress } from '../../src/components/AppHeader';
import { LocationPickerMap } from '../../src/components/LocationPickerMap';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useLocationStore } from '../../src/store/locationStore';
import {
  SAVED_PLACES,
  QUICK_AREAS,
  AREA_JOB_COUNT,
  AREA_COORDS,
  AreaOption,
  nearestArea,
  reverseGeocodeName,
} from '../../src/services/location';
import { searchPlaces, PlaceSuggestion } from '../../src/services/maptiler';

const webReset = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

export default function LocationPickerScreen() {
  const savedLabel = useLocationStore((s) => s.label);
  const savedAddress = useLocationStore((s) => s.address);
  const setLocation = useLocationStore((s) => s.setLocation);

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<AreaOption>({ label: savedLabel, address: savedAddress });
  const [locating, setLocating] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number]>(AREA_COORDS['Kanchipuram']);
  const [snappedArea, setSnappedArea] = useState('Kanchipuram');
  const [liveResults, setLiveResults] = useState<PlaceSuggestion[]>([]);
  const placeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (placeTimer.current) clearTimeout(placeTimer.current);
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = query.trim();
    if (q.length < 2) {
      setLiveResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const res = await searchPlaces(q);
      if (res) setLiveResults(res);
    }, 350);
  }, [query]);

  const handleUseCurrentLocation = async () => {
    if (locating) return;
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
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      const coords: [number, number] = [lng, lat];
      setMapCoords(coords);
      const snap = nearestArea(coords);
      setSnappedArea(snap);
      const name = (await reverseGeocodeName(coords)) ?? 'Current location';
      setPicked({ label: 'Current location', address: name });
      setMapMode(false);
    } catch {
      Alert.alert('Location unavailable', 'Could not get your location. Try the map instead.');
    } finally {
      setLocating(false);
    }
  };

  const handleChooseOnMap = () => {
    const base =
      picked.label === 'Current location'
        ? mapCoords
        : AREA_COORDS[picked.label] ?? AREA_COORDS['Kanchipuram'];
    setMapCoords(base);
    const snap = nearestArea(base);
    setSnappedArea(snap);
    reverseGeocodeName(base).then((name) => {
      if (name) setSnappedArea(name);
    });
    setMapMode(true);
  };

  const handleMapPick = (coords: [number, number]) => {
    setMapCoords(coords);
    const snap = nearestArea(coords);
    setSnappedArea(snap);
    if (placeTimer.current) clearTimeout(placeTimer.current);
    placeTimer.current = setTimeout(async () => {
      const name = await reverseGeocodeName(coords);
      if (name) setSnappedArea(name);
    }, 400);
  };

  const selectOption = (option: AreaOption) => {
    setPicked(option);
    setMapMode(false);
  };

  const confirm = () => {
    const option: AreaOption = mapMode
      ? {
          label: picked.label === 'Current location' ? 'Current location' : snappedArea,
          address: snappedArea,
        }
      : picked;
    setLocation(option.label, option.address);
    router.back();
  };

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const savedMatches = searching
    ? SAVED_PLACES.filter((p) => p.label.toLowerCase().includes(q))
    : [];
  const areaMatches = searching ? QUICK_AREAS.filter((a) => a.toLowerCase().includes(q)) : [];

  const isPicked = (label: string) => picked.label === label;

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF', '#F8FAFC', '#F8FAFC']}
      locations={[0, 0.34, 0.66, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <ScalePress onPress={() => router.back()} style={styles.backBtn} scaleTo={0.9}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </ScalePress>
          <View style={styles.headerCol}>
            <Text variant="h3" weight="bold" color="#0F172A">
              Select your location
            </Text>
            <Text variant="bodySm" color="#64748B">
              Jobs near your area will show on your home
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search for area, street, locality"
              placeholderTextColor="#94A3B8"
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.searchInput}
              selectionColor={Colors.primary}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8} style={webReset}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {searching ? (
            <View style={styles.section}>
              <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.sectionLabel}>
                SEARCH RESULTS
              </Text>
              {savedMatches.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  activeOpacity={0.8}
                  onPress={() => selectOption({ label: p.label, address: p.address })}
                  style={[styles.placeRow, isPicked(p.label) && styles.placeRowActive, webReset]}
                >
                  <View style={[styles.placeIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name={p.icon as any} size={16} color="#059669" />
                  </View>
                  <View style={styles.placeCol}>
                    <Text variant="body" weight="bold" color="#0F172A">
                      {p.label}
                    </Text>
                    <Text variant="caption" color="#64748B">
                      {p.address}
                    </Text>
                  </View>
                  {isPicked(p.label) && (
                    <Ionicons name="checkmark-circle" size={20} color="#0F172A" />
                  )}
                </TouchableOpacity>
              ))}
              {areaMatches.map((a) => (
                <TouchableOpacity
                  key={a}
                  activeOpacity={0.8}
                  onPress={() => selectOption({ label: a, address: a })}
                  style={[styles.placeRow, isPicked(a) && styles.placeRowActive, webReset]}
                >
                  <View style={[styles.placeIcon, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="location-outline" size={16} color="#64748B" />
                  </View>
                  <View style={styles.placeCol}>
                    <Text variant="body" weight="bold" color="#0F172A">
                      {a}
                    </Text>
                    <Text variant="caption" color="#64748B">
                      {AREA_JOB_COUNT[a] ?? 0} jobs near here
                    </Text>
                  </View>
                  {isPicked(a) && (
                    <Ionicons name="checkmark-circle" size={20} color="#0F172A" />
                  )}
                </TouchableOpacity>
              ))}
              {liveResults.map((s) => (
                <TouchableOpacity
                  key={s.address}
                  activeOpacity={0.8}
                  onPress={() => selectOption({ label: s.label, address: s.address })}
                  style={[styles.placeRow, webReset]}
                >
                  <View style={[styles.placeIcon, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="map-pin-outline" size={16} color="#0F172A" />
                  </View>
                  <View style={styles.placeCol}>
                    <Text variant="body" weight="bold" color="#0F172A">
                      {s.label}
                    </Text>
                    <Text variant="caption" color="#64748B" numberOfLines={1}>
                      {s.address}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
              {savedMatches.length === 0 && areaMatches.length === 0 && liveResults.length === 0 && (
                <Text variant="bodySm" color="#64748B" style={styles.noResults}>
                  No areas found for "{query.trim()}".
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Use current location */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUseCurrentLocation}
                style={[styles.placeRow, isPicked('Current location') && styles.placeRowActive, webReset]}
              >
                <View style={[styles.placeIcon, { backgroundColor: '#E0F2FE' }]}>
                  {locating ? (
                    <Ionicons name="time-outline" size={16} color="#0F172A" />
                  ) : (
                    <Ionicons name="navigate-outline" size={18} color="#0F172A" />
                  )}
                </View>
                <View style={styles.placeCol}>
                  <Text variant="body" weight="bold" color="#0F172A">
                    {locating ? 'Locating you…' : 'Use my current location'}
                  </Text>
                  <Text variant="caption" color="#64748B">
                    {locating
                      ? 'Finding your area…'
                      : isPicked('Current location')
                      ? picked.address
                      : 'Detect your area automatically'}
                  </Text>
                </View>
                {isPicked('Current location') && !locating && (
                  <Ionicons name="checkmark-circle" size={20} color="#0F172A" />
                )}
              </TouchableOpacity>

              {/* Choose on map */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => (mapMode ? setMapMode(false) : handleChooseOnMap())}
                style={[styles.placeRow, mapMode && styles.placeRowActive, webReset]}
              >
                <View style={[styles.placeIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="map" size={18} color="#059669" />
                </View>
                <View style={styles.placeCol}>
                  <Text variant="body" weight="bold" color="#0F172A">
                    Choose on map
                  </Text>
                  <Text variant="caption" color="#64748B">
                    Drop the pin on your exact spot
                  </Text>
                </View>
                <Ionicons
                  name={mapMode ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color="#CBD5E1"
                />
              </TouchableOpacity>

              {mapMode && (
                <View style={styles.mapSection}>
                  <View style={styles.mapContainer}>
                    <LocationPickerMap initial={mapCoords} onPick={handleMapPick} />
                    <View style={styles.mapBadge}>
                      <Ionicons name="location-outline" size={14} color="#059669" />
                      <Text variant="caption" weight="bold" color="#0F172A">
                        {snappedArea}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.mapHelper}>
                    <Ionicons name="map-outline" size={13} color="#94A3B8" />
                    <Text variant="caption" color="#94A3B8">
                      Drag the pin or tap anywhere on the map
                    </Text>
                  </View>
                </View>
              )}

              {/* Saved places */}
              <View style={styles.section}>
                <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.sectionLabel}>
                  SAVED ADDRESSES
                </Text>
                {SAVED_PLACES.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    activeOpacity={0.8}
                    onPress={() => selectOption({ label: p.label, address: p.address })}
                    style={[styles.placeRow, isPicked(p.label) && styles.placeRowActive, webReset]}
                  >
                    <View style={[styles.placeIcon, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name={p.icon as any} size={16} color="#059669" />
                    </View>
                    <View style={styles.placeCol}>
                      <Text variant="body" weight="bold" color="#0F172A">
                        {p.label}
                      </Text>
                      <Text variant="caption" color="#64748B">
                        {p.address}
                      </Text>
                    </View>
                    {isPicked(p.label) && (
                      <Ionicons name="checkmark-circle" size={20} color="#0F172A" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Nearby areas */}
              <View style={styles.section}>
                <Text variant="caption" weight="semibold" color="#94A3B8" style={styles.sectionLabel}>
                  NEARBY AREAS
                </Text>
                <View style={styles.areaGrid}>
                  {QUICK_AREAS.map((a) => (
                    <TouchableOpacity
                      key={a}
                      activeOpacity={0.85}
                      onPress={() => selectOption({ label: a, address: a })}
                      style={[styles.areaTile, isPicked(a) && styles.areaTileActive, webReset]}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        color={isPicked(a) ? '#FFFFFF' : '#334155'}
                        numberOfLines={1}
                      >
                        {a}
                      </Text>
                      <Text
                        variant="caption"
                        color={isPicked(a) ? '#E0F2FE' : '#94A3B8'}
                        numberOfLines={1}
                      >
                        {AREA_JOB_COUNT[a] ?? 0} jobs
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={mapMode ? `Use ${snappedArea}` : `Show jobs in ${picked.label}`}
            fullWidth
            onPress={confirm}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerCol: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.xl,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: Colors.surface,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  placeRowActive: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  placeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeCol: {
    flex: 1,
  },
  noResults: {
    marginTop: Spacing.xs,
  },
  mapSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  mapContainer: {
    height: 300,
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
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  areaTile: {
    flexBasis: '47%',
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  areaTileActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});