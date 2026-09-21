import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button } from '../../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useUserModeStore } from '../../../src/store/userModeStore';
import { useApplicationsStore } from '../../../src/store/applicationsStore';
import { useNotificationsStore } from '../../../src/store/notificationsStore';
import { useRatingsStore } from '../../../src/store/ratingsStore';
import { useWalletStore } from '../../../src/store/walletStore';

interface MenuItem {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
  color?: string;
  onPress?: () => void;
}

export default function WorkerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { toggleMode } = useUserModeStore();
  const applications = useApplicationsStore((s) => s.applications);
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);
  const received = useRatingsStore((s) => s.received);
  const totalEarned = useWalletStore((s) => s.totalEarned);
  const upiId = useWalletStore((s) => s.upiId);

  const displayName = user?.name?.trim() || 'WorkGo User';
  const displayPhone = user?.phone || '';
  const initial = displayName.trim().charAt(0).toUpperCase();

  const jobsDone = user?.completedJobs ?? applications.filter((a) => a.status === 'COMPLETED').length;
  const receivedValues = Object.values(received);
  const avgRating =
    user?.rating
      ? Number(user.rating).toFixed(1)
      : receivedValues.length > 0
      ? (receivedValues.reduce((sum, r) => sum + r.stars, 0) / receivedValues.length).toFixed(1)
      : 'New';
  const earned = totalEarned.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const kycCount = [
    Boolean(displayName),
    Boolean(displayPhone),
    Boolean(upiId),
    Boolean(user?.location?.city || user?.location?.address),
  ].filter(Boolean).length;
  const kycLabel = `${kycCount} of 4 done`;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(employer)/(tabs)/home');
  };

  const menuJobs: MenuItem[] = [
    { icon: 'briefcase-outline', label: 'My Bookings', onPress: () => router.push('/(worker)/bookings') },
    { icon: 'document-text-outline', label: 'My Applications', onPress: () => router.push('/(worker)/applications') },
    { icon: 'wallet-outline', label: 'Wallet', value: `₹${earned}`, onPress: () => router.push('/(worker)/(tabs)/wallet') },
    { icon: 'gift', label: 'Refer & Earn', badge: '₹100', onPress: () => router.push('/(worker)/refer') },
  ];

  const menuAccount: MenuItem[] = [
    { icon: 'person-outline', label: 'Personal Details', onPress: () => router.push('/(worker)/edit-profile') },
    { icon: 'shield-checkmark', label: 'KYC & Documents', value: kycLabel, onPress: () => router.push('/(worker)/kyc') },
    { icon: 'notifications', label: 'Notifications', badge: unreadCount > 0 ? String(unreadCount) : undefined, onPress: () => router.push('/(worker)/notifications') },
    { icon: 'location-outline', label: 'Address', onPress: () => router.push('/(worker)/address') },
  ];

  const menuSupport: MenuItem[] = [
    { icon: 'help', label: 'Help & Support', onPress: () => router.push('/(worker)/help') },
    { icon: 'info', label: 'About Gigro', value: 'v1.0.0', onPress: () => router.push('/(worker)/about') },
    { icon: 'star', label: 'Rate Us', onPress: () => Alert.alert('Rate Gigro', 'We’d love your feedback on the App Store and Play Store.') },
    { icon: 'shield-checkmark', label: 'Privacy Policy', onPress: () => router.push({ pathname: '/(worker)/legal', params: { page: 'privacy' } }) },
    { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => router.push({ pathname: '/(worker)/legal', params: { page: 'terms' } }) },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerTitleWrap}>
        <Text variant="h2" weight="bold" color="#0F172A">
          Profile
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="h1" weight="heavy" color="#0F172A">
            {initial}
          </Text>
        </View>
        <View style={styles.headerDetails}>
          <Text variant="h2" weight="bold" color="#0F172A" numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.headerMetaRow}>
            <Text variant="bodySm" color={Colors.textSecondary}>
              {displayPhone ? `+91 ${displayPhone}` : 'Verify your phone to get started'}
            </Text>
            {user?.isVerified && (
              <View style={styles.verifiedChip}>
                <Ionicons name="shield-checkmark" size={12} color="#0F9D58" />
                <Text variant="caption" weight="semibold" color="#0F9D58">
                  Verified
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editProfileRow} activeOpacity={0.6} onPress={() => router.push('/(worker)/edit-profile')}>
            <Ionicons name="person-outline" size={14} color="#0F172A" />
            <Text variant="bodySm" weight="bold" color="#0F172A">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            {jobsDone}
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Jobs Done
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            {avgRating === 'New' ? 'New' : `${avgRating}★`}
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Rating
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            ₹{earned}
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Earned
          </Text>
        </View>
      </View>

      <MenuCard title="Jobs & Money" items={menuJobs} />
      <MenuCard title="Account" items={menuAccount} />
      <MenuCard title="Support" items={menuSupport} />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Switch to Employer Mode"
          variant="outline"
          size="md"
          fullWidth
          onPress={handleSwitchMode}
        />
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.6}>
          <Text variant="bodySm" weight="medium" color="#EF4444">
            Log out
          </Text>
        </TouchableOpacity>
      </View>
      <Text variant="caption" color={Colors.textMuted} style={styles.footer}>
        Gigro v1.0.0 • Made with care
      </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuCard({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.menuSection}>
      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.menuTitle}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.6}
            disabled={!item.onPress}
            onPress={item.onPress}
          >
            <View style={[styles.menuRow, index === items.length - 1 && styles.lastRow]}>
              <View style={[styles.menuIcon, item.color ? { backgroundColor: '#EFF6FF' } : undefined]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.color ?? '#475569'}
                />
              </View>
              <View style={styles.menuMiddle}>
                <Text variant="body" weight="semibold" color="#0F172A">
                  {item.label}
                </Text>
              </View>
              {item.value && (
                <Text variant="bodySm" weight="bold" color={Colors.textSecondary}>
                  {item.value}
                </Text>
              )}
              {item.badge && (
                <View style={styles.miniBadge}>
                  <Text variant="caption" weight="bold" color="#FFFFFF">
                    {item.badge}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.menuChevron} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerTitleWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF0F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  headerDetails: {
    flex: 1,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  editProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EEF2F7',
  },
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuTitle: {
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuMiddle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  miniBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: Spacing.xs,
  },
  menuChevron: {
    marginLeft: 2,
  },
  actions: {
    marginTop: Spacing.xl,
  },
  logoutRow: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    paddingVertical: 4,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});