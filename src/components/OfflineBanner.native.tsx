import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './ui';
import { Colors, Spacing } from '../constants/theme';

let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch {}

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!NetInfo) return;
    return NetInfo.addEventListener((state: any) => {
      setOnline(!!state.isConnected && state.isInternetReachable !== false);
    });
  }, []);

  if (online) return null;

  return (
    <View style={styles.banner}>
      <Text variant="caption" weight="bold" color="#FFFFFF" align="center">
        You're offline — changes will sync when you reconnect.
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