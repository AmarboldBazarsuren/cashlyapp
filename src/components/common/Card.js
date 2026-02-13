/**
 * Glass Card Component - Glassmorphism Effect
 * Modern Fintech Design
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const Card = ({ 
  children, 
  style, 
  variant = 'glass', // glass, solid, gradient
  gradient = false,
}) => {
  if (variant === 'gradient' || gradient) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={[
            'rgba(124, 58, 237, 0.1)',
            'rgba(236, 72, 153, 0.05)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerContent}>
            {children}
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (variant === 'solid') {
    return (
      <View style={[styles.container, styles.solid, style]}>
        {children}
      </View>
    );
  }

  // Default glass variant
  return (
    <View style={[styles.container, styles.glass, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  solid: {
    backgroundColor: COLORS.backgroundCard,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  innerContent: {
    padding: 20,
  },
});

export default Card;