/**
 * Transaction Item Component - Гүйлгээний элемент
 * БАЙРШИЛ: Cashly.mn/App/src/components/wallet/TransactionItem.js
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../common/Card';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const TransactionItem = ({ transaction }) => {
  const getTransactionConfig = () => {
    switch (transaction.type) {
      case 'deposit':
        return {
          icon: 'arrow-down-circle',
          iconColor: COLORS.success,
          label: 'Цэнэглэлт',
          sign: '+',
        };
      case 'withdrawal':
        return {
          icon: 'arrow-up-circle',
          iconColor: COLORS.danger,
          label: 'Зарлага',
          sign: '-',
        };
      case 'loan_disbursement':
        return {
          icon: 'wallet',
          iconColor: COLORS.primary,
          label: 'Зээл олгох',
          sign: '+',
        };
      case 'loan_payment':
        return {
          icon: 'cash',
          iconColor: COLORS.info,
          label: 'Зээл төлөх',
          sign: '-',
        };
      case 'credit_check_fee':
        return {
          icon: 'card',
          iconColor: COLORS.warning,
          label: 'Зээлийн эрх шалгах',
          sign: '-',
        };
      case 'extension_fee':
        return {
          icon: 'time',
          iconColor: COLORS.primary,
          label: 'Сунгалтын төлбөр',
          sign: '-',
        };
      default:
        return {
          icon: 'swap-horizontal',
          iconColor: COLORS.gray,
          label: transaction.type,
          sign: '',
        };
    }
  };

  const { icon, iconColor, label, sign } = getTransactionConfig();

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Icon name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.details}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: sign === '+' ? COLORS.success : COLORS.danger }]}>
            {sign}{formatMoney(transaction.amount)}₮
          </Text>
          <Text style={styles.status}>{transaction.status === 'completed' ? '✓' : '⏳'}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
  },
});

export default TransactionItem;