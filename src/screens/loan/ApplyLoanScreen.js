/**
 * Premium Apply Loan Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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
        text2: `Зээлийн эрх хүрэлцэхгүй. Таны эрх: ${formatMoney(user.creditLimit)}₮`,
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
        <Text style={styles.headerTitle}>Зээл авах</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Credit Limit Card */}
        <LinearGradient
          colors={[COLORS.success, COLORS.successLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditCard}
        >
          <View style={styles.creditCardInner}>
            <Icon name="shield-checkmark" size={32} color={COLORS.white} />
            <View style={styles.creditContent}>
              <Text style={styles.creditLabel}>Таны зээлийн эрх</Text>
              <Text style={styles.creditAmount}>
                {formatMoney(user?.creditLimit || 0)}₮
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Зээлийн дүн</Text>
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
          <Text style={styles.sectionTitle}>Хугацаа</Text>
          <View style={styles.termContainer}>
            {LOAN_TERMS.map((termOption) => (
              <TouchableOpacity
                key={termOption.value}
                onPress={() => setTerm(termOption.value)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={term === termOption.value 
                    ? [COLORS.gradientStart, COLORS.gradientMiddle]
                    : [COLORS.glass, COLORS.glass]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.termButton,
                    term === termOption.value && styles.termButtonActive,
                  ]}
                >
                  <Text style={[
                    styles.termLabel,
                    term === termOption.value && styles.termLabelActive,
                  ]}>
                    {termOption.label}
                  </Text>
                  <Text style={[
                    styles.termRate,
                    term === termOption.value && styles.termRateActive,
                  ]}>
                    {termOption.rate}% хүү
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Card */}
        {amount && parseFloat(amount) >= MIN_LOAN_AMOUNT && (
          <Card variant="gradient" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Нэгтгэл</Text>
            
            <View style={styles.summaryRow}>
              <Icon name="cash-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.summaryLabel}>Зээлийн дүн</Text>
              <Text style={styles.summaryValue}>
                {formatMoney(parseFloat(amount))}₮
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Icon name="trending-up-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.summaryLabel}>Хүү ({interestRate}%)</Text>
              <Text style={styles.summaryValue}>
                {formatMoney(interestAmount)}₮
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Icon name="card-outline" size={20} color={COLORS.primary} />
              <Text style={styles.summaryLabelTotal}>Нийт төлөх</Text>
              <Text style={styles.summaryValueTotal}>
                {formatMoney(totalAmount)}₮
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Icon name="time-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.summaryLabel}>Хугацаа</Text>
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

        <View style={{ height: 40 }} />
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
  creditCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  creditCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditContent: {
    marginLeft: 16,
  },
  creditLabel: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  creditAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  termContainer: {
    gap: 12,
  },
  termButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  termButtonActive: {
    borderColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  termLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  termLabelActive: {
    color: COLORS.white,
  },
  termRate: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  termRateActive: {
    color: COLORS.white,
    opacity: 0.9,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
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
    color: COLORS.primary,
  },
  applyButton: {
    marginBottom: 24,
  },
});

export default ApplyLoanScreen;