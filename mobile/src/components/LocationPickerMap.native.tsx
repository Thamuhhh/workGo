import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Icon } from './Icon';
import { hasMapKey, maptilerVectorStyle } from '../services/maptiler';

export interface LocationPickerMapProps {
  initial: [number, number]; // [lng, lat]
  onPick: (coords: [number, number]) => void;
}

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'osm', type: 'raster' as const, source: 'osm' },
  ],
};

// Native-only file: maplibre is never resolved on web.
const MapLibre = require('@maplibre/maplibre-react-native');

export function LocationPickerMap({ initial, onPick }: LocationPickerMapProps) {
  const { MapView, Camera } = MapLibre;
  const [coords, setCoords] = useState<[number, number]>(initial);
  const [locating, setLocating] = useState(false);
  const cameraRef = useRef<any>(null);

  const handleRegionDidChange = (feature: any) => {
    const center =
      feature?.geometry?.coordinates ??
      feature?.properties?.center ??
      feature?.features?.[0]?.center;
    if (!Array.isArray(center) || center.length < 2) return;
    const next: [number, number] = [center[0], center[1]];
    setCoords(next);
    onPick(next);
  };

  const locate = async () => {
    if (locating) return;
    setLocating(true);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== Location.PermissionStatus.GRANTED) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== Location.PermissionStatus.GRANTED) return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const current: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      setCoords(current);
      onPick(current);
      cameraRef.current?.setCamera({
        centerCoordinate: current,
        zoomLevel: 16,
        animationDuration: 500,
      });
    } catch {
      // silently ignore — user can still move the map
    } finally {
      setLocating(false);
    }
  };

  const zoom = (delta: number) => {
    cameraRef.current?.setCamera({
      zoomLevel: (cameraRef.current?.getZoom?.() ?? 14.5) + delta,
      animationDuration: 200,
    });
  };

  return (
    <View style={styles.host}>
      <MapView
        style={styles.host}
        mapStyle={hasMapKey ? maptilerVectorStyle('positron') : OSM_STYLE}
        logoEnabled={false}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: coords,
            zoomLevel: 14.5,
            animationDuration: 0,
          }}
        />
      </MapView>

      <View style={styles.pinAnchor} pointerEvents="none">
        <View style={styles.pin}>
          <Icon name="location" size={36} color="#0F172A" />
          <View style={styles.pinDot} />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => zoom(1)}
          hitSlop={8}
          activeOpacity={0.85}
        >
          <Icon name="add" size={22} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => zoom(-1)}
          hitSlop={8}
          activeOpacity={0.85}
        >
          <Icon name="remove" size={22} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={locate}
          hitSlop={8}
          activeOpacity={0.85}
        >
          <Icon name={locating ? 'navigate' : 'navigate-outline'} size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  pinAnchor: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pin: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -2 }],
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 5,
  },
  pinDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    top: 13,
  },
  controls: {
    position: 'absolute',
    right: 12,
    top: '38%',
    zIndex: 10,
    elevation: 8,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});