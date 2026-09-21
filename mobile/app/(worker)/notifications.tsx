import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { useNotificationsStore, AppNotification } from '../../src/store/notificationsStore';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);
  const [segment, setSegment] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const list = segment === 'all' ? notifications : notifications.filter((n) => !n.read);

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text variant="h2" weight="bold" color="#0F172A">
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => markAllRead()} hitSlop={8}>
            <Text variant="bodySm" weight="semibold" color={Colors.primary}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, segment === 'all' && styles.segmentActive]}
          activeOpacity={0.8}
          onPress={() => setSegment('all')}
        >
          <Text
            variant="bodySm"
            weight={segment === 'all' ? 'bold' : 'regular'}
            color={segment === 'all' ? '#FFFFFF' : Colors.textSecondary}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, segment === 'unread' && styles.segmentActive]}
          activeOpacity={0.8}
          onPress={() => setSegment('unread')}
        >
          <Text
            variant="bodySm"
            weight={segment === 'unread' ? 'bold' : 'regular'}
            color={segment === 'unread' ? '#FFFFFF' : Colors.textSecondary}
          >
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text variant="caption" weight="bold" color="#FFFFFF">
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications" size={38} color={Colors.primary} />
            </View>
            <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
              You're all caught up
            </Text>
          </View>
        ) : (
          list.map((n, idx) => (
            <FadeSlide key={n.id} delay={idx * 30}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => markRead(n.id)}
              >
                <View style={[styles.row, !n.read && styles.rowUnread]}>
                  <View style={[styles.icon, !n.read && styles.iconUnread]}>
                    <Ionicons
                      name={n.icon}
                      size={18}
                      color={n.read ? '#64748B' : Colors.primary}
                    />
                  </View>
                  <View style={styles.middle}>
                    <Text
                      variant="body"
                      weight={n.read ? 'semibold' : 'bold'}
                      color="#0F172A"
                      numberOfLines={1}
                    >
                      {n.title}
                    </Text>
                    <Text variant="caption" color={Colors.textSecondary} numberOfLines={2}>
                      {n.body}
                    </Text>
                    <Text variant="caption" color={Colors.textMuted} style={styles.time}>
                      {timeAgo(n.timestamp)}
                    </Text>
                  </View>
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            </FadeSlide>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowUnread: {
    backgroundColor: '#F5FAFF',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconUnread: {
    backgroundColor: Colors.primaryLight,
  },
  middle: {
    flex: 1,
  },
  time: {
    marginTop: 2,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginLeft: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.xs,
  },
});