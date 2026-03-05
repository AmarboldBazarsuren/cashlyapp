/**
 * Apply Loan Screen
 * ✅ 2025 ХУУЛИЙН ДАГУУ ШИНЭЧЛЭГДСЭН:
 *  - Хугацаа: 7 / 14 / 21 / 30 хоног
 *  - Хүү: 4.5% сараар (= 4.5% × term/30)
 *  - Credit score multiplier анхааруулга (<500 бол)
 *  - ZMS: нийт идэвхтэй зээлийн тоо харуулах
 *  - Available credit (usedCreditLimit тооцсон)
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { applyLoan } from '../../services/loanService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

// ─── 2025 хуулийн дагуу: 7 / 14 / 21 / 30 хоног, 4.5% сараар ───────────────
const LOAN_TERMS = [
  { value: 7,  label: '7 хоног'  },
  { value: 14, label: '14 хоног' },
  { value: 21, label: '21 хоног' },
  { value: 30, label: '30 хоног' },
];

const MONTHLY_RATE = 4.5; // % сараар
const MIN_LOAN_AMOUNT = 10000;

// Хүү тооцоо: principal × 4.5% × (term / 30)
function calcInterest(principal, term) {
  return Math.round(principal * (MONTHLY_RATE / 100) * (term / 30));
}

// Credit score multiplier
function getCreditMultiplier(score) {
  if (!score || score < 300) return 0.30;
  if (score < 500) return 0.60;
  return 1.00;
}

const ApplyLoanScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeLoans } = useApp();
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(14);
  const [loading, setLoading] = useState(false);

  // ─── Зээлийн эрхийн тооцоо ────────────────────────────────────────────────
  const creditScore     = user?.creditScore || 0;
  const multiplier      = getCreditMultiplier(creditScore);
  const totalLimit      = user?.creditLimit || 0;
  const effectiveLimit  = Math.floor(totalLimit * multiplier);
  const usedLimit       = user?.usedCreditLimit || 0;
  const availableCredit = Math.max(0, effectiveLimit - usedLimit);

  // ZMS: манай системийн идэвхтэй зээл + гадны зээл
  const externalLoans   = user?.externalActiveLoansCount || 0;
  const activeCount     = (activeLoans?.length || 0) + externalLoans;
  const zmsWarning      = activeCount >= 4; // 5 дээр блок болно

  // Нэгтгэл
  const parsedAmount   = parseFloat(amount) || 0;
  const interestAmount = parsedAmount >= MIN_LOAN_AMOUNT ? calcInterest(parsedAmount, term) : 0;
  const totalAmount    = parsedAmount + interestAmount;
  const interestPct    = (MONTHLY_RATE * term / 30).toFixed(2); // хугацааны хүүний хувь

  const handleApply = async () => {
    if (!amount || parsedAmount < MIN_LOAN_AMOUNT) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Хамгийн бага зээл ${formatMoney(MIN_LOAN_AMOUNT)}₮` });
      return;
    }
    if (parsedAmount > availableCredit) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Боломжит эрх: ${formatMoney(availableCredit)}₮` });
      return;
    }
    if (activeCount >= 5) {
      Toast.show({ type: 'error', text1: 'ZMS шалгуур', text2: '5 ба түүнээс дээш идэвхтэй зээлтэй үед шинэ зээл авах боломжгүй' });
      return;
    }

    setLoading(true);
    try {
      const response = await applyLoan(parsedAmount, term, 'Хувийн');
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

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          {/* ── Зээлийн эрхийн card ───────────────────────────────────────── */}
          <LinearGradient
            colors={['#7C3AED', '#5B5BD6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.creditCard}
          >
            <View style={styles.creditCardDeco} />
            <Ionicons name="shield-checkmark" size={28} color="rgba(255,255,255,0.9)" />
            <View style={styles.creditCardContent}>
              <Text style={styles.creditCardLabel}>Боломжит зээлийн эрх</Text>
              <Text style={styles.creditCardAmount}>{formatMoney(availableCredit)}₮</Text>
              {multiplier < 1 && (
                <Text style={styles.creditCardSub}>
                  Нийт {formatMoney(effectiveLimit)}₮ · Credit score {creditScore} ({Math.round(multiplier * 100)}%)
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* ── Credit score анхааруулга ──────────────────────────────────── */}
          {creditScore > 0 && creditScore < 500 && (
            <View style={[styles.warnBanner, { borderColor: creditScore < 300 ? '#EF4444' : '#F59E0B' }]}>
              <Ionicons name="alert-circle" size={18} color={creditScore < 300 ? '#EF4444' : '#F59E0B'} />
              <Text style={[styles.warnBannerText, { color: creditScore < 300 ? '#DC2626' : '#92400E' }]}>
                {creditScore < 300
                  ? `Credit score ${creditScore} бага байна — зөвхөн нийт эрхийн 30%-ийг ашиглах боломжтой`
                  : `Credit score ${creditScore} — нийт эрхийн 60%-ийг ашиглах боломжтой`}
              </Text>
            </View>
          )}

          {/* ── ZMS анхааруулга ───────────────────────────────────────────── */}
          {zmsWarning && (
            <View style={[styles.warnBanner, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text style={[styles.warnBannerText, { color: '#DC2626' }]}>
                Та одоо {activeCount}/5 идэвхтэй зээлтэй байна. Нэмэлт зээл авах боломж хязгаарлагдмал.
              </Text>
            </View>
          )}

          {activeCount > 0 && !zmsWarning && (
            <View style={styles.zmsBanner}>
              <Ionicons name="information-circle-outline" size={16} color="#5B5BD6" />
              <Text style={styles.zmsBannerText}>Идэвхтэй зээл: {activeCount}/5 (ZMS шалгуур)</Text>
            </View>
          )}

          {/* ── Дүн оруулах ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Зээлийн дүн</Text>
            <Input
              placeholder="Дүн оруулах"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              suffix="₮"
            />
            {parsedAmount > 0 && parsedAmount < MIN_LOAN_AMOUNT && (
              <Text style={styles.errorHint}>Хамгийн бага дүн {formatMoney(MIN_LOAN_AMOUNT)}₮</Text>
            )}
            {parsedAmount > availableCredit && parsedAmount > 0 && (
              <Text style={styles.errorHint}>Боломжит эрхээс хэтэрсэн байна</Text>
            )}
          </View>

          {/* ── Хугацаа сонгох ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Хугацаа</Text>
            <View style={styles.termGrid}>
              {LOAN_TERMS.map((t) => {
                const isActive = term === t.value;
                const termInterest = parsedAmount >= MIN_LOAN_AMOUNT
                  ? calcInterest(parsedAmount, t.value)
                  : null;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setTerm(t.value)}
                    activeOpacity={0.75}
                    style={[styles.termBtn, isActive && styles.termBtnActive]}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['#5B5BD6', '#22C7BE']}
                        style={styles.termBtnGradient}
                      >
                        <Text style={styles.termBtnLabelActive}>{t.label}</Text>
                        <Text style={styles.termBtnRateActive}>
                          {(MONTHLY_RATE * t.value / 30).toFixed(2)}% хүү
                        </Text>
                        {termInterest !== null && (
                          <Text style={styles.termBtnAmtActive}>+{formatMoney(termInterest)}₮</Text>
                        )}
                      </LinearGradient>
                    ) : (
                      <View style={styles.termBtnInner}>
                        <Text style={styles.termBtnLabel}>{t.label}</Text>
                        <Text style={styles.termBtnRate}>
                          {(MONTHLY_RATE * t.value / 30).toFixed(2)}% хүү
                        </Text>
                        {termInterest !== null && (
                          <Text style={styles.termBtnAmt}>+{formatMoney(termInterest)}₮</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Нэгтгэл ───────────────────────────────────────────────────── */}
          {parsedAmount >= MIN_LOAN_AMOUNT && parsedAmount <= availableCredit && (
            <Card variant="gradient" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Нэгтгэл</Text>

              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.summaryLabel}>Зээлийн дүн</Text>
                </View>
                <Text style={styles.summaryValue}>{formatMoney(parsedAmount)}₮</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Ionicons name="trending-up-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.summaryLabel}>
                    Хүү ({MONTHLY_RATE}%/сар × {term}/30 ={' '}
                    {interestPct}%)
                  </Text>
                </View>
                <Text style={styles.summaryValue}>{formatMoney(interestAmount)}₮</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Ionicons name="card-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.summaryLabelTotal}>Нийт төлөх</Text>
                </View>
                <Text style={styles.summaryValueTotal}>{formatMoney(totalAmount)}₮</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.summaryLabel}>Хугацаа</Text>
                </View>
                <Text style={styles.summaryValue}>{term} хоног</Text>
              </View>
            </Card>
          )}

          {/* ── Хүү тайлбар ───────────────────────────────────────────────── */}
          <View style={styles.rateInfoCard}>
            <Ionicons name="information-circle-outline" size={16} color="#5B5BD6" />
            <Text style={styles.rateInfoText}>
              Хүү: 4.5%/сар · Хугацаа хэтэрвэл нэмэгдүүлсэн хүү: 0.9%/өдөр · Сунгалт: max 4 удаа (10% хураамж)
            </Text>
          </View>

          <Button
            title="Зээл хүсэх"
            onPress={handleApply}
            loading={loading}
            style={styles.applyButton}
            disabled={!amount || parsedAmount < MIN_LOAN_AMOUNT || parsedAmount > availableCredit || activeCount >= 5}
          />

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: COLORS.background },
  flex:        { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: 12, paddingHorizontal: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  scrollContent: { padding: 20 },

  // Credit card
  creditCard: {
    borderRadius: 20, padding: 20, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    overflow: 'hidden',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
  },
  creditCardDeco: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -20,
  },
  creditCardContent: { flex: 1 },
  creditCardLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  creditCardAmount: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  creditCardSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Warning banners
  warnBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF9EC', borderRadius: 12, padding: 12,
    borderWidth: 1, marginBottom: 12,
  },
  warnBannerText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  zmsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEEEFF', borderRadius: 10, padding: 10, marginBottom: 12,
  },
  zmsBannerText: { fontSize: 13, color: '#5B5BD6', fontWeight: '500' },

  // Section
  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  errorHint:    { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },

  // Term grid — 2×2
  termGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  termBtn: {
    width: '47%', borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    overflow: 'hidden', backgroundColor: '#fff',
  },
  termBtnActive:    { borderColor: 'transparent', elevation: 3 },
  termBtnGradient:  { padding: 14 },
  termBtnInner:     { padding: 14 },
  termBtnLabel:     { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  termBtnLabelActive: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  termBtnRate:      { fontSize: 12, color: COLORS.textTertiary },
  termBtnRateActive:{ fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  termBtnAmt:       { fontSize: 12, color: '#64748B', marginTop: 4 },
  termBtnAmtActive: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },

  // Summary
  summaryCard:       { marginBottom: 14 },
  summaryTitle:      { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  summaryRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  summaryRowLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  summaryLabel:      { fontSize: 14, color: COLORS.textSecondary },
  summaryValue:      { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  summaryDivider:    { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryLabelTotal: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  summaryValueTotal: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  // Rate info
  rateInfoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 20,
  },
  rateInfoText: { flex: 1, fontSize: 12, color: '#4338CA', lineHeight: 17 },

  applyButton: { marginBottom: 8 },
});

export default ApplyLoanScreen;