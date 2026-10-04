import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Text } from './ui';
import { Colors, Spacing } from '../constants/theme';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // NetInfo rather than navigator.onLine/window.addEventListener: those are
    // DOM-only and this component sits above the ErrorBoundary, so a throw here
    // takes the whole app down with no recovery screen.
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable is null while probing; only call the device offline
      // when it has explicitly reported that it cannot reach the internet.
      setOnline(state.isInternetReachable !== false);
    });
    return () => unsubscribe();
  }, []);

  if (online) return null;

  return (
    <View style={styles.banner}>
      <Text variant="caption" weight="bold" color="#FFFFFF" align="center">
        You&apos;re offline — changes will sync when you reconnect.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});