import React, { useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { sendPhoneOtp } from '../../src/services/phoneAuth';
import { updateMe } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

const CITIES = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Vellore',
  'Erode',
  'Thoothukudi',
  'Kanyakumari',
  'Dindigul',
  'Karur',
  'Kanchipuram',
];

export default function RegisterScreen() {
  const { complete, phone: verifiedPhone, mode } = useLocalSearchParams<{
    complete?: string;
    phone?: string;
    mode?: string;
  }>();

  const isCompleteOnly = complete === '1';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(verifiedPhone ?? '');
  const [city, setCity] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cityError, setCityError] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const phoneRef = useRef<TextInput>(null);

  const setMode = useUserModeStore((state) => state.setMode);

  const goAfterProfile = async (role: 'worker' | 'employer') => {
    router.replace({
      pathname: '/(auth)/role-selection',
      params: { initialRole: role },
    });
  };

  const handleCompleteProfile = async () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('Please enter your full name');
      hasError = true;
    }
    if (!city) {
      setCityError('Please select your city');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    setError('');
    try {
      const updated = await updateMe({ name: name.trim(), city });
      const token = useAuthStore.getState().token;
      if (token) {
        await useAuthStore.getState().login(updated, token);
      }
      const role = updated.role;
      await setMode(role);
      setLoading(false);
      await goAfterProfile(role);
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Could not save your profile. Please try again.');
    }
  };

  const handleRegister = async () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('Please enter your full name');
      hasError = true;
    }
    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      hasError = true;
    }
    if (!city) {
      setCityError('Please select your city');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const res = await sendPhoneOtp(phone, 'register');
      setLoading(false);
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone,
          name: name.trim(),
          city,
          mode: 'worker',
          devOtp: res.devOtp ?? '',
        },
      });
    } catch (e: any) {
      setLoading(false);
      setError(e?.message || 'Could not send OTP. Check the server is running.');
    }
  };

  const submit = isCompleteOnly ? handleCompleteProfile : handleRegister;
  const role = isCompleteOnly ? (mode === 'employer' ? 'employer' : 'worker') : 'worker';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={styles.scrollContent}
      >
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
            {isCompleteOnly ? 'Complete your profile' : 'Create your account'}
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            {isCompleteOnly
              ? 'We found a new number. Finish your profile to get started'
              : 'Join Gigro and start earning from jobs nearby today'}
          </Text>

          <View style={styles.form}>
            <Input
              placeholder="Full name"
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              onSubmitEditing={() => (isCompleteOnly ? Keyboard.dismiss() : phoneRef.current?.focus())}
              error={nameError}
            />

            {!isCompleteOnly && (
              <Input
                inputRef={phoneRef}
                placeholder="Mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  if (phoneError) setPhoneError('');
                }}
                error={phoneError}
              />
            )}

            {isCompleteOnly && verifiedPhone ? (
              <View style={styles.verifiedPhone}>
                <Icon name="checkmark-circle" size={18} color="#059669" />
                <Text variant="bodySm" color="#0F172A">
                  +91 {verifiedPhone}
                </Text>
              </View>
            ) : null}

            {/* City selector */}
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss();
                  setCityFocused(true);
                  setCityModalVisible(true);
                }}
                onPressOut={() => setCityFocused(false)}
                style={[
                  styles.cityField,
                  cityFocused && styles.cityFieldFocused,
                  cityError ? styles.cityFieldError : undefined,
                ]}
              >
                <Icon name="location-outline" size={20} color="#94A3B8" />
                <Text
                  variant="body"
                  style={[styles.cityText, !city && styles.cityPlaceholder]}
                >
                  {city || 'Select your city'}
                </Text>
                <Icon name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
              {cityError ? (
                <Text variant="caption" color={Colors.danger} style={styles.errorText}>
                  {cityError}
                </Text>
              ) : null}
            </View>

            {error ? (
              <Text variant="caption" color={Colors.danger} style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            <Button
              title={isCompleteOnly ? 'Create Profile' : 'Create Account & Send OTP'}
              size="lg"
              fullWidth
              loading={loading}
              onPress={submit}
              style={styles.button}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySm" color={Colors.textSecondary} align="center">
            Already have an account?{' '}
            <Text
              variant="bodySm"
              weight="bold"
              color="#0F172A"
              onPress={() => router.push('/(auth)/login')}
            >
              Login here
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* City picker bottom sheet */}
      <BottomSheet
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        maxHeightRatio={0.7}
      >
        <Text variant="h3" weight="bold" color="#0F172A">
          Select City
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          We show nearby work based on your city
        </Text>
        <ScrollView style={styles.cityList} contentContainerStyle={styles.cityListContent}>
          {CITIES.map((c) => {
            const selected = city === c;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.7}
                style={styles.cityRow}
                onPress={() => {
                  setCity(c);
                  if (cityError) setCityError('');
                  setCityModalVisible(false);
                }}
              >
                <Icon
                  name="location-outline"
                  size={18}
                  color={selected ? '#0F172A' : '#94A3B8'}
                />
                <Text
                  variant="body"
                  weight={selected ? 'bold' : 'regular'}
                  color={selected ? '#0F172A' : '#0F172A'}
                  style={styles.cityRowName}
                >
                  {c}
                </Text>
                {selected && <Icon name="checkmark" size={18} color="#0F172A" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Button
          title="Done"
          variant="outline"
          fullWidth
          onPress={() => setCityModalVisible(false)}
          style={styles.modalDone}
        />
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
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
    width: '100%',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  form: {
    marginTop: Spacing.xl,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  cityField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    gap: Spacing.sm,
  },
  cityFieldFocused: {
    borderColor: Colors.primary,
  },
  cityFieldError: {
    borderColor: Colors.danger,
  },
  cityText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  cityPlaceholder: {
    color: Colors.textMuted,
  },
  verifiedPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  errorText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    marginTop: 'auto',
  },
  cityList: {
    marginTop: Spacing.md,
  },
  cityListContent: {
    paddingBottom: Spacing.sm,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cityRowName: {
    flex: 1,
  },
  modalDone: {
    marginTop: Spacing.lg,
  },
});