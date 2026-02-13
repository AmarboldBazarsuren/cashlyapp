/**
 * Premium Loan Details Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { getLoanDetails, repayLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const LoanDetailsScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { wallet } = useApp();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    loadLoanDetails();
  }, [loanId]);

  const loadLoanDetails = async () => {
    try {
      const response = await getLoanDetails(loanId);
      if (response.success) {
        setLoan(response.data.loan);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Зээлийн мэдээлэл татахад алдаа гарлаа',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Төлбөрийн дүн оруулна уу' });
      return;
    }

    const amount = parseFloat(repayAmount);
    const totalDue = loan.remainingAmount + (loan.lateFee || 0);

    if (amount > totalDue) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Төлөх дүн хэт их. Төлөх ёстой: ${formatMoney(totalDue)}₮` });
      return;
    }

    if (amount > wallet?.balance) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Хэтэвчний үлдэгдэл хүрэлцэхгүй' });
      return;
    }

    Alert.alert('Зээл төлөх', `${formatMoney(amount)}₮ төлөх үү?`, [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Төлөх',
        onPress: async () => {
          setRepaying(true);
          try {
            const response = await repayLoan(loanId, amount);
            if (response.success) {
              Toast.show({ type: 'success', text1: 'Амжилттай', text2: response.message });
              await loadLoanDetails();
              setRepayAmount('');
            }
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message || 'Төлбөр төлөхөд алдаа гарлаа' });
          } finally {
            setRepaying(false);
          }
        },
      },
    ]);
  };

  if (loading) return <Loading />;
  if (!loan) return null;

  const canRepay = ['active', 'extended', 'overdue'].includes(loan.status);
  const totalDue = loan.remainingAmount + (loan.lateFee || 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="gradient" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {loan.status === 'active' ? 'Идэвхтэй' : 
                 loan.status === 'completed' ? 'Дууссан' : loan.status}
              </Text>
            </View>
          </View>
        </Card>

        {/* Amount Summary */}
        <Card variant="glass" style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Нэгтгэл</Text>
          
          <View style={styles.summaryRow}>
            <Icon name="cash-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Зээлийн дүн</Text>
            <Text style={styles.summaryValue}>{formatMoney(loan.principal)}₮</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="trending-up-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Хүү ({loan.interestRate}%)</Text>
            <Text style={styles.summaryValue}>{formatMoney(loan.interestAmount)}₮</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="card-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Нийт</Text>
            <Text style={styles.summaryValue}>{formatMoney(loan.totalAmount)}₮</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Icon name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryLabel}>Төлсөн</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>
              {formatMoney(loan.paidAmount)}₮
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="alert-circle" size={20} color={COLORS.danger} />
            <Text style={styles.summaryLabelTotal}>Үлдэгдэл</Text>
            <Text style={styles.summaryValueTotal}>
              {formatMoney(loan.remainingAmount)}₮
            </Text>
          </View>

          {loan.lateFee > 0 && (
            <View style={styles.summaryRow}>
              <Icon name="warning" size={20} color={COLORS.warning} />
              <Text style={[styles.summaryLabel, { color: COLORS.warning }]}>
                Хоцролт
              </Text>
              <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                {formatMoney(loan.lateFee)}₮
              </Text>
            </View>
          )}
        </Card>

        {/* Dates Card */}
        <Card variant="glass" style={styles.datesCard}>
          <Text style={styles.cardTitle}>Огнооны мэдээлэл</Text>
          <View style={styles.dateRow}>
            <Icon name="calendar-outline" size={18} color={COLORS.info} />
            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>Эхлэсэн</Text>
              <Text style={styles.dateValue}>
                {formatDate(loan.disbursedAt || loan.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.dateRow}>
            <Icon name="time-outline" size={18} color={COLORS.primary} />
            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>Дуусах</Text>
              <Text style={styles.dateValue}>{formatDate(loan.dueDate)}</Text>
            </View>
          </View>
          {loan.extensionCount > 0 && (
            <View style={styles.dateRow}>
              <Icon name="refresh-outline" size={18} color={COLORS.warning} />
              <View style={styles.dateContent}>
                <Text style={styles.dateLabel}>Сунгалт</Text>
                <Text style={styles.dateValue}>{loan.extensionCount} удаа</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Repayment Section */}
        {canRepay && (
          <Card variant="glass" style={styles.repayCard}>
            <Text style={styles.cardTitle}>Зээл төлөх</Text>
            <View style={styles.totalDueCard}>
              <Text style={styles.totalDueLabel}>Нийт төлөх ёстой</Text>
              <Text style={styles.totalDueAmount}>{formatMoney(totalDue)}₮</Text>
            </View>
            <Input
              placeholder="Төлөх дүн"
              value={repayAmount}
              onChangeText={setRepayAmount}
              keyboardType="numeric"
              suffix="₮"
            />
            <Button
              title="Төлөх"
              onPress={handleRepay}
              loading={repaying}
            />
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  summaryCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryLabelTotal: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.danger,
  },
  datesCard: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContent: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  repayCard: {
    marginBottom: 16,
  },
  totalDueCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalDueLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  totalDueAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
});

export default LoanDetailsScreen;