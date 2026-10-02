import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Icon } from './Icon';
import { pickerMapHtml } from './webLeaflet';

export interface LocationPickerMapProps {
  initial: [number, number]; // [lng, lat]
  onPick: (coords: [number, number]) => void;
}

export function LocationPickerMap({ initial, onPick }: LocationPickerMapProps) {
  const webRef = useRef<WebView>(null);
  const [coords, setCoords] = useState<[number, number]>(initial);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);

  const html = useMemo(() => pickerMapHtml(initial), [initial]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === 'pick' && typeof data.lng === 'number' && typeof data.lat === 'number') {
          const next: [number, number] = [data.lng, data.lat];
          setCoords(next);
          onPick(next);
        }
      } catch {
        // ignore malformed messages
      }
    },
    [onPick]
  );

  const flyTo = (lat: number, lng: number, zoom = 16) => {
    webRef.current?.injectJavaScript(
      `window.WGO && window.WGO.flyTo(${lat}, ${lng}, ${zoom}); true;`
    );
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
      if (ready) flyTo(current[1], current[0], 16);
    } catch {
      // silently ignore — user can still move the map
    } finally {
      setLocating(false);
    }
  };

  const zoom = (delta: number) => {
    webRef.current?.injectJavaScript(
      `window.WGO && (window.WGO.${delta > 0 ? 'zoomIn' : 'zoomOut'}()); true;`
    );
  };

  return (
    <View style={styles.host}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.host}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onLoadEnd={() => setReady(true)}
        setSupportMultipleWindows={false}
        overScrollMode="never"
      />

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