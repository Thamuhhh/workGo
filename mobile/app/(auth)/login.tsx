import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { Colors, Spacing } from '../../src/constants/theme';
import { loginUser } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const setMode = useUserModeStore((state) => state.setMode);

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 6) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(phone, password);
      await login(res.user, res.token);
      await setMode(res.user.role);
      setLoading(false);
      router.replace(
        res.user.role === 'employer'
          ? '/(employer)/(tabs)/home'
          : '/(worker)/(tabs)/home'
      );
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Could not login. Please try again.');
    }
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
            Enter your mobile number and password
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
              style={styles.input}
            />

            <Input
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError('');
              }}
              rightIcon={
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              style={styles.input}
            />

            <Button
              title="Login"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleLogin}
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
  input: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: 'auto',
  },
});