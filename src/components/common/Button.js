/**
 * Premium Button Component - Gradient & Glow Effects
 * Modern Fintech Design
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, outline, glass, danger
  size = 'large', // small, medium, large
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'glass' ? COLORS.primary : COLORS.white} 
        />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[
            styles.text,
            size === 'small' && styles.textSmall,
            size === 'medium' && styles.textMedium,
            variant === 'outline' && styles.textOutline,
            variant === 'glass' && styles.textGlass,
            variant === 'danger' && styles.textDanger,
            isDisabled && styles.textDisabled,
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          size === 'small' && styles.buttonSmall,
          size === 'medium' && styles.buttonMedium,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled 
            ? [COLORS.textTertiary, COLORS.textMuted] 
            : [COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            size === 'small' && styles.gradientSmall,
            size === 'medium' && styles.gradientMedium,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'glass') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          styles.glassButton,
          size === 'small' && styles.buttonSmall,
          size === 'medium' && styles.buttonMedium,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          styles.outlineButton,
          size === 'small' && styles.buttonSmall,
          size === 'medium' && styles.buttonMedium,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          size === 'small' && styles.buttonSmall,
          size === 'medium' && styles.buttonMedium,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
      >
        <LinearGradient
          colors={isDisabled 
            ? [COLORS.textTertiary, COLORS.textMuted] 
            : [COLORS.danger, COLORS.dangerLight]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            size === 'small' && styles.gradientSmall,
            size === 'medium' && styles.gradientMedium,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonSmall: {
    borderRadius: 12,
  },
  buttonMedium: {
    borderRadius: 14,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientSmall: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  gradientMedium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassButton: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  textMedium: {
    fontSize: 15,
    fontWeight: '600',
  },
  textOutline: {
    color: COLORS.primary,
  },
  textGlass: {
    color: COLORS.white,
  },
  textDanger: {
    color: COLORS.white,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});

export default Button;