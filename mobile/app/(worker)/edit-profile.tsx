import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Text, Input, Button } from '../../src/components/ui';
import { Icon } from '../../src/components/Icon';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

const CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Kanyakumari',
  'Dindigul', 'Karur',
];

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const initial = (user?.name || 'Arun Kumar').trim().charAt(0).toUpperCase();

  const [name, setName] = useState(user?.name || 'Arun Kumar');
  const [phone] = useState(user?.phone || '9876543210');
  const [city, setCity] = useState('Chennai');
  const [nameError, setNameError] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <TouchableOpacity activeOpacity={0.7} style={styles.avatarWrap}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text variant="h1" weight="heavy" color="#0F172A">
                {initial}
              </Text>
            </View>
            <View style={styles.cameraBadge}>
              <Icon name="person" size={13} color="#FFFFFF" weight="bold" />
            </View>
          </View>
          <Text variant="caption" color={Colors.textMuted} style={styles.changePhoto}>
            Change photo
          </Text>
        </TouchableOpacity>

        {/* Fields */}
        <View style={styles.form}>
          <Input
            label="Full name"
            placeholder="Enter your name"
            autoCapitalize="words"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (nameError) setNameError('');
            }}
            error={nameError}
            style={styles.field}
          />

          <Input
            label="Phone number"
            value={`+91 ${phone}`}
            editable={false}
            style={[styles.field, styles.phoneField]}
          />
          <Text variant="caption" color={Colors.textMuted} style={styles.phoneNote}>
            Contact support to change phone number
          </Text>

          <View style={styles.fieldWrap}>
            <Text variant="bodySm" weight="semibold" color={Colors.textSecondary} style={styles.label}>
              City
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCityModalVisible(true)}
              style={styles.cityField}
            >
              <Icon name="location-outline" size={18} color="#94A3B8" />
              <Text variant="body" style={[styles.cityText, !city && styles.cityPlaceholder]}>
                {city || 'Select city'}
              </Text>
              <Icon name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save */}
        <Button
          title="Save Changes"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* City picker */}
      <BottomSheet
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        maxHeightRatio={0.7}
      >
        <Text variant="h3" weight="bold" color="#0F172A">
          Select City
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Your primary city for job matches
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
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    width: 84,
    height: 84,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  changePhoto: {
    marginTop: Spacing.sm,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  phoneField: {
    opacity: 0.7,
  },
  phoneNote: {
    marginTop: -8,
    marginBottom: Spacing.md,
    marginLeft: 2,
  },
  fieldWrap: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
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
  cityText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  cityPlaceholder: {
    color: Colors.textMuted,
  },
  saveBtn: {
    marginTop: Spacing.md,
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