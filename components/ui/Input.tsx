/**
 * @file components/ui/Input.tsx
 * @description Material Design 3 text input component
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '../../lib/design/theme';

export interface ModernInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  onIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  icon,
  onIconPress,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  maxLength,
}) => {
  const [focused, setFocused] = useState(false);
  const { colors, spacing, borderRadius, typography } = useTheme();

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const labelStyle: TextStyle = {
    ...typography.bodyMedium,
    color: error ? colors.error : colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    fontWeight: '500',
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: multiline ? spacing.md : 0,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
    borderColor: error
      ? colors.error
      : focused
      ? colors.primary
      : colors.outline,
    marginTop: spacing.xs,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.onSurface,
    paddingVertical: multiline ? 0 : spacing.md,
    paddingHorizontal: spacing.sm,
  };

  const errorStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  };

  return (
    <View style={[containerStyle, style]}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          style={[textInputStyle, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />
        {icon && (
          <Pressable onPress={onIconPress} disabled={!onIconPress}>
            {icon}
          </Pressable>
        )}
      </View>
      {error && errorMessage && <Text style={errorStyle}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ModernInput;
