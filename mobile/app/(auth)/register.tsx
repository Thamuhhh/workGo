import React, { useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

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
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cityError, setCityError] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<TextInput>(null);

  const handleRegister = () => {
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
            Create your account
          </Text>
          <Text variant="body" color={Colors.textSecondary} align="center" style={styles.subtitle}>
            Join Gigro and start earning from jobs nearby today
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
              onSubmitEditing={() => phoneRef.current?.focus()}
              error={nameError}
            />

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

            <Button
              title="Create Account & Send OTP"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleRegister}
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