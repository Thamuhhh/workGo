import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { LoginCartoon } from '../../src/components/AuthCartoon';
import { Colors, Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
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
        params: { phone },
      });
    }, 600);
  };

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.illustration}>
          <LoginCartoon />
        </View>

        <View style={styles.header}>
          <Text variant="h2" weight="bold" align="center" style={styles.title}>
            Enter Mobile Number
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center">
            We'll send you a 4-digit OTP to verify your account
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Mobile Phone"
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, ''));
              if (error) setError('');
            }}
            error={error}
          />

          <Button
            title="Send OTP"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSendOtp}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySm" color={Colors.textSecondary} align="center">
            New to WorkGo?{' '}
            <Text
              variant="bodySm"
              weight="bold"
              color="#0277F4"
              onPress={() => router.push('/(auth)/register')}
            >
              Create account
            </Text>
          </Text>
          <Text variant="caption" color={Colors.textMuted} align="center" style={styles.terms}>
            By continuing, you agree to WorkGo Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  footer: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  terms: {
    marginTop: Spacing.xs,
  },
});