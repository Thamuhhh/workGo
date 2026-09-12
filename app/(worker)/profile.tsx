import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useUserModeStore } from '../../src/store/userModeStore';

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

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover Header */}
      <View style={styles.cover}>
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
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={14} color="#4ADE80" />
              <Text variant="caption" color="rgba(255,255,255,0.75)">
                Verified Profile
              </Text>
            </View>
          </View>
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
      </View>

      {/* Personal Details */}
      <Text variant="h3" weight="bold" style={styles.sectionTitle}>
        Personal Details
      </Text>
      <Card padding="md" style={styles.sectionCard}>
        <Row
          icon="person-outline"
          label="Full Name"
          value={displayName}
          bold
        />
        <Row
          icon="call-outline"
          label="Mobile Number"
          value={`+91 ${displayPhone}`}
          bold
        />
        <Row
          icon="location-outline"
          label="Location"
          value="Kanchipuram"
          bold
        />
        <Row
          icon="briefcase-outline"
          label="Expected Wage"
          value="₹800 / day"
          bold
          last
        />
      </Card>

      {/* Verification */}
      <Text variant="h3" weight="bold" style={styles.sectionTitle}>
        KYC & Documents
      </Text>
      <Card padding="md" style={styles.sectionCard}>
        <DocRow
          icon="shield-checkmark"
          iconBg="#E6F9EC"
          iconColor="#16A34A"
          label="Aadhaar Card"
          badgeLabel="Verified"
          badgeVariant="success"
        />
        <DocRow
          icon="document-text-outline"
          iconBg="#FFF4E5"
          iconColor="#F59E0B"
          label="PAN Card"
          badgeLabel="Pending"
          badgeVariant="warning"
          last
        />
      </Card>

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
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  value,
  bold,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.lastRow]}>
      <View style={styles.iconBubble}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.detailMiddle}>
        <Text variant="caption" color={Colors.textMuted}>
          {label}
        </Text>
        <Text variant="body" weight={bold ? 'bold' : 'regular'} color="#0F172A">
          {value}
        </Text>
      </View>
    </View>
  );
}

function DocRow({
  icon,
  iconBg,
  iconColor,
  label,
  badgeLabel,
  badgeVariant,
  last,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning';
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.lastRow]}>
      <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.detailMiddle}>
        <Text variant="body" weight="bold" color="#0F172A">
          {label}
        </Text>
      </View>
      <Badge label={badgeLabel} variant={badgeVariant} size="sm" />
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
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.lg,
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
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailMiddle: {
    flex: 1,
  },
  actions: {
    marginTop: Spacing.md,
  },
  switchBtn: {
    marginBottom: Spacing.md,
  },
});