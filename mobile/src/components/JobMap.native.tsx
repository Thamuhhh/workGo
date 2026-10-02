import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { SampleJob } from '../data/sampleJobs';
import { jobsMapHtml } from './webLeaflet';

interface JobMapProps {
  jobs: SampleJob[];
}

export function NativeJobMap({ jobs }: JobMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (!jobs.length) return [80.211, 12.99];
    return [
      jobs.reduce((s, j) => s + j.longitude, 0) / jobs.length,
      jobs.reduce((s, j) => s + j.latitude, 0) / jobs.length,
    ];
  }, [jobs]);

  const html = useMemo(
    () =>
      jobsMapHtml(
        jobs.map((j) => ({
          id: j.id,
          title: j.title,
          latitude: j.latitude,
          longitude: j.longitude,
        })),
        center,
        12
      ),
    [jobs, center]
  );

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'job' && data.id) {
        router.push({
          pathname: '/(worker)/job-detail',
          params: { jobId: data.id },
        });
      }
    } catch {
      // ignore malformed messages
    }
  }, []);

  return (
    <View style={styles.card}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        setSupportMultipleWindows={false}
        overScrollMode="never"
      />
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
    backgroundColor: '#F1F5F9',
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