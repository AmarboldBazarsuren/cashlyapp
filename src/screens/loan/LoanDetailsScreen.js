/**
 * Premium Loan Details Screen
 * ✅ 2025 ХУУЛИЙН ДАГУУ ШИНЭЧЛЭГДСЭН:
 *  - Сунгалтын хураамж = principal × 10% харуулах
 *  - Үлдсэн сунгалтын тоо: 4 - extensionCount
 *  - Late fee (хугацаа хэтэрсэн торгууль) тусад нь харуулах
 *  - Extension history харуулах
 *  - 7 хоногийн зээлд сунгах товч нуугдах
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getLoanDetails, repayLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const MAX_EXTENSIONS = 4;

const LoanDetailsScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { wallet, setWallet } = useApp();
  const [loan, setLoan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  useFocusEffect(useCallback(() => { loadLoanDetails(); }, [loanId]));

  const loadLoanDetails = async () => {
    try {
      const response = await getLoanDetails(loanId);
      if (response.success) setLoan(response.data.loan);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Зээлийн мэдээлэл татахад алдаа гарлаа' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRepayPress = () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Төлбөрийн дүн оруулна уу' });
      return;
    }
    const amount   = parseFloat(repayAmount);
    const totalDue = loan.remainingAmount + (loan.lateFee || 0);
    if (amount > totalDue) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: `Төлөх дүн хэт их. Нийт: ${formatMoney(totalDue)}₮` });
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Хэтэвчний үлдэгдэл хүрэлцэхгүй' });
      return;
    }
    setAlertVisible(true);
  };

  const confirmRepay = async () => {
    const amount = parseFloat(repayAmount);
    setRepaying(true);
    try {
      const response = await repayLoan(loanId, amount);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Амжилттай', text2: response.message });
        await loadLoanDetails();
        setRepayAmount('');
        if (response.data?.wallet) setWallet(response.data.wallet);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message || 'Төлбөр төлөхөд алдаа гарлаа' });
    } finally {
      setRepaying(false);
    }
  };

  if (loading) return <Loading />;
  if (!loan)   return null;

  const canRepay         = ['active', 'extended', 'overdue'].includes(loan.status);
  const totalDue         = loan.remainingAmount + (loan.lateFee || 0);
  const progressPercent  = loan.totalAmount > 0
    ? Math.min(100, Math.round((loan.paidAmount / loan.totalAmount) * 100))
    : 0;
  const remainingExtensions = MAX_EXTENSIONS - (loan.extensionCount || 0);
  // 2025: Сунгалтын хураамж = principal × 10%
  const extensionFee     = Math.round(loan.principal * 0.10);
  // Сунгах боломжтой эсэх
  const canExtend = loan.term !== 7 && loan.extensionCount < MAX_EXTENSIONS && canRepay;

  const getStatusColor = () => {
    switch (loan.status) {
      case 'active':   return COLORS.info;
      case 'extended': return COLORS.primary;
      case 'overdue':  return COLORS.danger;
      case 'completed':return COLORS.success;
      case 'pending':  return COLORS.warning;
      default:         return COLORS.textTertiary;
    }
  };
  const getStatusText = () => {
    switch (loan.status) {
      case 'active':    return 'Идэвхтэй';
      case 'extended':  return 'Сунгасан';
      case 'overdue':   return 'Хугацаа хэтэрсэн';
      case 'completed': return 'Дууссан';
      case 'pending':   return 'Хүлээгдэж байна';
      default:          return loan.status;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={loan.status === 'overdue' ? ['#FF6B6B', '#FF9E9E'] : ['#5B5BD6', '#22C7BE']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecoA} />
          <View style={styles.heroDecoB} />

          <View style={styles.heroTop}>
            <Text style={styles.heroLoanNumber}>{loan.loanNumber}</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{getStatusText()}</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>{formatMoney(loan.principal)}₮</Text>
          <Text style={styles.heroLabel}>Зээлийн үндсэн дүн</Text>

          {canRepay && (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressBar}>
                <View style={[styles.heroProgressFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.heroProgressLabels}>
                <Text style={styles.heroProgressText}>{progressPercent}% төлөгдсөн</Text>
                <Text style={styles.heroProgressText}>Үлдэгдэл: {formatMoney(loan.remainingAmount)}₮</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ── САНХҮҮГИЙН НЭГТГЭЛ ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Санхүүгийн нэгтгэл</Text>

          <SummaryRow icon="cash-outline" bg="#EEEEFF" color="#5B5BD6" label="Зээлийн дүн" value={`${formatMoney(loan.principal)}₮`} />
          <SummaryRow icon="trending-up-outline" bg="#FEF9C3" color="#EAB308"
            label={`Хүү (4.5%/сар × ${loan.term}/30 = ${(4.5 * loan.term / 30).toFixed(2)}%)`}
            value={`${formatMoney(loan.interestAmount)}₮`}
          />
          <SummaryRow icon="card-outline" bg="#E5FAFA" color="#22C7BE" label="Нийт" value={`${formatMoney(loan.totalAmount)}₮`} />

          <View style={styles.divider} />

          <SummaryRow icon="checkmark-circle" bg="#E8F8EE" color="#27AE60" label="Төлсөн"
            value={`${formatMoney(loan.paidAmount)}₮`} valueColor={COLORS.success}
          />
          <SummaryRow icon="alert-circle" bg="#FEE2E2" color="#EF4444" label="Үлдэгдэл"
            value={`${formatMoney(loan.remainingAmount)}₮`} valueColor={COLORS.danger} valueBold
          />

          {(loan.lateFee || 0) > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.lateFeeBox}>
                <Ionicons name="warning" size={16} color="#EAB308" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lateFeeTitle}>Хугацаа хэтэрсэн торгууль</Text>
                  <Text style={styles.lateFeeDesc}>
                    {loan.daysOverdue || 0} хоног × (4.5% × 20% / 30) × {formatMoney(loan.principal)}₮
                  </Text>
                </View>
                <Text style={styles.lateFeeAmt}>{formatMoney(loan.lateFee)}₮</Text>
              </View>
              <SummaryRow icon="card-outline" bg="#FEE2E2" color="#EF4444" label="Нийт төлөх (торгуультай)"
                value={`${formatMoney(totalDue)}₮`} valueColor="#EF4444" valueBold
              />
            </>
          )}
        </View>

        {/* ── ОГНОО ──────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Огноо & Хугацаа</Text>
          <View style={styles.dateGrid}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={20} color="#5B5BD6" />
              <Text style={styles.dateItemLabel}>Эхлэсэн</Text>
              <Text style={styles.dateItemValue}>{formatDate(loan.disbursedAt || loan.createdAt)}</Text>
            </View>
            <View style={styles.dateSep} />
            <View style={styles.dateItem}>
              <Ionicons name="time-outline" size={20} color={loan.status === 'overdue' ? '#EF4444' : '#22C7BE'} />
              <Text style={styles.dateItemLabel}>Дуусах</Text>
              <Text style={[styles.dateItemValue, loan.status === 'overdue' && { color: '#EF4444' }]}>
                {formatDate(loan.dueDate)}
              </Text>
            </View>
            {loan.extensionCount > 0 && (
              <>
                <View style={styles.dateSep} />
                <View style={styles.dateItem}>
                  <Ionicons name="refresh-outline" size={20} color="#F59E0B" />
                  <Text style={styles.dateItemLabel}>Сунгалт</Text>
                  <Text style={styles.dateItemValue}>{loan.extensionCount}/{MAX_EXTENSIONS}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── СУНГАЛТЫН МЭДЭЭЛЭЛ ─────────────────────────────────────────── */}
        {canRepay && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Сунгалтын боломж</Text>

            {loan.term === 7 ? (
              <View style={styles.extendNotAvail}>
                <Ionicons name="ban-outline" size={20} color="#EF4444" />
                <Text style={styles.extendNotAvailText}>7 хоногийн зээлийг сунгах боломжгүй (2025 хуулийн дагуу)</Text>
              </View>
            ) : (
              <>
                <View style={styles.extendFeeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.extendFeeLabel}>Сунгалтын хураамж (10%)</Text>
                    <Text style={styles.extendFeeDesc}>Үндсэн зээл {formatMoney(loan.principal)}₮ × 10%</Text>
                  </View>
                  <Text style={styles.extendFeeAmt}>{formatMoney(extensionFee)}₮</Text>
                </View>

                {/* Extension dots */}
                <View style={styles.extDotRow}>
                  {Array.from({ length: MAX_EXTENSIONS }).map((_, i) => (
                    <View key={i} style={[
                      styles.extDot,
                      i < loan.extensionCount ? styles.extDotUsed : styles.extDotEmpty,
                    ]}>
                      {i < loan.extensionCount && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                  ))}
                  <Text style={styles.extDotText}>
                    {remainingExtensions > 0
                      ? `${remainingExtensions} удаа сунгах боломжтой`
                      : 'Сунгалтын хязгаарт хүрсэн'}
                  </Text>
                </View>

                {/* Extension history */}
                {loan.extensions && loan.extensions.length > 0 && (
                  <View style={styles.extHistory}>
                    <Text style={styles.extHistoryTitle}>Сунгалтын түүх</Text>
                    {loan.extensions.map((ext, idx) => (
                      <View key={idx} style={styles.extHistoryRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.extHistoryText}>
                          {idx + 1}-р сунгалт · {formatDate(ext.extendedAt)} · {formatMoney(ext.extensionFee)}₮
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── ТӨЛБӨР ТӨЛӨХ ───────────────────────────────────────────────── */}
        {canRepay && (
          <View style={styles.repayCard}>
            <Text style={styles.cardTitle}>Зээл төлөх</Text>

            <LinearGradient
              colors={['#5B5BD6', '#22C7BE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.totalDueBox}
            >
              <Text style={styles.totalDueLabel}>Нийт төлөх ёстой дүн</Text>
              <Text style={styles.totalDueAmount}>{formatMoney(totalDue)}₮</Text>
              {(loan.lateFee || 0) > 0 && (
                <Text style={styles.totalDueSub}>
                  Үлдэгдэл {formatMoney(loan.remainingAmount)}₮ + Торгууль {formatMoney(loan.lateFee)}₮
                </Text>
              )}
            </LinearGradient>

            <View style={styles.walletInfo}>
              <Ionicons name="wallet-outline" size={16} color="#5B5BD6" />
              <Text style={styles.walletInfoText}>
                Хэтэвчний үлдэгдэл:{' '}
                <Text style={{ fontWeight: '700', color: '#0F0F1A' }}>{formatMoney(wallet?.balance || 0)}₮</Text>
              </Text>
            </View>

            {/* Quick select */}
            <Text style={styles.quickLabel}>Хурдан сонголт</Text>
            <View style={styles.quickRow}>
              {[
                { label: 'Бүгд',  value: totalDue },
                { label: '50%',   value: Math.ceil(totalDue / 2) },
                { label: '25%',   value: Math.ceil(totalDue / 4) },
              ].map((q) => (
                <TouchableOpacity
                  key={q.label}
                  style={[styles.quickBtn, parseFloat(repayAmount) === q.value && styles.quickBtnActive]}
                  onPress={() => setRepayAmount(q.value.toString())}
                >
                  <Text style={[styles.quickBtnText, parseFloat(repayAmount) === q.value && { color: '#5B5BD6' }]}>
                    {q.label}
                  </Text>
                  <Text style={[styles.quickBtnAmt, parseFloat(repayAmount) === q.value && { color: '#5B5BD6' }]}>
                    {formatMoney(q.value)}₮
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Төлөх дүн"
              placeholder="Дүн оруулах"
              value={repayAmount}
              onChangeText={setRepayAmount}
              keyboardType="numeric"
              suffix="₮"
            />

            {repayAmount && parseFloat(repayAmount) > 0 && (
              <View style={styles.calcBox}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Төлөх дүн</Text>
                  <Text style={styles.calcValue}>{formatMoney(parseFloat(repayAmount))}₮</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Үлдэх үлдэгдэл</Text>
                  <Text style={[styles.calcValue, { color: Math.max(0, totalDue - parseFloat(repayAmount)) === 0 ? COLORS.success : COLORS.danger }]}>
                    {formatMoney(Math.max(0, totalDue - parseFloat(repayAmount)))}₮
                  </Text>
                </View>
              </View>
            )}

            <Button
              title={repaying ? 'Төлж байна...' : 'Төлбөр төлөх'}
              onPress={handleRepayPress}
              loading={repaying}
              disabled={!repayAmount || parseFloat(repayAmount) <= 0 || (wallet?.balance || 0) < parseFloat(repayAmount)}
            />
          </View>
        )}

        {/* ── СУНГАХ ТОВЧ ────────────────────────────────────────────────── */}
        {canRepay && canExtend && (
          <TouchableOpacity
            style={styles.extendBtn}
            onPress={() => navigation.navigate('ExtendLoan', { loanId: loan._id })}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#5B5BD6" />
            <View style={{ flex: 1 }}>
              <Text style={styles.extendBtnText}>Зээл сунгах</Text>
              <Text style={styles.extendBtnSub}>
                Хураамж {formatMoney(extensionFee)}₮ · {remainingExtensions} удаа үлдсэн
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#5B5BD6" />
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Зээл төлөх"
        message={`${formatMoney(parseFloat(repayAmount || 0))}₮ төлөх үү?\n\nХэтэвчнээс хасагдана.`}
        type="info"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Төлөх', onPress: confirmRepay },
        ]}
      />
    </SafeAreaView>
  );
};

// Helper component
const SummaryRow = ({ icon, bg, color, label, value, valueColor, valueBold }) => (
  <View style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor && { color: valueColor }, valueBold && { fontWeight: '800', fontSize: 16 }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F2F4F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: '#F2F4F9',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F1A' },
  scrollView:  { flex: 1, paddingHorizontal: 18 },

  heroCard: {
    borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  heroDecoA: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  heroDecoB: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -60, left: -40 },
  heroTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroLoanNumber: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  heroBadge:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)' },
  heroBadgeText:  { fontSize: 13, color: '#fff', fontWeight: '700' },
  heroAmount:     { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 4 },
  heroLabel:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 16 },
  heroProgress:   { marginTop: 8 },
  heroProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  heroProgressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3 },
  heroProgressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  heroProgressText:   { fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F1A', marginBottom: 16 },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowIcon:   { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel:  { flex: 1, fontSize: 13, color: '#64748B' },
  rowValue:  { fontSize: 14, fontWeight: '600', color: '#0F0F1A' },
  divider:   { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },

  lateFeeBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FEF9C3', borderRadius: 12, padding: 12, marginTop: 8,
  },
  lateFeeTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  lateFeeDesc:  { fontSize: 11, color: '#A16207' },
  lateFeeAmt:   { fontSize: 15, fontWeight: '800', color: '#EAB308' },

  dateGrid: { flexDirection: 'row', alignItems: 'center' },
  dateItem: { flex: 1, alignItems: 'center', gap: 4 },
  dateSep:  { width: 1, height: 50, backgroundColor: '#F1F5F9' },
  dateItemLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  dateItemValue: { fontSize: 14, fontWeight: '700', color: '#0F0F1A' },

  extendNotAvail: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
  },
  extendNotAvailText: { flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '500' },

  extendFeeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  extendFeeLabel: { fontSize: 14, fontWeight: '700', color: '#5B5BD6', marginBottom: 2 },
  extendFeeDesc:  { fontSize: 12, color: '#64748B' },
  extendFeeAmt:   { fontSize: 22, fontWeight: '900', color: '#5B5BD6' },

  extDotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  extDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  extDotUsed:  { backgroundColor: '#10B981' },
  extDotEmpty: { backgroundColor: '#E2E8F0' },
  extDotText:  { flex: 1, fontSize: 12, color: '#64748B', fontWeight: '500' },

  extHistory:      { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  extHistoryTitle: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 8 },
  extHistoryRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  extHistoryText:  { fontSize: 12, color: '#64748B' },

  repayCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  totalDueBox: {
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16,
  },
  totalDueLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  totalDueAmount: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  totalDueSub:    { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  walletInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 14,
  },
  walletInfoText: { fontSize: 13, color: '#5B5BD6' },

  quickLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 },
  quickRow:   { flexDirection: 'row', gap: 10, marginBottom: 14 },
  quickBtn: {
    flex: 1, backgroundColor: '#F8F9FC', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  quickBtnActive: { backgroundColor: '#EEEEFF', borderColor: '#5B5BD6' },
  quickBtnText:   { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 2 },
  quickBtnAmt:    { fontSize: 11, color: '#94A3B8' },

  calcBox: { backgroundColor: '#F8F9FC', borderRadius: 12, padding: 12, marginBottom: 14 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  calcLabel: { fontSize: 13, color: '#64748B' },
  calcValue: { fontSize: 14, fontWeight: '700', color: '#0F0F1A' },

  extendBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#EEEEFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#D4D4F8',
  },
  extendBtnText: { fontSize: 15, fontWeight: '700', color: '#5B5BD6' },
  extendBtnSub:  { fontSize: 12, color: '#64748B', marginTop: 2 },
});

export default LoanDetailsScreen;