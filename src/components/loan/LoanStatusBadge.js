/**
 * Loan Status Badge Component - Зээлийн статус
 * БАЙРШИЛ: Cashly.mn/App/src/components/loan/LoanStatusBadge.js
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const LoanStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { label: 'Хүлээгдэж байна', color: COLORS.warning };
      case 'approved':
        return { label: 'Зөвшөөрөгдсөн', color: COLORS.success };
      case 'rejected':
        return { label: 'Татгалзсан', color: COLORS.danger };
      case 'active':
        return { label: 'Идэвхтэй', color: COLORS.info };
      case 'extended':
        return { label: 'Сунгасан', color: COLORS.primary };
      case 'completed':
        return { label: 'Дууссан', color: COLORS.success };
      case 'overdue':
        return { label: 'Хугацаа хэтэрсэн', color: COLORS.danger };
      case 'not_submitted':
        return { label: 'Илгээгээгүй', color: COLORS.gray };
      default:
        return { label: status, color: COLORS.gray };
    }
  };

  const { label, color } = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoanStatusBadge;