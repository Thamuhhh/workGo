import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Text } from './Text';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      opacity: disabled || loading ? 0.6 : 1,
    };

    // Sizes
    switch (size) {
      case 'sm':
        Object.assign(base, { paddingVertical: 8, paddingHorizontal: 12 });
        break;
      case 'lg':
        Object.assign(base, { paddingVertical: 16, paddingHorizontal: 24, borderRadius: BorderRadius.lg });
        break;
      case 'md':
      default:
        Object.assign(base, { paddingVertical: 12, paddingHorizontal: 18 });
        break;
    }

    // Variants
    switch (variant) {
      case 'secondary':
        base.backgroundColor = Colors.secondary;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = Colors.danger;
        break;
      case 'primary':
      default:
        base.backgroundColor = Colors.primary;
        break;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'outline':
        return Colors.primaryDark;
      case 'ghost':
        return Colors.secondary;
      case 'primary':
        return Colors.textWhite; // White text on deep indigo fill
      case 'secondary':
      case 'danger':
      default:
        return Colors.textWhite;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            variant={size === 'lg' ? 'h3' : size === 'sm' ? 'bodySm' : 'body'}
            weight="bold"
            color={getTextColor()}
            style={textStyle}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: Spacing.sm,
  },
});
