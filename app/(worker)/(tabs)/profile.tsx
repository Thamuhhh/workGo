import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Card, Button } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useUserModeStore } from '../../../src/store/userModeStore';

interface MenuItem {
  icon: string;
  label: string;
  color?: string;
  bg?: string;
  value?: string;
  badge?: string;
  highlight?: boolean;
  onPress?: () => void;
}

export default function WorkerProfileScreen() {
  const { user, logout } = useAuthStore();
  const { toggleMode } = useUserModeStore();

  const displayName = user?.name || 'Arun Kumar';
  const displayPhone = user?.phone || '9876543210';
  const initial = displayName.trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSwitchMode = async () => {
    await toggleMode();
    router.replace('/(employer)/home');
  };

  const menuJobs: MenuItem[] = [
    { icon: 'briefcase-outline', label: 'My Bookings', onPress: () => router.push('/(worker)/bookings') },
    { icon: 'document-text-outline', label: 'My Applications', onPress: () => router.push('/(worker)/applications') },
    { icon: 'wallet-outline', label: 'Wallet', value: '₹2,430', onPress: () => router.push('/(worker)/(tabs)/wallet') },
    {
      icon: 'gift',
      label: 'Refer & Earn',
      badge: '₹100',
      highlight: true,
      onPress: () => router.push('/(worker)/refer'),
    },
  ];

  const menuAccount: MenuItem[] = [
    { icon: 'person-outline', label: 'Personal Details' },
    { icon: 'shield-checkmark', label: 'KYC & Documents', value: '1 of 2' },
    { icon: 'notifications', label: 'Notifications', onPress: () => router.push('/(worker)/applications') },
    { icon: 'location-outline', label: 'Address' },
  ];

  const menuSupport: MenuItem[] = [
    { icon: 'help', label: 'Help & Support' },
    { icon: 'info', label: 'About WorkGo', value: 'v1.0.0' },
    { icon: 'star', label: 'Rate Us' },
    { icon: 'shield-checkmark', label: 'Privacy Policy' },
    { icon: 'document-text-outline', label: 'Terms of Service' },
  ];

  if (usePageLoading()) return <ScreenSkeleton variant="profile" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover Header */}
      <LinearGradient
        colors={['#0F172A', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.coverTop}>
          <View style={styles.avatar}>
            <Text variant="h1" weight="heavy" color={Colors.primary}>
              {initial}
            </Text>
          </View>
          <View style={styles.avatarDetails}>
            <Text variant="caption" color="rgba(255,255,255,0.6)">
              Good to see you!
            </Text>
            <Text variant="h2" weight="bold" color="#FFFFFF" numberOfLines={1}>
              {displayName}
            </Text>
            <Text variant="bodySm" color="rgba(255,255,255,0.7)">
              +91 {displayPhone}
            </Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={14} color="#4ADE80" />
              <Text variant="caption" color="rgba(255,255,255,0.75)">
                Verified Profile
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="settings" size={18} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text variant="h3" weight="bold" color="#FFFFFF">
              24
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.6)">
              Jobs Done
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text variant="h3" weight="bold" color="#FFFFFF">
              4.8★
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.6)">
              Rating
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text variant="h3" weight="bold" color="#FFFFFF">
              ₹9.6k
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.6)">
              Earned
            </Text>
          </View>
        </View>
      </LinearGradient>

      <MenuCard title="Jobs & Money" items={menuJobs} />
      <MenuCard title="Account" items={menuAccount} />
      <MenuCard title="Support" items={menuSupport} />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Switch to Employer Mode"
          variant="outline"
          size="lg"
          fullWidth
          onPress={handleSwitchMode}
          style={styles.switchBtn}
        />
        <Button
          title="Log Out"
          variant="danger"
          size="md"
          fullWidth
          onPress={handleLogout}
        />
      </View>
      <Text variant="caption" color={Colors.textMuted} style={styles.footer}>
        WorkGo v1.0.0 • Made with care
      </Text>
    </ScrollView>
  );
}

function MenuCard({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.menuSection}>
      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.menuTitle}>
        {title.toUpperCase()}
      </Text>
      <Card padding="xs" style={styles.menuCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            disabled={!item.onPress}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.menuRow,
                index === items.length - 1 && styles.lastRow,
                item.highlight && styles.menuRowHighlight,
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.highlight ? '#EFF6FF' : item.bg ?? '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.color ?? (item.highlight ? Colors.primary : '#0F172A')}
                />
              </View>
              <View style={styles.menuMiddle}>
                <Text variant="body" weight="semibold" color="#0F172A">
                  {item.label}
                </Text>
                {item.highlight && (
                  <Text variant="caption" color={Colors.primary}>
                    Invite friends, earn ₹100 each
                  </Text>
                )}
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
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  cover: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  decoCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarDetails: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    paddingVertical: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowHighlight: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderBottomWidth: 0,
    paddingVertical: Spacing.sm + 4,
    marginVertical: Spacing.xs,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuMiddle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  miniBadge: {
    backgroundColor: '#0277F4',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: Spacing.xs,
  },
  menuChevron: {
    marginLeft: 2,
  },
  actions: {
    marginTop: Spacing.xs,
  },
  switchBtn: {
    marginBottom: Spacing.md,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});