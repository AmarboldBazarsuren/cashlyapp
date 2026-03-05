/**
 * Apply Loan Screen - ANDROID KEYBOARD FIXED
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Хамгийн бага зээл ${formatMoney(MIN_LOAN_AMOUNT)}₮` });
      return;
    }
    if (parseFloat(amount) > user.creditLimit) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Зээлийн эрх хүрэлцэхгүй. Таны эрх: ${formatMoney(user.creditLimit)}₮` });
      return;
    }

    setLoading(true);
    try {
      const response = await applyLoan(parseFloat(amount), term, 'Хувийн');
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Амжилттай', text2: response.message });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message || 'Хүсэлт илгээхэд алдаа гарлаа' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл авах</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Credit Limit Card */}
          <LinearGradient
            colors={[COLORS.success, COLORS.successLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.creditCard}
          >
            <Ionicons name="shield-checkmark" size={30} color={COLORS.white} />
            <View style={styles.creditContent}>
              <Text style={styles.creditLabel}>Таны зээлийн эрх</Text>
              <Text style={styles.creditAmount}>{formatMoney(user?.creditLimit || 0)}₮</Text>
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
                  activeOpacity={0.75}
                  style={[
                    styles.termButton,
                    term === termOption.value && styles.termButtonActive,
                  ]}
                >
                  {term === termOption.value ? (
                    <LinearGradient
                      colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                      style={styles.termGradient}
                    >
                      <Text style={[styles.termLabel, styles.termLabelActive]}>{termOption.label}</Text>
                      <Text style={[styles.termRate, styles.termRateActive]}>{termOption.rate}% хүү</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.termInner}>
                      <Text style={styles.termLabel}>{termOption.label}</Text>
                      <Text style={styles.termRate}>{termOption.rate}% хүү</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          {amount && parseFloat(amount) >= MIN_LOAN_AMOUNT && (
            <Card variant="gradient" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Нэгтгэл</Text>
              <View style={styles.summaryRow}>
                <Ionicons name="cash-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.summaryLabel}>Зээлийн дүн</Text>
                <Text style={styles.summaryValue}>{formatMoney(parseFloat(amount))}₮</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="trending-up-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.summaryLabel}>Хүү ({interestRate}%)</Text>
                <Text style={styles.summaryValue}>{formatMoney(interestAmount)}₮</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Ionicons name="card-outline" size={18} color={COLORS.primary} />
                <Text style={styles.summaryLabelTotal}>Нийт төлөх</Text>
                <Text style={styles.summaryValueTotal}>{formatMoney(totalAmount)}₮</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
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

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: 12, paddingHorizontal: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  scrollContent: { padding: 20 },
  creditCard: {
    borderRadius: 20, padding: 20, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', elevation: 4,
  },
  creditContent: { marginLeft: 14 },
  creditLabel: { fontSize: 13, color: COLORS.white, opacity: 0.9, marginBottom: 4 },
  creditAmount: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  termContainer: { gap: 10 },
  termButton: {
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    overflow: 'hidden', backgroundColor: COLORS.white,
  },
  termButtonActive: { borderColor: 'transparent', elevation: 3 },
  termGradient: { padding: 16 },
  termInner: { padding: 16 },
  termLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  termLabelActive: { color: COLORS.white },
  termRate: { fontSize: 13, color: COLORS.textTertiary },
  termRateActive: { color: COLORS.white, opacity: 0.9 },
  summaryCard: { marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, marginLeft: 10 },
  summaryValue: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryLabelTotal: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 10 },
  summaryValueTotal: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  applyButton: { marginBottom: 8 },
});

export default ApplyLoanScreen;