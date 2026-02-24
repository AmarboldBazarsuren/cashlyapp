/**
 * Transaction Item Component
 * ✅ ЗАСВАР: react-native-vector-icons → @expo/vector-icons
 * ✅ status-д тулгуурлан icon болон өнгийг өөрчлөх
 * ✅ Татгалзсан (rejected) → улаан X icon
 * ✅ Хянагдаж байна (pending) → шар цагийн icon
 * ✅ Амжилттай → ногоон checkmark
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../common/Card';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const TransactionItem = ({ transaction }) => {
  // ── Төрлөөр үндсэн тохиргоо ──────────────────────────────
  const getTypeConfig = () => {
    switch (transaction.type) {
      case 'deposit':
        return { icon: 'arrow-down-circle', label: transaction.typeLabel || 'Цэнэглэлт', sign: '+', baseColor: COLORS.success };
      case 'withdrawal':
        return { icon: 'arrow-up-circle', label: transaction.typeLabel || 'Татах', sign: '-', baseColor: COLORS.danger };
      case 'loan_disbursement':
        return { icon: 'wallet', label: 'Зээл олгох', sign: '+', baseColor: COLORS.primary };
      case 'loan_payment':
        return { icon: 'cash', label: 'Зээл төлөх', sign: '-', baseColor: COLORS.info };
      case 'credit_check_fee':
        return { icon: 'card', label: 'Зээлийн эрх шалгах', sign: '-', baseColor: COLORS.warning };
      case 'extension_fee':
        return { icon: 'time', label: 'Сунгалтын төлбөр', sign: '-', baseColor: COLORS.primary };
      default:
        return { icon: 'swap-horizontal', label: transaction.typeLabel || transaction.type, sign: '', baseColor: COLORS.textTertiary };
    }
  };

  // ── Статусаар icon болон өнгийг тодорхойлох ──────────────
  const getStatusConfig = () => {
    const status = transaction.status;
    switch (status) {
      case 'rejected':
        return {
          icon: 'close-circle',
          iconColor: COLORS.danger,
          bgColor: COLORS.danger + '20',
          statusLabel: transaction.statusLabel || 'Татгалзсан',
          statusColor: COLORS.danger,
        };
      case 'pending':
        return {
          icon: 'time',
          iconColor: COLORS.warning,
          bgColor: COLORS.warning + '20',
          statusLabel: transaction.statusLabel || 'Хянагдаж байна',
          statusColor: COLORS.warning,
        };
      case 'completed':
      case 'paid':
        return {
          icon: null,
          iconColor: null,
          bgColor: null,
          statusLabel: transaction.statusLabel || 'Амжилттай',
          statusColor: COLORS.success,
        };
      case 'approved':
        return {
          icon: 'checkmark-circle',
          iconColor: COLORS.success,
          bgColor: COLORS.success + '20',
          statusLabel: transaction.statusLabel || 'Зөвшөөрсөн',
          statusColor: COLORS.success,
        };
      case 'expired':
        return {
          icon: 'alert-circle',
          iconColor: COLORS.textTertiary,
          bgColor: COLORS.textTertiary + '20',
          statusLabel: 'Хугацаа дууссан',
          statusColor: COLORS.textTertiary,
        };
      default:
        return {
          icon: null,
          iconColor: null,
          bgColor: null,
          statusLabel: status,
          statusColor: COLORS.textTertiary,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const statusConfig = getStatusConfig();

  const finalIcon = statusConfig.icon || typeConfig.icon;
  const finalIconColor = statusConfig.iconColor || typeConfig.baseColor;
  const finalBgColor = statusConfig.bgColor || (typeConfig.baseColor + '20');

  const isRejectedOrExpired = transaction.status === 'rejected' || transaction.status === 'expired';
  const amountColor = isRejectedOrExpired
    ? COLORS.textTertiary
    : (typeConfig.sign === '+' ? COLORS.success : COLORS.danger);

  const amountStyle = isRejectedOrExpired
    ? { textDecorationLine: 'line-through', color: COLORS.textTertiary }
    : { color: amountColor };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: finalBgColor }]}>
          <Ionicons name={finalIcon} size={24} color={finalIconColor} />
        </View>

        {/* Дэлгэрэнгүй */}
        <View style={styles.details}>
          <Text style={styles.label}>{typeConfig.label}</Text>
          {transaction.description ? (
            <Text style={styles.description} numberOfLines={1}>{transaction.description}</Text>
          ) : null}
          {transaction.status === 'rejected' && transaction.rejectedReason ? (
            <Text style={styles.rejectedReason} numberOfLines={2}>
              ✕ {transaction.rejectedReason}
            </Text>
          ) : null}
          <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
        </View>

        {/* Дүн болон статус */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, amountStyle]}>
            {typeConfig.sign}{formatMoney(transaction.amount)}₮
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusConfig.statusColor }]}>
              {statusConfig.statusLabel}
            </Text>
          </View>
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
  rejectedReason: {
    fontSize: 11,
    color: COLORS.danger,
    marginBottom: 2,
    lineHeight: 15,
  },
  date: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default TransactionItem;