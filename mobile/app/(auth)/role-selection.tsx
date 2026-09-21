import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Button } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';
import { UserRole } from '../../src/types';

const OPTIONS = [
  {
    role: 'worker' as UserRole,
    icon: 'construct-outline',
    title: 'I Want to Work',
    desc: 'Find nearby catering, waiter, cleaning and helper gigs. Earn daily.',
    label: 'Worker',
  },
  {
    role: 'employer' as UserRole,
    icon: 'business-outline',
    title: 'I Want to Hire',
    desc: 'Post temporary jobs for weddings, events, catering, stores and warehouses.',
    label: 'Employer',
  },
];

export default function RoleSelectionScreen() {
  const { initialRole } = useLocalSearchParams<{ initialRole?: string }>();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole === 'employer' ? 'employer' : 'worker');
  const login = useAuthStore((state) => state.login);
  const setMode = useUserModeStore((state) => state.setMode);
  const inline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inline, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [inline]);

  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    bounce.setValue(0);
    Animated.spring(bounce, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
  }, [selectedRole, bounce]);

  const handleContinue = async () => {
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
      router.replace('/(employer)/(tabs)/home');
    }
  };

  const selected = OPTIONS.find((o) => o.role === selectedRole);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <FadeSlide>
        <View style={styles.headRow}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
            GET STARTED
          </Text>
          <View style={styles.headRule} />
        </View>
        <Text variant="h2" weight="bold" color="#0F172A" style={styles.title}>
          How do you want to use Gigro?
        </Text>
        <Text variant="bodySm" color={Colors.textSecondary}>
          Choose your mode, then switch anytime from Profile settings.
        </Text>
      </FadeSlide>

      <View style={styles.optionsContainer}>
        {OPTIONS.map((opt, i) => {
          const active = selectedRole === opt.role;
          return (
            <FadeSlide key={opt.role} delay={120 + i * 90}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedRole(opt.role)}
                style={[styles.optionCard, active && styles.optionCardSelected]}
              >
                <Animated.View
                  style={[
                    styles.badgeWrapper,
                    active && styles.badgeWrapperActive,
                    { transform: [{ scale: active ? inline : 1 }] },
                  ]}
                >
                  <Ionicons name={opt.icon} size={22} color={active ? '#FFFFFF' : '#0F172A'} />
                </Animated.View>

                <View style={styles.optionDetails}>
                  <Text variant="body" weight="bold" color="#0F172A">
                    {opt.title}
                  </Text>
                  <Text variant="caption" color={Colors.textSecondary} style={styles.optionDesc}>
                    {opt.desc}
                  </Text>
                </View>

                <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                  {active && (
                    <Animated.View
                      style={[
                        styles.radioDot,
                        { transform: [{ scale: bounce.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </FadeSlide>
          );
        })}
      </View>

      <FadeSlide delay={320}>
        <View style={styles.footer}>
          <View style={styles.selectionRow}>
            <Text variant="caption" color={Colors.textSecondary}>
              Continuing as
            </Text>
            <View style={styles.selectionChip}>
              <Text variant="caption" weight="bold" color="#0F172A">
                {selected?.title.split(' ').slice(2).join(' ')}
              </Text>
            </View>
          </View>
          <Button
            title={`Continue as ${selected?.label}`}
            size="lg"
            fullWidth
            onPress={handleContinue}
          />
        </View>
      </FadeSlide>
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
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.xxxl,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF2F7',
    marginLeft: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  optionsContainer: {
    marginVertical: Spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md + 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  optionCardSelected: {
    borderColor: '#0F172A',
    backgroundColor: '#FCFCFD',
  },
  badgeWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  badgeWrapperActive: {
    backgroundColor: '#0F172A',
  },
  optionDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  optionDesc: {
    marginTop: 3,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#0F172A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
  },
  footer: {
    marginBottom: Spacing.xl,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  selectionChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
});