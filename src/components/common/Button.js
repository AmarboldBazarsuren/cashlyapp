/**
 * Button Component - Товч
 * БАЙРШИЛ: Cashly.mn/App/src/components/common/Button.js
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, outline, danger
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    variant === 'outline' && styles.buttonOutline,
    variant === 'danger' && styles.buttonDanger,
    isDisabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'danger' && styles.buttonTextDanger,
    isDisabled && styles.buttonTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grayLight,
    borderColor: COLORS.grayLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextDanger: {
    color: COLORS.white,
  },
  buttonTextDisabled: {
    color: COLORS.gray,
  },
});

export default Button;