import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

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
  const { MapView, Camera, PointAnnotation } = MapLibre;
  const [coords, setCoords] = useState<[number, number]>(initial);

  return (
    <View style={styles.host}>
      <MapView style={styles.host} mapStyle={OSM_STYLE} logoEnabled={false}>
        <Camera
          defaultSettings={{
            centerCoordinate: initial,
            zoomLevel: 13,
            animationDuration: 0,
          }}
        />
        <PointAnnotation
          id="location-pin"
          coordinate={coords}
          draggable
          onDragEnd={(feature: any) => {
            const [lng, lat] = feature.geometry.coordinates as [number, number];
            setCoords([lng, lat]);
            onPick([lng, lat]);
          }}
        >
          <View style={styles.pin}>
            <View style={styles.pinDot} />
          </View>
        </PointAnnotation>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});