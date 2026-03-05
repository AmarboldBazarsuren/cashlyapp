/**
 * Extend Loan Screen - Зээл сунгах
 * ✅ 2025 ХУУЛИЙН ДАГУУ ШИНЭЧЛЭГДСЭН:
 *  - Сунгалтын хураамж = үндсэн зээлийн 10% (өмнө нь interestAmount байсан)
 *  - Хамгийн их 4 удаа сунгах боломжтой
 *  - 7 хоногийн зээл сунгах ХОРИОТОЙ
 *  - Шинэ дуусах огноо = одоогийн dueDate + term хоног
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getLoanDetails, extendLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';

const MAX_EXTENSIONS = 4;

const ExtendLoanScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { wallet } = useApp();
  const [loan, setLoan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [extending, setExtending] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => { loadLoanDetails(); }, [loanId]);

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

  const confirmExtend = async () => {
    setExtending(true);
    try {
      const response = await extendLoan(loanId);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Амжилттай', text2: response.message });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message || 'Зээл сунгахад алдаа гарлаа' });
    } finally {
      setExtending(false);
    }
  };

  if (loading) return <Loading />;
  if (!loan)   return null;

  // ─── 2025: Сунгалтын хураамж = principal × 10% ─────────────────────────────
  const extensionFee       = Math.round(loan.principal * 0.10);
  const remainingExtensions = MAX_EXTENSIONS - loan.extensionCount;
  const hasBalance          = (wallet?.balance || 0) >= extensionFee;

  // Шинэ дуусах огноо = dueDate + term хоног
  const newDueDate = new Date(loan.dueDate);
  newDueDate.setDate(newDueDate.getDate() + loan.term);

  // 7 хоногийн зээл хориотой
  const is7DayLoan   = loan.term === 7;
  const maxReached   = loan.extensionCount >= MAX_EXTENSIONS;
  const canExtend    = !is7DayLoan && !maxReached && ['active', 'extended'].includes(loan.status);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээл сунгах</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Хориотой тохиолдлуудын анхааруулга ──────────────────────────── */}
        {is7DayLoan && (
          <View style={[styles.alertBanner, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={[styles.alertBannerText, { color: '#DC2626' }]}>
              7 хоногийн зээлийг сунгах боломжгүй (2025 хуулийн дагуу)
            </Text>
          </View>
        )}

        {maxReached && (
          <View style={[styles.alertBanner, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={[styles.alertBannerText, { color: '#DC2626' }]}>
              Та аль хэдийн {MAX_EXTENSIONS} удаа сунгасан байна. Цаашид сунгах боломжгүй.
            </Text>
          </View>
        )}

        {/* ── Сунгалтын тоолуур ────────────────────────────────────────────── */}
        <View style={styles.extensionCounter}>
          {Array.from({ length: MAX_EXTENSIONS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.extensionDot,
                i < loan.extensionCount
                  ? styles.extensionDotUsed
                  : i === loan.extensionCount
                  ? styles.extensionDotNext
                  : styles.extensionDotEmpty,
              ]}
            >
              {i < loan.extensionCount && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
          ))}
          <Text style={styles.extensionCounterText}>
            {loan.extensionCount}/{MAX_EXTENSIONS} сунгалт ашигласан
            {remainingExtensions > 0 && ` · ${remainingExtensions} үлдсэн`}
          </Text>
        </View>

        {/* ── Мэдээллийн card ──────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Сунгалтын мэдээлэл</Text>

          {/* Хураамж */}
          <View style={styles.feeHighlight}>
            <Text style={styles.feeHighlightLabel}>Сунгалтын хураамж (10%)</Text>
            <Text style={styles.feeHighlightAmount}>{formatMoney(extensionFee)}₮</Text>
            <Text style={styles.feeHighlightSub}>Үндсэн зээл {formatMoney(loan.principal)}₮ × 10%</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.infoLabel}>Одоогийн дуусах огноо</Text>
            <Text style={styles.infoValue}>{formatDate(loan.dueDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#10B981" />
            <Text style={styles.infoLabel}>Шинэ дуусах огноо</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>{formatDate(newDueDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.infoLabel}>Нэмэгдэх хугацаа</Text>
            <Text style={styles.infoValue}>+{loan.term} хоног</Text>
          </View>
        </View>

        {/* ── Хэтэвчний мэдээлэл ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Хэтэвчний үлдэгдэл</Text>

          <View style={styles.infoRow}>
            <Ionicons name="wallet-outline" size={16} color="#5B5BD6" />
            <Text style={styles.infoLabel}>Одоогийн үлдэгдэл</Text>
            <Text style={styles.infoValue}>{formatMoney(wallet?.balance || 0)}₮</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="remove-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.infoLabel}>Хасагдах дүн</Text>
            <Text style={[styles.infoValue, { color: '#EF4444' }]}>−{formatMoney(extensionFee)}₮</Text>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={hasBalance ? '#10B981' : '#EF4444'} />
            <Text style={styles.infoLabel}>Сунгасны дараа</Text>
            <Text style={[styles.infoValue, { color: hasBalance ? '#10B981' : '#EF4444', fontWeight: '700' }]}>
              {formatMoney(Math.max(0, (wallet?.balance || 0) - extensionFee))}₮
            </Text>
          </View>

          {!hasBalance && (
            <View style={styles.insufficientWarn}>
              <Ionicons name="warning-outline" size={14} color="#EF4444" />
              <Text style={styles.insufficientWarnText}>
                Хэтэвчний үлдэгдэл хүрэлцэхгүй байна. {formatMoney(extensionFee - (wallet?.balance || 0))}₮ нэмж цэнэглэнэ үү.
              </Text>
            </View>
          )}
        </View>

        {/* ── Тайлбар ──────────────────────────────────────────────────────── */}
        <View style={styles.infoNotice}>
          <Ionicons name="information-circle-outline" size={16} color="#5B5BD6" />
          <Text style={styles.infoNoticeText}>
            Сунгалт хийхэд зөвхөн хураамж (10%) хасагдана. Үндсэн зээлийн дүн хэвээр үлдэнэ.
          </Text>
        </View>

        {/* ── Товч ─────────────────────────────────────────────────────────── */}
        {canExtend ? (
          <>
            <TouchableOpacity
              style={[styles.extendBtn, !hasBalance && styles.extendBtnDisabled]}
              onPress={() => hasBalance && setAlertVisible(true)}
              activeOpacity={hasBalance ? 0.8 : 1}
            >
              <LinearGradient
                colors={hasBalance ? ['#5B5BD6', '#22C7BE'] : ['#D1D5DB', '#9CA3AF']}
                style={styles.extendBtnGradient}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.extendBtnText}>
                  {formatMoney(extensionFee)}₮ төлж сунгах
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!hasBalance && (
              <TouchableOpacity
                style={styles.depositBtn}
                onPress={() => navigation.navigate('Wallet', { screen: 'Deposit' })}
              >
                <Text style={styles.depositBtnText}>Хэтэвч цэнэглэх</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.cannotExtendBox}>
            <Ionicons name="lock-closed" size={24} color="#94A3B8" />
            <Text style={styles.cannotExtendText}>
              {is7DayLoan ? '7 хоногийн зээлийг сунгах боломжгүй' : 'Сунгалтын хязгаарт хүрсэн байна'}
            </Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Зээл сунгах"
        message={`Хэтэвчээс ${formatMoney(extensionFee)}₮ хасагдаж зээлийн хугацаа ${loan.term} хоногоор сунгагдана. Үргэлжлүүлэх үү?`}
        type="info"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Сунгах', onPress: confirmExtend },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F2F4F9' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll:      { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 40 },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1,
  },
  alertBannerText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 19 },

  // Extension counter
  extensionCounter: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  extensionDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  extensionDotUsed:  { backgroundColor: '#10B981' },
  extensionDotNext:  { backgroundColor: '#5B5BD6' },
  extensionDotEmpty: { backgroundColor: '#E2E8F0' },
  extensionCounterText: { flex: 1, fontSize: 13, color: '#64748B', fontWeight: '500' },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14,
    shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F0F1A', marginBottom: 14 },

  feeHighlight: {
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 14, marginBottom: 14, alignItems: 'center',
  },
  feeHighlightLabel:  { fontSize: 12, color: '#5B5BD6', fontWeight: '600', marginBottom: 4 },
  feeHighlightAmount: { fontSize: 28, fontWeight: '900', color: '#5B5BD6', marginBottom: 2 },
  feeHighlightSub:    { fontSize: 12, color: '#64748B' },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel:   { flex: 1, fontSize: 14, color: '#64748B' },
  infoValue:   { fontSize: 14, fontWeight: '600', color: '#0F0F1A' },

  insufficientWarn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginTop: 8,
  },
  insufficientWarnText: { flex: 1, fontSize: 12, color: '#DC2626' },

  infoNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  infoNoticeText: { flex: 1, fontSize: 12, color: '#4338CA', lineHeight: 17 },

  // Buttons
  extendBtn:          { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  extendBtnDisabled:  { opacity: 0.7 },
  extendBtnGradient:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  extendBtnText:      { fontSize: 16, fontWeight: '700', color: '#fff' },

  depositBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  depositBtnText: { fontSize: 15, fontWeight: '600', color: '#5B5BD6' },

  cannotExtendBox: {
    alignItems: 'center', gap: 10, backgroundColor: '#F1F5F9',
    borderRadius: 14, padding: 24, marginBottom: 16,
  },
  cannotExtendText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
});

export default ExtendLoanScreen;