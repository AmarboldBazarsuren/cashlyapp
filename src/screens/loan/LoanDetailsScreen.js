/**
 * Premium Loan Details Screen
 * ✅ ЗАСВАР: react-native-vector-icons → @expo/vector-icons
 * ✅ Төлбөр төлөх хэсэг сайжруулсан
 * ✅ SafeAreaView нэмсэн
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getLoanDetails, repayLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const LoanDetailsScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { wallet, setWallet } = useApp();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadLoanDetails();
    }, [loanId])
  );

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

  const handleRepayPress = () => {
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
        // Хэтэвчний үлдэгдэл шинэчлэх
        if (response.data?.wallet) setWallet(response.data.wallet);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message || 'Төлбөр төлөхөд алдаа гарлаа' });
    } finally {
      setRepaying(false);
    }
  };

  if (loading) return <Loading />;
  if (!loan) return null;

  const canRepay = ['active', 'extended', 'overdue'].includes(loan.status);
  const totalDue = loan.remainingAmount + (loan.lateFee || 0);
  const progressPercent = loan.totalAmount > 0
    ? Math.min(100, Math.round((loan.paidAmount / loan.totalAmount) * 100))
    : 0;

  const getStatusColor = () => {
    switch (loan.status) {
      case 'active': return COLORS.info;
      case 'extended': return COLORS.primary;
      case 'overdue': return COLORS.danger;
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      default: return COLORS.textTertiary;
    }
  };

  const getStatusText = () => {
    switch (loan.status) {
      case 'active': return 'Идэвхтэй';
      case 'extended': return 'Сунгасан';
      case 'overdue': return 'Хугацаа хэтэрсэн';
      case 'completed': return 'Дууссан';
      case 'pending': return 'Хүлээгдэж байна';
      default: return loan.status;
    }
  };

  const statusColor = getStatusColor();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ────────────────────── */}
        <LinearGradient
          colors={loan.status === 'overdue' ? ['#FF6B6B', '#FF9E9E'] : ['#5B5BD6', '#22C7BE']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecoA} />
          <View style={styles.heroDecoB} />

          <View style={styles.heroTop}>
            <Text style={styles.heroLoanNumber}>{loan.loanNumber}</Text>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.heroBadgeText}>{getStatusText()}</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>{formatMoney(loan.principal)}₮</Text>
          <Text style={styles.heroLabel}>Зээлийн үндсэн дүн</Text>

          {/* Progress */}
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

        {/* ── НЭГТГЭЛ ────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Санхүүгийн нэгтгэл</Text>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#EEEEFF' }]}>
              <Ionicons name="cash-outline" size={18} color="#5B5BD6" />
            </View>
            <Text style={styles.rowLabel}>Зээлийн дүн</Text>
            <Text style={styles.rowValue}>{formatMoney(loan.principal)}₮</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="trending-up-outline" size={18} color="#EAB308" />
            </View>
            <Text style={styles.rowLabel}>Хүү ({loan.interestRate}%)</Text>
            <Text style={styles.rowValue}>{formatMoney(loan.interestAmount)}₮</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#E5FAFA' }]}>
              <Ionicons name="card-outline" size={18} color="#22C7BE" />
            </View>
            <Text style={styles.rowLabel}>Нийт</Text>
            <Text style={styles.rowValue}>{formatMoney(loan.totalAmount)}₮</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#E8F8EE' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
            </View>
            <Text style={styles.rowLabel}>Төлсөн</Text>
            <Text style={[styles.rowValue, { color: COLORS.success }]}>{formatMoney(loan.paidAmount)}₮</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.rowLabel, { fontWeight: '700', color: '#0F0F1A' }]}>Үлдэгдэл</Text>
            <Text style={[styles.rowValue, { fontSize: 17, fontWeight: '800', color: COLORS.danger }]}>
              {formatMoney(loan.remainingAmount)}₮
            </Text>
          </View>

          {(loan.lateFee || 0) > 0 && (
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="warning" size={18} color="#EAB308" />
              </View>
              <Text style={[styles.rowLabel, { color: COLORS.warning }]}>Хоцролтын торгууль</Text>
              <Text style={[styles.rowValue, { color: COLORS.warning }]}>{formatMoney(loan.lateFee)}₮</Text>
            </View>
          )}
        </View>

        {/* ── ОГНОО ────────────────────── */}
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
                  <Text style={styles.dateItemValue}>{loan.extensionCount} удаа</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── ТӨЛБӨР ТӨЛӨХ ────────────────────── */}
        {canRepay && (
          <View style={styles.repayCard}>
            <Text style={styles.cardTitle}>Зээл төлөх</Text>

            {/* Нийт төлөх */}
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

            {/* Хэтэвч үлдэгдэл */}
            <View style={styles.walletInfo}>
              <Ionicons name="wallet-outline" size={18} color="#5B5BD6" />
              <Text style={styles.walletInfoText}>
                Хэтэвчний үлдэгдэл: <Text style={{ fontWeight: '700', color: '#0F0F1A' }}>
                  {formatMoney(wallet?.balance || 0)}₮
                </Text>
              </Text>
            </View>

            {/* Хурдан сонголт */}
            <Text style={styles.quickLabel}>Хурдан сонголт</Text>
            <View style={styles.quickRow}>
              {[
                { label: 'Бүгд', value: totalDue },
                { label: '50%', value: Math.ceil(totalDue / 2) },
                { label: '25%', value: Math.ceil(totalDue / 4) },
              ].map((q) => (
                <TouchableOpacity
                  key={q.label}
                  style={[
                    styles.quickBtn,
                    parseFloat(repayAmount) === q.value && styles.quickBtnActive,
                  ]}
                  onPress={() => setRepayAmount(q.value.toString())}
                >
                  <Text style={[
                    styles.quickBtnText,
                    parseFloat(repayAmount) === q.value && { color: '#5B5BD6', fontWeight: '700' },
                  ]}>
                    {q.label}
                  </Text>
                  <Text style={[
                    styles.quickBtnAmt,
                    parseFloat(repayAmount) === q.value && { color: '#5B5BD6' },
                  ]}>
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

            {/* Тооцоолол */}
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
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Хэтэвч үлдэгдэл</Text>
                  <Text style={styles.calcValue}>
                    {formatMoney(Math.max(0, (wallet?.balance || 0) - parseFloat(repayAmount)))}₮
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

        {/* ── СУНГАХ ────────────────────── */}
        {canRepay && loan.extensionCount < 4 && (
          <TouchableOpacity
            style={styles.extendBtn}
            onPress={() => navigation.navigate('ExtendLoan', { loanId: loan._id })}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#5B5BD6" />
            <Text style={styles.extendBtnText}>Зээл сунгах</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    backgroundColor: '#F2F4F9',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F1A' },
  scrollView: { flex: 1, paddingHorizontal: 18 },

  // Hero
  heroCard: {
    borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  heroDecoA: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  heroDecoB: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -60, left: -40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroLoanNumber: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  heroBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  heroBadgeText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  heroAmount: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 4 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 16 },
  heroProgress: { marginTop: 8 },
  heroProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  heroProgressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3 },
  heroProgressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  heroProgressText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F1A', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14, color: '#64748B' },
  rowValue: { fontSize: 15, fontWeight: '600', color: '#0F0F1A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },

  // Dates
  dateGrid: { flexDirection: 'row', alignItems: 'center' },
  dateItem: { flex: 1, alignItems: 'center', gap: 4 },
  dateSep: { width: 1, height: 50, backgroundColor: '#F1F5F9' },
  dateItemLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  dateItemValue: { fontSize: 14, fontWeight: '700', color: '#0F0F1A' },

  // Repay
  repayCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  totalDueBox: {
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16,
  },
  totalDueLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  totalDueAmount: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  totalDueSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  walletInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  walletInfoText: { fontSize: 14, color: '#5B5BD6' },

  quickLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: {
    flex: 1, backgroundColor: '#F8F9FC', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  quickBtnActive: { backgroundColor: '#EEEEFF', borderColor: '#5B5BD6' },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 2 },
  quickBtnAmt: { fontSize: 11, color: '#94A3B8' },

  calcBox: {
    backgroundColor: '#F8F9FC', borderRadius: 12, padding: 14, marginBottom: 16, gap: 8,
  },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calcLabel: { fontSize: 13, color: '#64748B' },
  calcValue: { fontSize: 14, fontWeight: '700', color: '#0F0F1A' },

  // Extend
  extendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EEEEFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#D4D4F8',
  },
  extendBtnText: { fontSize: 15, fontWeight: '700', color: '#5B5BD6', flex: 1, textAlign: 'center' },
});

export default LoanDetailsScreen;