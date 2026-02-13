/**
 * Loan Details Screen - Зээлийн дэлгэрэнгүй
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/LoanDetailsScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getLoanDetails, repayLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import LoanStatusBadge from '../../components/loan/LoanStatusBadge';
import Input from '../../components/common/Input';
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
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Төлбөрийн дүн оруулна уу',
      });
      return;
    }

    const amount = parseFloat(repayAmount);
    const totalDue = loan.remainingAmount + (loan.lateFee || 0);

    if (amount > totalDue) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Төлөх дүн хэт их байна. Төлөх ёстой: ${formatMoney(totalDue)}₮`,
      });
      return;
    }

    if (amount > wallet?.balance) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Хэтэвчний үлдэгдэл хүрэлцэхгүй байна',
      });
      return;
    }

    Alert.alert(
      'Зээл төлөх',
      `${formatMoney(amount)}₮ төлөх үү?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          onPress: async () => {
            setRepaying(true);
            try {
              const response = await repayLoan(loanId, amount);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Амжилттай',
                  text2: response.message,
                });
                await loadLoanDetails();
                setRepayAmount('');
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Алдаа',
                text2: error.message || 'Төлбөр төлөхөд алдаа гарлаа',
              });
            } finally {
              setRepaying(false);
            }
          },
        },
      ]
    );
  };

  const handleExtend = () => {
    navigation.navigate('ExtendLoan', { loanId: loan._id });
  };

  if (loading) {
    return <Loading />;
  }

  if (!loan) {
    return null;
  }

  const canExtend = loan.term !== 14 && 
                    loan.extensionCount < 4 && 
                    loan.status === 'active';
  const canRepay = ['active', 'extended', 'overdue'].includes(loan.status);
  const totalDue = loan.remainingAmount + (loan.lateFee || 0);

  return (
    <ScrollView style={styles.container}>
      {/* Status */}
      <Card style={styles.statusCard}>
        <LoanStatusBadge status={loan.status} />
        <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
      </Card>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Нэгтгэл</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Зээлийн дүн:</Text>
          <Text style={styles.summaryValue}>{formatMoney(loan.principal)}₮</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Хүү:</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(loan.interestAmount)}₮ ({loan.interestRate}%)
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Нийт төлөх:</Text>
          <Text style={styles.summaryValue}>{formatMoney(loan.totalAmount)}₮</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Төлсөн:</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatMoney(loan.paidAmount)}₮
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelTotal}>Үлдэгдэл:</Text>
          <Text style={styles.summaryValueTotal}>
            {formatMoney(loan.remainingAmount)}₮
          </Text>
        </View>
        {loan.lateFee > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: COLORS.danger }]}>
              Хоцролтын төлбөр:
            </Text>
            <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
              {formatMoney(loan.lateFee)}₮
            </Text>
          </View>
        )}
      </Card>

      {/* Dates */}
      <Card style={styles.datesCard}>
        <Text style={styles.cardTitle}>Огнооны мэдээлэл</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Эхэлсэн:</Text>
          <Text style={styles.summaryValue}>
            {formatDate(loan.disbursedAt || loan.createdAt)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Дуусах:</Text>
          <Text style={styles.summaryValue}>{formatDate(loan.dueDate)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Хугацаа:</Text>
          <Text style={styles.summaryValue}>{loan.term} хоног</Text>
        </View>
        {loan.extensionCount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Сунгалт:</Text>
            <Text style={styles.summaryValue}>
              {loan.extensionCount} удаа
            </Text>
          </View>
        )}
      </Card>

      {/* Repayment */}
      {canRepay && (
        <Card style={styles.repayCard}>
          <Text style={styles.cardTitle}>Зээл төлөх</Text>
          <Text style={styles.repayLabel}>
            Нийт төлөх ёстой: {formatMoney(totalDue)}₮
          </Text>
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
            style={styles.repayButton}
          />
        </Card>
      )}

      {/* Actions */}
      {canExtend && (
        <Button
          title="Зээл сунгах"
          onPress={handleExtend}
          variant="outline"
          style={styles.extendButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  statusCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loanNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  summaryCard: {
    marginBottom: 16,
  },
  datesCard: {
    marginBottom: 16,
  },
  repayCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  repayLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  repayButton: {
    marginTop: 12,
  },
  extendButton: {
    marginBottom: 32,
  },
});

export default LoanDetailsScreen;