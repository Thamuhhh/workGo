import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone, mode: mode ?? 'worker' },
      });
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brand}>
          <Text variant="h1" weight="heavy" color="#0F172A">
            Gig<Text variant="h1" weight="heavy" color="#0F172A">ro</Text>
          </Text>
          <Text variant="bodySm" weight="medium" color="#64748B" style={styles.tagline}>
            Work nearby. Earn today.
          </Text>
        </View>

        {/* Center form */}
        <View style={styles.center}>
          <Text variant="h2" weight="bold" align="center" color="#0F172A">
            Login
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>

          <View style={styles.form}>
            <Input
              placeholder="Mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^0-9]/g, ''));
                if (error) setError('');
              }}
              error={error}
              style={styles.phoneInput}
            />

            <Button
              title="Get OTP"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleSendOtp}
              style={styles.button}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySm" color={Colors.textSecondary} align="center">
            New to Gigro?{' '}
            <Text
              variant="bodySm"
              weight="bold"
              color="#0F172A"
              onPress={() => router.push('/(auth)/register')}
            >
              Create account
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  tagline: {
    marginTop: 4,
  },
  center: {
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '100%',
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  form: {
    marginTop: Spacing.xl,
  },
  phoneInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: Spacing.md,
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: 'auto',
  },
});