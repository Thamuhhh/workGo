import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold" style={styles.title}>
          Verify OTP
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
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
          Didn't receive code? <Text variant="bodySm" color={Colors.primaryDark} weight="bold">Resend OTP</Text>
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
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  form: {
    marginTop: Spacing.xxl,
  },
  button: {
    marginTop: Spacing.md,
  },
  resendSection: {
    marginBottom: Spacing.xl,
  },
});
