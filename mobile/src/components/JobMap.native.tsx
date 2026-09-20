import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { router } from 'expo-router';
import { SampleJob } from '../data/sampleJobs';

interface JobMapProps {
  jobs: SampleJob[];
}

// Free OpenStreetMap raster tiles — no API key required.
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
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
};

const ArrayColorStyle = 'mapbox://styles/mapbox/streets-v12';

export function NativeJobMap({ jobs }: JobMapProps) {
  // Native-only file: maplibre is never resolved on web.
  const MapLibre = require('@maplibre/maplibre-react-native');

  const { MapView, Camera, PointAnnotation, UserLocation } = MapLibre;

  const center = jobs.length
    ? [
        jobs.reduce((s, j) => s + j.longitude, 0) / jobs.length,
        jobs.reduce((s, j) => s + j.latitude, 0) / jobs.length,
      ]
    : [80.211, 12.99];

  return (
    <View style={styles.card}>
      <MapView
        style={styles.map}
        mapStyle={OSM_STYLE}
        logoEnabled={false}
        attributionEnabled={true}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: center,
            zoomLevel: 12,
            animationDuration: 0,
          }}
        />
        <UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          androidRenderMode="normal"
        />
        {jobs.map((job) => (
          <PointAnnotation
            key={job.id}
            id={job.id}
            coordinate={[job.longitude, job.latitude]}
            anchor={{ x: 0.5, y: 1 }}
            onSelected={() =>
              router.push({
                pathname: '/(worker)/job-detail',
                params: { jobId: job.id },
              })
            }
          >
            <View style={styles.marker}>
              <View style={styles.markerDot} />
              <RNText style={styles.markerLabel} numberOfLines={1}>
                {job.title}
              </RNText>
            </View>
          </PointAnnotation>
        ))}
      </MapView>
      <View style={styles.scrim} pointerEvents="none">
        <RNText style={styles.scrimText}>Tap a marker to open the job</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 420,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    maxWidth: 96,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  markerLabel: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#0F172A',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  scrim: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.66)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  scrimText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
});