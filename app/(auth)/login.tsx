import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="h2" weight="bold" style={styles.title}>
            Enter Mobile Number
          </Text>
          <Text variant="body" color={Colors.textSecondary}>
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
          <Text variant="caption" color={Colors.textMuted} align="center">
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
  footer: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
