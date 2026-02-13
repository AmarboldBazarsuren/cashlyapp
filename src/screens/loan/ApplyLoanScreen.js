/**
 * Apply Loan Screen - Зээлийн хүсэлт илгээх
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/ApplyLoanScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { applyLoan } from '../../services/loanService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { LOAN_TERMS, MIN_LOAN_AMOUNT } from '../../constants/config';
import { formatMoney } from '../../utils/formatters';

const ApplyLoanScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(14);
  const [loading, setLoading] = useState(false);

  const selectedTerm = LOAN_TERMS.find((t) => t.value === term);
  const interestRate = selectedTerm?.rate || 0;
  const interestAmount = amount ? Math.round((parseFloat(amount) * interestRate) / 100) : 0;
  const totalAmount = amount ? parseFloat(amount) + interestAmount : 0;

  const handleApply = async () => {
    if (!amount || parseFloat(amount) < MIN_LOAN_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Хамгийн бага зээл ${formatMoney(MIN_LOAN_AMOUNT)}₮`,
      });
      return;
    }

    if (parseFloat(amount) > user.creditLimit) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Зээлийн эрх хүрэлцэхгүй байна. Таны эрх: ${formatMoney(user.creditLimit)}₮`,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await applyLoan(parseFloat(amount), term, 'Хувийн');

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: response.message,
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: error.message || 'Хүсэлт илгээхэд алдаа гарлаа',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Credit Limit */}
      <Card style={styles.creditCard}>
        <Text style={styles.creditLabel}>Таны зээлийн эрх</Text>
        <Text style={styles.creditAmount}>{formatMoney(user?.creditLimit || 0)}₮</Text>
      </Card>

      {/* Amount Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Зээлийн дүн</Text>
        <Input
          placeholder="Дүн оруулах"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          suffix="₮"
        />
      </View>

      {/* Term Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Хугацаа</Text>
        <View style={styles.termContainer}>
          {LOAN_TERMS.map((termOption) => (
            <TouchableOpacity
              key={termOption.value}
              style={[
                styles.termButton,
                term === termOption.value && styles.termButtonActive,
              ]}
              onPress={() => setTerm(termOption.value)}
            >
              <Text
                style={[
                  styles.termText,
                  term === termOption.value && styles.termTextActive,
                ]}
              >
                {termOption.label}
              </Text>
              <Text
                style={[
                  styles.termRate,
                  term === termOption.value && styles.termRateActive,
                ]}
              >
                {termOption.rate}% хүү
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      {amount && parseFloat(amount) >= MIN_LOAN_AMOUNT && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Нэгтгэл</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Зээлийн дүн:</Text>
            <Text style={styles.summaryValue}>{formatMoney(parseFloat(amount))}₮</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Хүү ({interestRate}%):</Text>
            <Text style={styles.summaryValue}>{formatMoney(interestAmount)}₮</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelTotal}>Нийт төлөх:</Text>
            <Text style={styles.summaryValueTotal}>
              {formatMoney(totalAmount)}₮
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Хугацаа:</Text>
            <Text style={styles.summaryValue}>{term} хоног</Text>
          </View>
        </Card>
      )}

      <Button
        title="Зээл хүсэх"
        onPress={handleApply}
        loading={loading}
        style={styles.applyButton}
        disabled={!amount || parseFloat(amount) < MIN_LOAN_AMOUNT}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  creditCard: {
    marginBottom: 24,
    backgroundColor: COLORS.primary,
  },
  creditLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  creditAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  termContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termButton: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  termButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  termText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  termTextActive: {
    color: COLORS.primary,
  },
  termRate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  termRateActive: {
    color: COLORS.primary,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
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
    color: COLORS.primary,
  },
  applyButton: {
    marginBottom: 32,
  },
});

export default ApplyLoanScreen;