import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'lg',
  ...props
}) => {
  const getCardStyle = () => {
    const base: Record<string, any> = {
      padding: Spacing[padding],
      borderRadius: BorderRadius.lg,
      backgroundColor: Colors.surface,
      ...(Platform.OS === 'web'
        ? {
            userSelect: 'none' as const,
            WebkitTouchCallout: 'none' as const,
            WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            outlineStyle: 'none' as const,
          }
        : {}),
    };

    if (variant === 'elevated') {
      return [base, Shadows.md];
    }
    if (variant === 'outlined') {
      return [base, { borderWidth: 1, borderColor: Colors.border }];
    }
    return [base, { backgroundColor: Colors.surfaceAlt }];
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, getCardStyle(), style]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
});
