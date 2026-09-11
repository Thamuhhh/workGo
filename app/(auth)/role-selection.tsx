import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '../../src/components/ui';
import { Colors, BorderRadius, Spacing, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';
import { UserRole } from '../../src/types';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const login = useAuthStore((state) => state.login);
  const setMode = useUserModeStore((state) => state.setMode);

  const handleContinue = async () => {
    // Generate mock authenticated user for Step 1 verification
    const mockUser = {
      _id: 'mock_user_' + Date.now(),
      name: selectedRole === 'worker' ? 'Arun Kumar' : 'Sri Krishna Catering',
      phone: '9876543210',
      role: selectedRole,
      location: {
        address: 'Kanchipuram, Tamil Nadu',
        latitude: 12.8342,
        longitude: 79.7036,
        city: 'Kanchipuram',
      },
      skills: selectedRole === 'worker' ? ['Catering', 'Serving', 'Event Support'] : [],
      rating: 4.8,
      totalRatings: 18,
      completedJobs: selectedRole === 'worker' ? 24 : 12,
      isVerified: true,
    };

    await login(mockUser, 'mock_jwt_token_sample');
    await setMode(selectedRole);

    if (selectedRole === 'worker') {
      router.replace('/(worker)/(tabs)/home');
    } else {
      router.replace('/(employer)/home');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold" style={styles.title}>
          How do you want to use WorkGo?
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          You can also switch modes anytime from your profile settings.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* Worker Option */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole('worker')}
          style={[
            styles.optionCard,
            selectedRole === 'worker' && styles.optionCardSelected,
          ]}
        >
          <View style={styles.badgeWrapper}>
            <Ionicons name="construct-outline" size={24} color="#2B3A60" />
          </View>
          <View style={styles.optionDetails}>
            <Text variant="h3" weight="bold" style={styles.optionTitle}>
              I Want to Work
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary}>
              Find nearby temporary catering, waiter, cleaning, and helper gigs. Earn daily.
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedRole === 'worker' && styles.radioCircleActive,
            ]}
          >
            {selectedRole === 'worker' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Employer Option */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole('employer')}
          style={[
            styles.optionCard,
            selectedRole === 'employer' && styles.optionCardSelected,
          ]}
        >
          <View style={styles.badgeWrapper}>
            <Ionicons name="business-outline" size={24} color="#2563EB" />
          </View>
          <View style={styles.optionDetails}>
            <Text variant="h3" weight="bold" style={styles.optionTitle}>
              I Want to Hire
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary}>
              Post temporary jobs for weddings, events, catering, stores, and warehouses.
            </Text>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedRole === 'employer' && styles.radioCircleActive,
            ]}
          >
            {selectedRole === 'employer' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title={`Continue as ${selectedRole === 'worker' ? 'Worker' : 'Employer'}`}
          size="lg"
          fullWidth
          onPress={handleContinue}
        />
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
  optionsContainer: {
    marginVertical: Spacing.xxl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#ECF1F9', // Light indigo highlight
  },
  badgeWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  optionTitle: {
    marginBottom: Spacing.xxs,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primaryDark,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryDark,
  },
  footer: {
    marginBottom: Spacing.xl,
  },
});
