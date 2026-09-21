import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Colors, Spacing } from '../../src/constants/theme';
import { verifyPhoneOtp } from '../../src/services/phoneAuth';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

export default function OtpScreen() {
  const { phone, mode, devOtp, name, city } = useLocalSearchParams<{
    phone: string;
    mode?: string;
    devOtp?: string;
    name?: string;
    city?: string;
  }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const setMode = useUserModeStore((state) => state.setMode);

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit code');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await verifyPhoneOtp(phone, otp, {
        role: mode === 'employer' ? 'employer' : 'worker',
        name,
        city,
      });

      await login(res.user, res.token);
      await setMode(res.user.role);

      router.replace({
        pathname: '/(auth)/role-selection',
        params: { initialRole: res.user.role },
      });
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Could not verify OTP. Please try again.');
    }
  };

  const devHint = devOtp ? String(devOtp) : null;

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
            Verify OTP
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            Enter the code sent to{' '}
            <Text variant="body" weight="bold" color="#0F172A">
              +91 {phone || 'XXXXX XXXXX'}
            </Text>
          </Text>

          <View style={styles.form}>
            <Input
              placeholder="····"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ''));
                if (error) setError('');
              }}
              error={error}
              style={styles.otpInput}
            />

            {devHint ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setOtp(devHint)}
                style={styles.demoChip}
              >
                <Text variant="caption" color="#059669">
                  Demo code:{' '}
                  <Text variant="caption" weight="bold" color="#047857">
                    {devHint}
                  </Text>
                  {'  ·  Tap to fill'}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Button
              title="Verify & Continue"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleVerify}
              style={styles.button}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySm" color={Colors.textSecondary} align="center">
            Didn't receive code?{' '}
            <Text variant="bodySm" weight="bold" color="#0F172A">
              Resend OTP
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
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 12,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  demoChip: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: 'auto',
  },
});