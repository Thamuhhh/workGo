import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './ui';
import { Colors, Spacing } from '../constants/theme';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
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