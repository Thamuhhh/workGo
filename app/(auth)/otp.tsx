import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { OtpCartoon } from '../../src/components/AuthCartoon';
import { Colors, Spacing } from '../../src/constants/theme';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit code (Use 1234 for MVP demo)');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/role-selection');
    }, 600);
  };

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.illustration}>
        <OtpCartoon />
      </View>

      <View style={styles.header}>
        <Text variant="h2" weight="bold" align="center" style={styles.title}>
          Verify OTP
        </Text>
        <Text variant="body" color={Colors.textSecondary} align="center">
          Enter the code sent to +91 {phone || 'XXXXX XXXXX'}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="One Time Password (OTP)"
          placeholder="e.g. 1234"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            if (error) setError('');
          }}
          error={error}
        />

        <Button
          title="Verify & Continue"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleVerify}
          style={styles.button}
        />
      </View>

      <View style={styles.resendSection}>
        <Text variant="bodySm" color={Colors.textSecondary} align="center">
          Didn't receive code? <Text variant="bodySm" color="#0F172A" weight="bold">Resend OTP</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  illustration: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  form: {
    marginTop: Spacing.sm,
  },
  button: {
    marginTop: Spacing.md,
  },
  resendSection: {
    marginTop: Spacing.xl,
  },
});