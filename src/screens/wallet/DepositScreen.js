/**
 * DepositScreen — Minimal
 * ✅ Хамгийн бага цэнэглэх дүн: 1,000₮
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
import { deposit } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const MIN_DEPOSIT = 1000;
const QUICK = [5000, 10000, 50000, 100000];

export default function DepositScreen({ navigation }) {
  const { wallet, setWallet } = useApp();
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const inputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const balance = wallet?.balance ?? 0;
  const amount = parseInt(raw.replace(/\D/g, ''), 10) || 0;
  const isValid = amount >= MIN_DEPOSIT;
  const after = balance + amount;

  const handleChange = (text) => setRaw(text.replace(/\D/g, ''));

  const addQuick = (v) => {
    const next = Math.min(1000000, amount + v);
    setRaw(String(next));
  };

  const shake = () => Animated.sequence([
    Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();

  const handleDeposit = () => {
    if (!isValid) {
      shake();
      Toast.show({ type: 'error', text1: `Хамгийн бага дүн ${formatMoney(MIN_DEPOSIT)}₮` });
      return;
    }
    setAlertVisible(true);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await deposit(amount, 'admin', 'DEP_' + Date.now());
      if (res.success) {
        setWallet(res.data.wallet);
        Toast.show({ type: 'success', text1: '✓ Амжилттай цэнэглэгдлээ!' });
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

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={goBack} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Цэнэглэх</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Balance chip */}
          <View style={s.balChip}>
            <View style={s.dot} />
            <Text style={s.balTxt}>Үлдэгдэл: <Text style={s.balAmt}>{formatMoney(balance)}₮</Text></Text>
          </View>

          {/* Big input */}
          <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={s.inputBlock}>
            <Text style={s.inputLabel}>ДҮНГЭЭ ОРУУЛНА УУ</Text>

            <Animated.View style={[s.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
              <TextInput
                ref={inputRef}
                value={displayValue}
                onChangeText={handleChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#D1D1D6"
                style={s.inputNum}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor={COLORS.primary || '#7C6EFF'}
                maxLength={13}
              />
              <Text style={s.inputCur}>₮</Text>
            </Animated.View>

            <View style={[s.inputLine, focused && s.inputLineFocused]} />

            <Text style={[s.hint, !isValid && raw.length > 0 && s.hintError]}>
              {!raw
                ? `Хамгийн бага ${formatMoney(MIN_DEPOSIT)}₮`
                : !isValid
                ? `Хамгийн бага дүн ${formatMoney(MIN_DEPOSIT)}₮`
                : `Цэнэглэсний дараа → ${formatMoney(after)}₮`}
            </Text>
          </TouchableOpacity>

          {/* Quick add */}
          <View style={s.quickRow}>
            {QUICK.map((v) => (
              <TouchableOpacity key={v} onPress={() => addQuick(v)} style={s.quickBtn} activeOpacity={0.7}>
                <Text style={s.quickTxt}>
                  +{v >= 1000000 ? '1М' : v >= 1000 ? `${v / 1000}К` : v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary — only when valid */}
          {isValid && (
            <View style={s.summary}>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Одоогийн үлдэгдэл</Text>
                <Text style={s.sumVal}>{formatMoney(balance)}₮</Text>
              </View>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Нэмэгдэх дүн</Text>
                <Text style={[s.sumVal, s.sumPos]}>+{formatMoney(amount)}₮</Text>
              </View>
              <View style={s.sumDivider} />
              <View style={s.sumRow}>
                <Text style={s.sumTotalLabel}>Шинэ үлдэгдэл</Text>
                <Text style={s.sumTotalVal}>{formatMoney(after)}₮</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* CTA — OUTSIDE ScrollView, always visible */}
        <View style={s.ctaWrap}>
          <TouchableOpacity onPress={handleDeposit} disabled={loading} activeOpacity={0.88}>
            <LinearGradient
              colors={isValid ? [COLORS.gradientStart || '#7C6EFF', COLORS.gradientMiddle || '#9F8FFF'] : ['#E5E5EA', '#E5E5EA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.cta}
            >
              <Text style={[s.ctaTxt, !isValid && s.ctaTxtDisabled]}>
                {loading ? 'Цэнэглэж байна...' : isValid ? `${formatMoney(amount)}₮  нэмэх` : 'Цэнэглэх'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Цэнэглэх"
        message={`${formatMoney(amount)}₮ нэмэх үү?`}
        type="info"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Тийм', onPress: confirm },
        ]}
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

  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },

  balChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F2F7', alignSelf: 'flex-start',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 40,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#34C759', marginRight: 7 },
  balTxt: { fontSize: 13, color: '#8E8E93' },
  balAmt: { fontWeight: '700', color: '#1C1C1E' },

  inputBlock: { marginBottom: 24 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#AEAEB2', letterSpacing: 1.2, marginBottom: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  inputNum: {
    fontSize: 52, fontWeight: '700', color: '#1C1C1E',
    letterSpacing: -1.5, flex: 1,
    paddingVertical: 0, includeFontPadding: false,
  },
  inputCur: { fontSize: 28, fontWeight: '600', color: '#AEAEB2', paddingBottom: 7 },
  inputLine: { height: 2, borderRadius: 1, backgroundColor: '#E5E5EA', marginTop: 14 },
  inputLineFocused: { backgroundColor: COLORS.primary || '#7C6EFF' },
  hint: { fontSize: 13, color: '#AEAEB2', marginTop: 10 },
  hintError: { color: '#FF3B30' },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  quickBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F2F2F7', alignItems: 'center',
  },
  quickTxt: { fontSize: 14, fontWeight: '700', color: COLORS.primary || '#7C6EFF' },

  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#F2F2F7' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  sumLabel: { fontSize: 15, color: '#8E8E93' },
  sumVal: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  sumPos: { color: '#34C759' },
  sumDivider: { height: 1, backgroundColor: '#F2F2F7' },
  sumTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  sumTotalVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary || '#7C6EFF' },

  ctaWrap: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FAFAFA' },
  cta: { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaTxt: { fontSize: 17, fontWeight: '700', color: '#fff' },
  ctaTxtDisabled: { color: '#AEAEB2' },
});