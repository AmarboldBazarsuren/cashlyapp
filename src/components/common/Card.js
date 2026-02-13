/**
 * Card Component - Карт
 * БАЙРШИЛ: Cashly.mn/App/src/components/common/Card.js
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default Card;