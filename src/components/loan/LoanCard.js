/**
 * Premium Loan Card Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../common/Card';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const LoanCard = ({ loan, onPress }) => {
  const getStatusColor = () => {
    switch (loan.status) {
      case 'pending': return COLORS.warning;
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.danger;
      case 'active': return COLORS.info;
      case 'extended': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'overdue': return COLORS.danger;
      default: return COLORS.textTertiary;
    }
  };

  const getStatusText = () => {
    switch (loan.status) {
      case 'pending': return 'Хүлээгдэж байна';
      case 'approved': return 'Зөвшөөрөгдсөн';
      case 'rejected': return 'Татгалзсан';
      case 'active': return 'Идэвхтэй';
      case 'extended': return 'Сунгасан';
      case 'completed': return 'Дууссан';
      case 'overdue': return 'Хугацаа хэтэрсэн';
      default: return loan.status;
    }
  };

  const statusColor = getStatusColor();
  const isActive = ['active', 'extended', 'overdue'].includes(loan.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="glass" style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[statusColor, statusColor + 'AA']}
              style={styles.statusIcon}
            >
              <Icon 
                name={isActive ? "flash" : loan.status === 'completed' ? "checkmark" : "time"} 
                size={16} 
                color={COLORS.white} 
              />
            </LinearGradient>
            <View>
              <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
              <Text style={styles.date}>{formatDate(loan.createdAt)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Зээлийн дүн</Text>
            <Text style={styles.amount}>{formatMoney(loan.principal)}₮</Text>
          </View>
          
          {isActive && (
            <View style={styles.amountRow}>
              <Text style={styles.label}>Үлдэгдэл</Text>
              <Text style={[styles.amount, { color: COLORS.danger }]}>
                {formatMoney(loan.remainingAmount)}₮
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {isActive && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${(loan.paidAmount / loan.totalAmount) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((loan.paidAmount / loan.totalAmount) * 100)}% төлөгдсөн
            </Text>
          </View>
        )}

        {/* Due Date */}
        {isActive && (
          <View style={styles.dueDate}>
            <Icon name="calendar-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.dueDateText}>
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  loanNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'right',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 6,
  },
});

export default LoanCard;