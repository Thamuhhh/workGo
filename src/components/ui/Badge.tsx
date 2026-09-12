import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: '#E6F3FF', text: '#0F172A' };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success };
      case 'warning':
        return { bg: '#F1F5F9', text: '#0F172A' };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger };
      case 'info':
        return { bg: '#F1F5F9', text: '#0F172A' };
      case 'neutral':
      default:
        return { bg: Colors.surfaceAlt, text: Colors.textSecondary };
    }
  };

  const { bg, text } = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        variant={size === 'sm' ? 'caption' : 'bodySm'}
        weight="semibold"
        color={text}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.round,
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeMd: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: Spacing.xs,
  },
});
