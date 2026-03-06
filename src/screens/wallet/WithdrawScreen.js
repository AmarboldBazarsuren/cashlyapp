/**
 * WithdrawScreen — Minimal
 * ✅ Хамгийн бага татан авах дүн: 20,000₮
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';
import { requestWithdrawal } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const MIN_WITHDRAW = 20000;

const PCT_BTNS = [
  { label: '25%', pct: 0.25 },
  { label: '50%', pct: 0.50 },
  { label: '75%', pct: 0.75 },
  { label: 'Бүгд', pct: 1 },
];

export default function WithdrawScreen({ navigation }) {
  const { user } = useAuth();
  const { wallet, setWallet } = useApp();

  const availableBalance = wallet?.availableBalance ?? wallet?.balance ?? 0;
  const bankInfo = user?.personalInfo?.bankInfo;
  const hasBankInfo = !!(bankInfo?.bankName && bankInfo?.accountNumber);

  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('confirm');
  const inputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const amount = parseInt(raw.replace(/\D/g, ''), 10) || 0;
  const remaining = availableBalance - amount;
  const overLimit = amount > availableBalance;
  const isValid = amount >= MIN_WITHDRAW && !overLimit;
  const noFunds = availableBalance < MIN_WITHDRAW;

  const handleChange = (text) => setRaw(text.replace(/\D/g, ''));

  const setPct = (pct) => {
    const v = Math.floor((availableBalance * pct) / MIN_WITHDRAW) * MIN_WITHDRAW;
    setRaw(String(Math.max(MIN_WITHDRAW, Math.min(availableBalance, v))));
  };

  const shake = () => Animated.sequence([
    Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();

  const handleWithdraw = () => {
    if (noFunds) { Toast.show({ type: 'error', text1: `Хамгийн бага ${formatMoney(MIN_WITHDRAW)}₮ шаардлагатай` }); return; }
    if (!hasBankInfo) { setAlertType('bank'); setAlertVisible(true); return; }
    if (!isValid) {
      shake();
      Toast.show({ type: 'error', text1: overLimit ? 'Үлдэгдэлээс хэтэрсэн' : `Хамгийн бага дүн ${formatMoney(MIN_WITHDRAW)}₮` });
      return;
    }
    setAlertType('confirm');
    setAlertVisible(true);
  };

  const confirmWithdraw = async () => {
    setLoading(true);
    try {
      const res = await requestWithdrawal(amount);
      if (res.success) {
        setWallet(res.data.wallet);
        Toast.show({ type: 'success', text1: '✓ Татах хүсэлт амжилттай!' });
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'WalletMain' }] }));
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'WalletMain' }] }));

  const displayValue = raw ? formatMoney(parseInt(raw, 10)) : '';
  const inputColor = overLimit ? '#FF3B30' : '#1C1C1E';
  const lineColor = focused ? (overLimit ? '#FF3B30' : '#F97316') : '#E5E5EA';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={goBack} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Татан авах</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance card */}
        <View style={s.balCard}>
          <View>
            <Text style={s.balLabel}>Боломжит үлдэгдэл</Text>
            <Text style={s.balAmt}>{formatMoney(availableBalance)}<Text style={s.balCur}>₮</Text></Text>
          </View>
          <View style={[s.statusBadge, noFunds && s.statusBadgeWarn]}>
            <View style={[s.statusDot, { backgroundColor: noFunds ? '#FF9500' : '#34C759' }]} />
            <Text style={[s.statusTxt, noFunds && { color: '#FF9500' }]}>
              {noFunds ? 'Дутмаг' : 'Боломжтой'}
            </Text>
          </View>
        </View>

        {noFunds ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>💸</Text>
            <Text style={s.emptyTitle}>Үлдэгдэл хүрэлцэхгүй</Text>
            <Text style={s.emptySub}>Хамгийн бага {formatMoney(MIN_WITHDRAW)}₮ шаардлагатай</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={s.flex}
              contentContainerStyle={s.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Input block */}
              <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={s.inputBlock}>
                <Text style={s.inputLabel}>ТАТАХ ДҮН</Text>

                <Animated.View style={[s.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
                  <TextInput
                    ref={inputRef}
                    value={displayValue}
                    onChangeText={handleChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#D1D1D6"
                    style={[s.inputNum, { color: inputColor }]}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    selectionColor="#F97316"
                    maxLength={13}
                  />
                  <Text style={[s.inputCur, { color: overLimit ? '#FF3B30' : '#AEAEB2' }]}>₮</Text>
                </Animated.View>

                <View style={[s.inputLine, { backgroundColor: lineColor }]} />

                <Text style={[s.hint, overLimit && s.hintError]}>
                  {!raw
                    ? `Хамгийн бага ${formatMoney(MIN_WITHDRAW)}₮`
                    : overLimit
                    ? `Хамгийн ихдээ ${formatMoney(availableBalance)}₮ татах боломжтой`
                    : !isValid
                    ? `Хамгийн бага дүн ${formatMoney(MIN_WITHDRAW)}₮`
                    : `Үлдэх дүн → ${formatMoney(remaining)}₮`}
                </Text>
              </TouchableOpacity>

              {/* % Presets */}
              <View style={s.pctRow}>
                {PCT_BTNS.map((p) => {
                  const v = Math.floor((availableBalance * p.pct) / MIN_WITHDRAW) * MIN_WITHDRAW;
                  const active = amount === v && v >= MIN_WITHDRAW;
                  return (
                    <TouchableOpacity key={p.label} onPress={() => setPct(p.pct)} style={[s.pctBtn, active && s.pctBtnActive]} activeOpacity={0.7}>
                      <Text style={[s.pctTxt, active && s.pctTxtActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Summary */}
              {isValid && (
                <View style={s.summary}>
                  <View style={s.sumRow}>
                    <Text style={s.sumLabel}>Татан авах</Text>
                    <Text style={[s.sumVal, s.sumNeg]}>−{formatMoney(amount)}₮</Text>
                  </View>
                  <View style={s.sumDivider} />
                  <View style={s.sumRow}>
                    <Text style={s.sumTotalLabel}>Үлдэх дүн</Text>
                    <Text style={s.sumTotalVal}>{formatMoney(remaining)}₮</Text>
                  </View>
                </View>
              )}

              {/* Bank info note */}
              {!hasBankInfo && (
                <TouchableOpacity
                  style={s.bankWarn}
                  onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="alert-circle-outline" size={18} color="#FF9500" />
                  <Text style={s.bankWarnTxt}>Банкны мэдээлэл бүртгэгдээгүй. Профайл → нэмэх</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FF9500" />
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* CTA — OUTSIDE ScrollView, always visible */}
            <View style={s.ctaWrap}>
              <TouchableOpacity onPress={handleWithdraw} disabled={loading} activeOpacity={0.88}>
                <LinearGradient
                  colors={isValid ? ['#F97316', '#EA580C'] : ['#E5E5EA', '#E5E5EA']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.cta}
                >
                  <Text style={[s.ctaTxt, !isValid && s.ctaTxtDisabled]}>
                    {loading ? 'Гүйцэтгэж байна...' : isValid ? `${formatMoney(amount)}₮  татан авах` : 'Татан авах'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}

      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertType === 'bank' ? 'Банкны мэдээлэл' : 'Татан авах'}
        message={
          alertType === 'bank'
            ? 'Банкны мэдээлэл бүртгэгдээгүй байна. Профайл хэсэгт нэмнэ үү.'
            : `${formatMoney(amount)}₮ татан авах уу?`
        }
        type={alertType === 'bank' ? 'warning' : 'info'}
        buttons={
          alertType === 'bank'
            ? [
                { text: 'Болих', style: 'cancel' },
                { text: 'Профайл', onPress: () => navigation.navigate('Profile', { screen: 'ProfileMain' }) },
              ]
            : [
                { text: 'Болих', style: 'cancel' },
                { text: 'Илгээх', onPress: confirmWithdraw },
              ]
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  balCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16,
    padding: 18, marginBottom: 4,
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  balLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  balAmt: { fontSize: 24, fontWeight: '800', color: '#1C1C1E' },
  balCur: { fontSize: 15, color: '#8E8E93', fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  statusBadgeWarn: { backgroundColor: '#FFF3E0' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusTxt: { fontSize: 12, fontWeight: '600', color: '#34C759' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  emptySub: { fontSize: 14, color: '#8E8E93' },

  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },

  inputBlock: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#AEAEB2', letterSpacing: 1.2, marginBottom: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  inputNum: {
    fontSize: 52, fontWeight: '700', letterSpacing: -1.5,
    flex: 1, paddingVertical: 0, includeFontPadding: false,
  },
  inputCur: { fontSize: 28, fontWeight: '600', paddingBottom: 7 },
  inputLine: { height: 2, borderRadius: 1, marginTop: 14 },
  hint: { fontSize: 13, color: '#AEAEB2', marginTop: 10 },
  hintError: { color: '#FF3B30' },

  pctRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  pctBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F2F2F7', alignItems: 'center',
  },
  pctBtnActive: { backgroundColor: '#FFF0E6' },
  pctTxt: { fontSize: 14, fontWeight: '700', color: '#8E8E93' },
  pctTxtActive: { color: '#F97316' },

  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  sumLabel: { fontSize: 15, color: '#8E8E93' },
  sumVal: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  sumNeg: { color: '#FF3B30' },
  sumDivider: { height: 1, backgroundColor: '#F2F2F7' },
  sumTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  sumTotalVal: { fontSize: 20, fontWeight: '800', color: '#F97316' },

  bankWarn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  bankWarnTxt: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '500' },

  ctaWrap: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FAFAFA' },
  cta: { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#fff' },
  ctaTxtDisabled: { color: '#AEAEB2' },
});