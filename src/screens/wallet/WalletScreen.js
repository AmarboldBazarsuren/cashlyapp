/**
 * WalletScreen.js
 * src/screens/wallet/WalletScreen.js
 *
 * ✅ @expo/vector-icons (Ionicons) — emoji байхгүй
 * ✅ Light theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { getWallet, getTransactions } from '../../services/walletService';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const TX_ICON = {
  deposit:    { icon: 'arrow-down-circle-outline', color: '#27AE60', bg: '#E8F8EE' },
  withdrawal: { icon: 'arrow-up-circle-outline',   color: '#EF4444', bg: '#FEE2E2' },
  loan:       { icon: 'cash-outline',              color: '#5B5BD6', bg: '#EEEEFF' },
  repayment:  { icon: 'checkmark-circle-outline',  color: '#22C7BE', bg: '#E5FAFA' },
  default:    { icon: 'swap-horizontal-outline',   color: '#64748B', bg: '#F1F5F9' },
};

export default function WalletScreen({ navigation }) {
  const { wallet, setWallet } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [w, t] = await Promise.all([getWallet(), getTransactions({ limit: 20 })]);
      if (w?.success) setWallet(w.data.wallet);
      if (t?.success) setTransactions(t.data.transactions || []);
    } catch (e) { console.log(e); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const txStyle = (type) => TX_ICON[type] || TX_ICON.default;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B5BD6" />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Хэтэвч</Text>

        {/* ── BALANCE CARD ────────────────────── */}
        <LinearGradient
          colors={['#5B5BD6', '#22C7BE']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.deco1} />
          <View style={styles.deco2} />

          <View style={styles.balanceTop}>
            <Text style={styles.balanceCaption}>Нийт үлдэгдэл</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(v => !v)}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18} color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmt}>
            {balanceVisible ? `${formatMoney(wallet?.balance || 0)}₮` : '••••••₮'}
          </Text>

          <View style={styles.balanceMeta}>
            <Text style={styles.balanceMetaText}>
              Дансны дугаар: {wallet?.accountNumber || '—'}
            </Text>
          </View>

          <View style={styles.balanceDivider} />

          {/* Actions */}
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Deposit')}
            >
              <View style={styles.actionBtnCircle}>
                <Ionicons name="add" size={22} color="#5B5BD6" />
              </View>
              <Text style={styles.actionBtnLabel}>Цэнэглэх</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Withdraw')}
            >
              <View style={styles.actionBtnCircle}>
                <Ionicons name="arrow-up-outline" size={22} color="#5B5BD6" />
              </View>
              <Text style={styles.actionBtnLabel}>Татах</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionBtnCircle}>
                <Ionicons name="qr-code-outline" size={22} color="#5B5BD6" />
              </View>
              <Text style={styles.actionBtnLabel}>QR</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── MINI STATS ──────────────────────── */}
        <View style={styles.miniStats}>
          {[
            { icon: 'arrow-down-circle-outline', color: '#27AE60', bg: '#E8F8EE', label: 'Нийт орлого', val: `${formatMoney(wallet?.totalDeposit || 0)}₮` },
            { icon: 'arrow-up-circle-outline',   color: '#EF4444', bg: '#FEE2E2', label: 'Нийт зарлага', val: `${formatMoney(wallet?.totalWithdrawal || 0)}₮` },
          ].map((s) => (
            <View key={s.label} style={styles.miniStatItem}>
              <View style={[styles.miniStatIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.miniStatLabel}>{s.label}</Text>
              <Text style={[styles.miniStatVal, { color: s.color }]}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* ── TRANSACTIONS ────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Сүүлийн гүйлгээ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.seeAll}>Бүгд</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
            </View>
          ) : (
            transactions.slice(0, 8).map((tx, i, arr) => {
              const s = txStyle(tx.type);
              const isPlus = tx.type === 'deposit' || tx.type === 'loan';
              return (
                <React.Fragment key={tx._id}>
                  <View style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: s.bg }]}>
                      <Ionicons name={s.icon} size={18} color={s.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txLabel}>{tx.description || 'Гүйлгээ'}</Text>
                      <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('mn-MN')}</Text>
                    </View>
                    <Text style={[styles.txAmt, { color: isPlus ? '#27AE60' : '#EF4444' }]}>
                      {isPlus ? '+' : '-'}{formatMoney(tx.amount)}₮
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.txDivider} />}
                </React.Fragment>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F2F4F9' },
  scroll:     { paddingHorizontal: 18, paddingTop: 10 },
  pageTitle:  { fontSize: 26, fontWeight: '800', color: '#0F0F1A', letterSpacing: -0.5, marginBottom: 18 },

  // Balance card
  balanceCard:    { borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 10 },
  deco1:          { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  deco2:          { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -40, left: -20 },
  balanceTop:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  balanceCaption: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  balanceAmt:     { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -1 },
  balanceMeta:    { marginBottom: 18 },
  balanceMetaText:{ fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16 },
  balanceActions: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn:      { alignItems: 'center', gap: 6 },
  actionBtnCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  actionBtnLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Mini stats
  miniStats:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  miniStatItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  miniStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniStatLabel:{ fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  miniStatVal:  { fontSize: 15, fontWeight: '800' },

  // Card
  card:       { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardTitle:  { fontSize: 17, fontWeight: '700', color: '#0F0F1A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll:     { fontSize: 13, color: '#5B5BD6', fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText:  { fontSize: 14, color: '#94A3B8' },

  // Transactions
  txRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  txIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txLabel:   { fontSize: 14, fontWeight: '600', color: '#0F0F1A', marginBottom: 2 },
  txDate:    { fontSize: 11, color: '#94A3B8' },
  txAmt:     { fontSize: 15, fontWeight: '800' },
  txDivider: { height: 1, backgroundColor: '#F1F5F9' },
});