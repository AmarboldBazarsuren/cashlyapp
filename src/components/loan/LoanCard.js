/**
 * Loan Card Component - Зээлийн карт
 * БАЙРШИЛ: Cashly.mn/App/src/components/loan/LoanCard.js
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../common/Card';
import LoanStatusBadge from './LoanStatusBadge';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const LoanCard = ({ loan, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
            <Text style={styles.date}>{formatDate(loan.createdAt)}</Text>
          </View>
          <LoanStatusBadge status={loan.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.amountRow}>
          <Text style={styles.label}>Зээлийн дүн:</Text>
          <Text style={styles.value}>{formatMoney(loan.principal)}₮</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.label}>Үлдэгдэл:</Text>
          <Text style={[styles.value, styles.remainingAmount]}>
            {formatMoney(loan.remainingAmount)}₮
          </Text>
        </View>

        {['active', 'extended', 'overdue'].includes(loan.status) && (
          <View style={styles.dueDateRow}>
            <Icon name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.dueDate}>
              Дуусах: {formatDate(loan.dueDate)}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  remainingAmount: {
    color: COLORS.danger,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});

export default LoanCard;