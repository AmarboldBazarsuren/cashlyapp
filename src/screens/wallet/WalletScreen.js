/**
 * WalletScreen.js
 * ✅ ANDROID: useSafeAreaInsets - status bar overlap арилсан
 * ✅ Сүүлийн гүйлгээ: цагаан card дотор шугамаар хуваасан row (давхар bg байхгүй)
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { getWallet } from '../../services/walletService';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

// ─── Transaction type / status config ────────────────────────────────────────
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

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

// ─── Card-ийн дотор ямар нэмэлт background-гүй row ──────────────────────────
// Цагаан card дотор байгаа тул өөрт нь background өгөхгүй, 
// зөвхөн хоорондоо нимгэн шугамаар хуваана
const TxRow = ({ tx, isLast }) => {
  const t   = TX_TYPE[tx.type] || { icon: 'swap-horizontal', color: '#94A3B8', bg: '#F1F5F9', label: tx.typeLabel || tx.type, sign: '' };
  const s   = TX_STATUS[tx.status] || { label: tx.statusLabel || tx.status, color: '#94A3B8' };
  const bad = tx.status === 'rejected' || tx.status === 'expired';
  const amtColor = bad ? '#94A3B8' : (t.sign === '+' ? '#27AE60' : '#EF4444');
  const fmt = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <View style={[txS.row, !isLast && txS.border]}>
      <View style={[txS.iconWrap, { backgroundColor: t.bg }]}>
        <Ionicons name={t.icon} size={22} color={t.color} />
      </View>
      <View style={txS.mid}>
        <Text style={txS.label}>{tx.typeLabel || t.label}</Text>
        {tx.description ? <Text style={txS.desc} numberOfLines={1}>{tx.description}</Text> : null}
        <Text style={txS.date}>{fmtDate(tx.createdAt)}</Text>
      </View>
      <View style={txS.right}>
        <Text style={[txS.amt, { color: amtColor }, bad && txS.strike]}>
          {t.sign}{fmt(tx.amount)}₮
        </Text>
        <View style={[txS.badge, { backgroundColor: s.color + '18' }]}>
          <Text style={[txS.badgeText, { color: s.color }]}>{tx.statusLabel || s.label}</Text>
        </View>
      </View>
    </View>
  );
};

const txS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  border:   {}, // unused - kept for compat
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mid:      { flex: 1 },
  label:    { fontSize: 14, fontWeight: '600', color: '#0F0F1A', marginBottom: 2 },
  desc:     { fontSize: 12, color: '#64748B', marginBottom: 2 },
  date:     { fontSize: 11, color: '#94A3B8' },
  right:    { alignItems: 'flex-end', gap: 4 },
  amt:      { fontSize: 15, fontWeight: '700' },
  strike:   { textDecorationLine: 'line-through' },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:{ fontSize: 10, fontWeight: '600' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function WalletScreen({ navigation }) {
  const { wallet, setWallet } = useApp();
  const insets = useSafeAreaInsets();
  const [recent, setRecent]         = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [balVis, setBalVis]         = useState(true);
  const [loading, setLoading]       = useState(true);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const res = await getWallet();
      if (res?.success) {
        setWallet(res.data.wallet);
        setRecent(res.data.recentTransactions || []);
      }
    } catch (e) { console.log('WalletScreen load error:', e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, []);

  const fmt = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />
      <View style={[S.titleWrap, { paddingTop: insets.top + 10 }]}>
        <Text style={S.pageTitle}>Хэтэвч</Text>
      </View>
      <ScrollView
        contentContainerStyle={S.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B5BD6" />}
        showsVerticalScrollIndicator={false}
      >

        {/* Balance card */}
        <LinearGradient colors={['#5B5BD6', '#22C7BE']} start={{ x:0,y:0 }} end={{ x:1,y:1 }} style={S.balCard}>
          <View style={S.deco1}/><View style={S.deco2}/>
          <View style={S.balTop}>
            <Text style={S.balCaption}>Нийт үлдэгдэл</Text>
            <TouchableOpacity onPress={() => setBalVis(v => !v)}>
              <Ionicons name={balVis ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <Text style={S.balAmt}>{balVis ? `${fmt(wallet?.balance || 0)}₮` : '••••••₮'}</Text>
          {wallet?.frozenBalance > 0 && (
            <Text style={S.frozenTxt}>Хүлээгдэж буй: {fmt(wallet.frozenBalance)}₮</Text>
          )}
          <View style={S.balDiv}/>
          <View style={S.actRow}>
            {[
              { icon: 'add',            label: 'Цэнэглэх', onPress: () => navigation.navigate('Deposit') },
              { icon: 'arrow-up-outline',label: 'Татах',   onPress: () => navigation.navigate('Withdraw') },
              { icon: 'receipt-outline', label: 'Түүх',    onPress: () => navigation.navigate('Profile', { screen: 'TransactionHistory' }) },
            ].map(a => (
              <TouchableOpacity key={a.label} style={S.actBtn} onPress={a.onPress}>
                <View style={S.actCircle}><Ionicons name={a.icon} size={22} color="#5B5BD6" /></View>
                <Text style={S.actLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Mini stats */}
        <View style={S.miniRow}>
          {[
            { icon: 'arrow-down-circle-outline', color: '#27AE60', bg: '#E8F8EE', label: 'Нийт орлого',  val: `${fmt(wallet?.totalDeposited || 0)}₮` },
            { icon: 'arrow-up-circle-outline',   color: '#EF4444', bg: '#FEE2E2', label: 'Нийт зарлага', val: `${fmt(wallet?.totalWithdrawn || 0)}₮` },
          ].map(s => (
            <View key={s.label} style={S.miniItem}>
              <View style={[S.miniIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={S.miniLabel}>{s.label}</Text>
              <Text style={[S.miniVal, { color: s.color }]}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* Recent transactions - item бүр тусдаа цагаан card, саарал bg дээр */}
        <View style={S.txSection}>
          <View style={S.txHeader}>
            <Text style={S.cardTitle}>Сүүлийн гүйлгээ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'TransactionHistory' })}>
              <Text style={S.seeAll}>Бүгд</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="receipt-outline" size={36} color="#CBD5E1" />
              <Text style={S.emptyTxt}>{loading ? 'Ачааллаж байна...' : 'Гүйлгээ байхгүй байна'}</Text>
            </View>
          ) : (
            recent.map((tx, i) => (
              <TxRow key={tx._id} tx={tx} isLast={i === recent.length - 1} />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#F2F4F9' },
  titleWrap: { paddingHorizontal: 18, backgroundColor: '#F2F4F9' },
  scroll:    { paddingHorizontal: 18, paddingTop: 10 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F0F1A', letterSpacing: -0.5, marginBottom: 10 },

  balCard:   { borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 10 },
  deco1:     { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  deco2:     { position: 'absolute', width: 100, height: 100, borderRadius: 50,  backgroundColor: 'rgba(255,255,255,0.07)', bottom: -40, left: -20 },
  balTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  balCaption:{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  balAmt:    { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: -1 },
  frozenTxt: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  balDiv:    { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16, marginTop: 10 },
  actRow:    { flexDirection: 'row', justifyContent: 'space-around' },
  actBtn:    { alignItems: 'center', gap: 6 },
  actCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  actLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  miniRow:   { flexDirection: 'row', gap: 12, marginBottom: 16 },
  miniItem:  { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  miniIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  miniVal:   { fontSize: 15, fontWeight: '800' },

  card:       { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle:  { fontSize: 17, fontWeight: '700', color: '#0F0F1A' },
  seeAll:     { fontSize: 13, color: '#5B5BD6', fontWeight: '600' },
  empty:      { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyTxt:   { fontSize: 14, color: '#94A3B8' },

  // Transactions section - item бүр тусдаа card
  txSection:  { marginBottom: 16 },
  txHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
});