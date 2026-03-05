/**
 * TransactionHistoryScreen.js
 * ✅ Background: саарал (#F2F4F9), item бүр өөрийн цагаан card → давхар bg байхгүй
 * ✅ useSafeAreaInsets → status bar overlap байхгүй
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTransactions } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';

const TX_TYPE = {
  deposit:           { icon: 'arrow-down-circle', color: '#27AE60', bg: '#E8F8EE', label: 'Цэнэглэлт',         sign: '+' },
  withdrawal:        { icon: 'arrow-up-circle',   color: '#EF4444', bg: '#FEE2E2', label: 'Татах',              sign: '-' },
  loan_disbursement: { icon: 'wallet',            color: '#5B5BD6', bg: '#EEEEFF', label: 'Зээл олгох',         sign: '+' },
  loan_payment:      { icon: 'cash',              color: '#22C7BE', bg: '#E5FAFA', label: 'Зээл төлөх',         sign: '-' },
  extension_fee:     { icon: 'time',              color: '#7C3AED', bg: '#EDE9FE', label: 'Сунгалтын төлбөр',   sign: '-' },
  credit_check_fee:  { icon: 'card',              color: '#F59E0B', bg: '#FEF9C3', label: 'Зээлийн эрх шалгах', sign: '-' },
};
const TX_STATUS = {
  completed: { label: 'Амжилттай',      color: '#27AE60' },
  paid:      { label: 'Амжилттай',      color: '#27AE60' },
  pending:   { label: 'Хянагдаж байна', color: '#F59E0B' },
  rejected:  { label: 'Татгалзсан',     color: '#EF4444' },
  expired:   { label: 'Дууссан',        color: '#94A3B8' },
};

const fmt     = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

// ── Item: саарал background дээр цагаан card ──────────────────────────────────
// FlatList-ийн contentContainer нь саарал (#F2F4F9) тул
// item өөрөө backgroundColor: '#fff' + borderRadius өгнө → давхар bg байхгүй
const TxItem = ({ item }) => {
  const t   = TX_TYPE[item.type] || { icon: 'swap-horizontal', color: '#94A3B8', bg: '#F1F5F9', label: item.typeLabel || item.type, sign: '' };
  const s   = TX_STATUS[item.status] || { label: item.statusLabel || item.status, color: '#94A3B8' };
  const bad = item.status === 'rejected' || item.status === 'expired';
  const amtColor = bad ? '#94A3B8' : (t.sign === '+' ? '#27AE60' : '#EF4444');

  return (
    <View style={itemS.card}>
      <View style={[itemS.iconWrap, { backgroundColor: t.bg }]}>
        <Ionicons name={t.icon} size={22} color={t.color} />
      </View>
      <View style={itemS.mid}>
        <Text style={itemS.label}>{item.typeLabel || t.label}</Text>
        {item.description ? <Text style={itemS.desc} numberOfLines={1}>{item.description}</Text> : null}
        <Text style={itemS.date}>{fmtDate(item.createdAt)}</Text>
      </View>
      <View style={itemS.right}>
        <Text style={[itemS.amt, { color: amtColor }, bad && itemS.strike]}>
          {t.sign}{fmt(item.amount)}₮
        </Text>
        <View style={[itemS.badge, { backgroundColor: s.color + '18' }]}>
          <Text style={[itemS.badgeTxt, { color: s.color }]}>{item.statusLabel || s.label}</Text>
        </View>
      </View>
    </View>
  );
};

const itemS = StyleSheet.create({
  // Саарал page дээр цагаан card - давхар background гарахгүй
  card:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mid:      { flex: 1 },
  label:    { fontSize: 14, fontWeight: '600', color: '#0F0F1A', marginBottom: 2 },
  desc:     { fontSize: 12, color: '#64748B', marginBottom: 2 },
  date:     { fontSize: 11, color: '#94A3B8' },
  right:    { alignItems: 'flex-end', gap: 4 },
  amt:      { fontSize: 15, fontWeight: '700' },
  strike:   { textDecorationLine: 'line-through' },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
});

// ── Filters ───────────────────────────────────────────────────────────────────
const FILTERS = [
  { label: 'Бүгд',      value: '' },
  { label: 'Цэнэглэлт', value: 'deposit' },
  { label: 'Зарлага',   value: 'withdrawal' },
  { label: 'Зээл',      value: 'loan_payment' },
];

// ── Main screen ───────────────────────────────────────────────────────────────
const TransactionHistoryScreen = ({ navigation }) => {
  const { transactions, setTransactions } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    try {
      const res = await getTransactions(1, filter);
      if (res.success) setTransactions(res.data.transactions);
    } catch (e) { console.log('load tx error:', e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [filter]);

  if (loading) return <Loading />;

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={[S.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F0F1A" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Гүйлгээний түүх</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter chips */}
      <View style={S.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[S.chip, filter === f.value && S.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[S.chipTxt, filter === f.value && S.chipTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List - саарал (#F2F4F9) background дээр цагаан item card-ууд */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TxItem item={item} />}
        contentContainerStyle={S.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={S.empty}>
            <Ionicons name="receipt-outline" size={56} color="#CBD5E1" />
            <Text style={S.emptyTxt}>Гүйлгээ байхгүй байна</Text>
          </View>
        }
      />
    </View>
  );
};

const S = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#F2F4F9' },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: '#0F0F1A' },

  filterRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip:         { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#E8EBF4' },
  chipActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt:      { fontSize: 12, fontWeight: '600', color: '#64748B' },
  chipTxtActive:{ color: '#fff' },

  // Саарал background дээр item-үүд → цагаан card (давхар bg байхгүй)
  list:    { paddingHorizontal: 16, paddingBottom: 100 },
  empty:   { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTxt:{ fontSize: 15, color: '#94A3B8' },
});

export default TransactionHistoryScreen;