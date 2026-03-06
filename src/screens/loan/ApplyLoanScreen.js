/**
 * ApplyLoanScreen.js
 * ✅ ANDROID + iOS: KeyboardAvoidingView → "Зээл хүсэх" button keyboard-аар хаагдахгүй
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { applyLoan } from '../../services/loanService';
import { COLORS } from '../../constants/colors';
import Toast from 'react-native-toast-message';

const DURATIONS = [
  { days: 7,  label: '7 хоног',  rate: 1.05 },
  { days: 14, label: '14 хоног', rate: 2.10 },
  { days: 21, label: '21 хоног', rate: 3.15 },
  { days: 30, label: '30 хоног', rate: 4.50 },
];

const fmt = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function ApplyLoanScreen({ navigation }) {
  const { user } = useAuth();
  const { activeLoans } = useApp();
  const insets = useSafeAreaInsets();

  const [amount, setAmount]     = useState('');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [loading, setLoading]   = useState(false);

  const totalLimit      = user?.creditLimit || 0;
  const usedLimit       = user?.usedCreditLimit || 0;
  const availableCredit = Math.max(0, totalLimit - usedLimit);

  const externalLoans    = user?.externalActiveLoansCount || 0;
  const totalActiveLoans = (activeLoans?.length || 0) + externalLoans;

  const numAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const interest  = Math.round(numAmount * (duration.rate / 100));
  const totalPay  = numAmount + interest;
  const canApply  = numAmount >= 100000 && numAmount <= availableCredit && totalActiveLoans < 5;

  const handleAmountChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '');
    const num   = parseInt(clean, 10);
    setAmount(clean ? fmt(num) : '');
  };

  const handleApply = async () => {
    if (!canApply) return;
    setLoading(true);
    try {
      const res = await applyLoan({ amount: numAmount, duration: duration.days });
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Амжилттай!', text2: 'Зээлийн хүсэлт илгээгдлээ' });
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Алдаа', text2: res.message || 'Дахин оролдоно уу' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: 'Сүлжээний алдаа гарлаа' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={S.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#5B5BD6" translucent={false} />

      {/* Header */}
      <LinearGradient
        colors={['#5B5BD6', '#7C3AED']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[S.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Зээл авах</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={S.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Credit limit card */}
        <LinearGradient
          colors={['#7C3AED', '#5B5BD6']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={S.limitCard}
        >
          <View style={S.limitDeco} />
          <View style={S.limitRow}>
            <View style={S.limitIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color="#fff" />
            </View>
            <View>
              <Text style={S.limitCaption}>Боломжит зээлийн эрх</Text>
              <Text style={S.limitAmt}>{fmt(availableCredit)}₮</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ZMS warning */}
        {totalActiveLoans > 0 && (
          <View style={[S.infoBox, totalActiveLoans >= 4 && S.infoBoxWarn]}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={totalActiveLoans >= 4 ? '#EF4444' : '#5B5BD6'}
            />
            <Text style={[S.infoTxt, totalActiveLoans >= 4 && { color: '#EF4444' }]}>
              Идэвхтэй зээл: {totalActiveLoans}/5 (ZMS шалгуур)
              {totalActiveLoans >= 4 ? ' · Хязгаарт ойртсон!' : ''}
            </Text>
          </View>
        )}

        {/* Amount input */}
        <Text style={S.label}>Зээлийн дүн</Text>
        <View style={S.inputWrap}>
          <TextInput
            style={S.input}
            placeholder="Дүн оруулах"
            placeholderTextColor="#CBD5E1"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
          />
          <Text style={S.inputSuffix}>₮</Text>
        </View>
        {numAmount > 0 && numAmount < 100000 && (
          <Text style={S.errTxt}>Хамгийн бага дүн: 100,000₮</Text>
        )}
        {numAmount > availableCredit && availableCredit > 0 && (
          <Text style={S.errTxt}>Боломжит эрхээс хэтэрсэн</Text>
        )}

        {/* Duration picker */}
        <Text style={S.label}>Хугацаа</Text>
        <View style={S.durationGrid}>
          {DURATIONS.map(d => {
            const active = d.days === duration.days;
            return (
              <TouchableOpacity
                key={d.days}
                style={[S.durationBtn, active && S.durationBtnActive]}
                onPress={() => setDuration(d)}
                activeOpacity={0.75}
              >
                {active ? (
                  <LinearGradient
                    colors={['#5B5BD6', '#22C7BE']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={S.durationGrad}
                  >
                    <Text style={[S.durationLabel, { color: '#fff' }]}>{d.label}</Text>
                    <Text style={[S.durationRate, { color: 'rgba(255,255,255,0.85)' }]}>{d.rate}% хүү</Text>
                  </LinearGradient>
                ) : (
                  <View style={S.durationInner}>
                    <Text style={S.durationLabel}>{d.label}</Text>
                    <Text style={S.durationRate}>{d.rate}% хүү</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Calculation summary */}
        {numAmount >= 100000 && (
          <View style={S.summaryCard}>
            {[
              { label: 'Зээлийн дүн', val: `${fmt(numAmount)}₮`,  color: '#0F0F1A' },
              { label: 'Хүүгийн дүн', val: `${fmt(interest)}₮`,   color: '#EF4444' },
              { label: 'Нийт төлбөр', val: `${fmt(totalPay)}₮`,   color: '#5B5BD6', bold: true },
            ].map((r, i, arr) => (
              <View key={r.label} style={[S.summaryRow, i < arr.length - 1 && S.summaryBorder]}>
                <Text style={S.summaryLabel}>{r.label}</Text>
                <Text style={[S.summaryVal, { color: r.color }, r.bold && S.summaryValBold]}>{r.val}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Info note */}
        <View style={S.noteBox}>
          <Ionicons name="information-circle-outline" size={14} color="#5B5BD6" />
          <Text style={S.noteTxt}>
            Хүү: 4.5%/сар · Хугацаа хэтэрвэл нэмэгдүүлсэн хүү: 0.9%/өдөр · Сунгалт: max 4 удаа (10% хураамж)
          </Text>
        </View>

        {/* Apply button — ScrollView доторх, keyboard гарахад scroll хийж харагдана */}
        <TouchableOpacity
          onPress={handleApply}
          disabled={!canApply || loading}
          activeOpacity={0.85}
          style={{ marginBottom: 40 }}
        >
          {canApply && !loading ? (
            <LinearGradient
              colors={['#5B5BD6', '#22C7BE']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={S.applyBtn}
            >
              <Text style={S.applyBtnTxt}>Зээл хүсэх</Text>
            </LinearGradient>
          ) : (
            <View style={[S.applyBtn, S.applyBtnDisabled]}>
              <Text style={[S.applyBtnTxt, { color: '#94A3B8' }]}>
                {loading ? 'Илгээж байна...' : 'Зээл хүсэх'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F2F4F9' },
  scroll: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14 },
  backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  limitCard:    { borderRadius: 18, padding: 18, marginBottom: 14, overflow: 'hidden' },
  limitDeco:    { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -20 },
  limitRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  limitIconWrap:{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  limitCaption: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  limitAmt:     { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },

  infoBox:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#D4D4F8' },
  infoBoxWarn: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  infoTxt:     { fontSize: 12, color: '#5B5BD6', fontWeight: '500', flex: 1 },

  label:      { fontSize: 15, fontWeight: '700', color: '#0F0F1A', marginBottom: 10 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, marginBottom: 6, borderWidth: 1, borderColor: '#E8EBF4', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  input:      { flex: 1, fontSize: 20, fontWeight: '700', color: '#0F0F1A', paddingVertical: 16 },
  inputSuffix:{ fontSize: 18, fontWeight: '700', color: '#94A3B8' },
  errTxt:     { fontSize: 12, color: '#EF4444', marginBottom: 10, marginLeft: 4 },

  durationGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  durationBtn:      { width: '47%', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E8EBF4' },
  durationBtnActive:{ borderColor: 'transparent' },
  durationGrad:     { padding: 16 },
  durationInner:    { padding: 16, backgroundColor: '#fff' },
  durationLabel:    { fontSize: 15, fontWeight: '700', color: '#0F0F1A', marginBottom: 4 },
  durationRate:     { fontSize: 12, color: '#94A3B8' },

  summaryCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  summaryLabel:  { fontSize: 14, color: '#64748B' },
  summaryVal:    { fontSize: 14, fontWeight: '600' },
  summaryValBold:{ fontSize: 16, fontWeight: '800' },

  noteBox: { flexDirection: 'row', gap: 8, backgroundColor: '#EEEEFF', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#D4D4F8' },
  noteTxt: { fontSize: 11, color: '#5B5BD6', flex: 1, lineHeight: 17 },

  applyBtn:         { borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  applyBtnDisabled: { backgroundColor: '#E2E8F0' },
  applyBtnTxt:      { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});