/**
 * WalletScreen.js - ЗАСВАР
 * БАЙРШИЛ: src/screens/wallet/WalletScreen.js
 *
 * ✅ getWallet()-аас recentTransactions авах
 * ✅ pending/rejected withdrawal харуулах
 * ✅ TransactionItem компонент ашиглах
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { getWallet } from '../../services/walletService';
import TransactionItem from '../../components/wallet/TransactionItem';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

export default function WalletScreen({ navigation }) {
  const { wallet, setWallet } = useApp();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const w = await getWallet();
      if (w?.success) {
        setWallet(w.data.wallet);
        // ✅ Backend getWalletController нь recentTransactions буцаана
        setRecentTransactions(w.data.recentTransactions || []);
      }
    } catch (e) {
      console.log('WalletScreen load error:', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

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

          {/* Frozen balance байвал харуулах */}
          {wallet?.frozenBalance > 0 && (
            <Text style={styles.frozenText}>
              Хүлээгдэж буй: {formatMoney(wallet.frozenBalance)}₮
            </Text>
          )}

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

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <View style={styles.actionBtnCircle}>
                <Ionicons name="receipt-outline" size={22} color="#5B5BD6" />
              </View>
              <Text style={styles.actionBtnLabel}>Түүх</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── MINI STATS ──────────────────────── */}
        <View style={styles.miniStats}>
          {[
            { icon: 'arrow-down-circle-outline', color: '#27AE60', bg: '#E8F8EE', label: 'Нийт орлого', val: `${formatMoney(wallet?.totalDeposited || 0)}₮` },
            { icon: 'arrow-up-circle-outline', color: '#EF4444', bg: '#FEE2E2', label: 'Нийт зарлага', val: `${formatMoney(wallet?.totalWithdrawn || 0)}₮` },
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

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem key={tx._id} transaction={tx} />
            ))
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
  balanceCard:    { borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 10 },
  deco1:          { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  deco2:          { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -40, left: -20 },
  balanceTop:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  balanceCaption: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  balanceAmt:     { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: -1 },
  frozenText:     { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16, marginTop: 10 },
  balanceActions: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn:      { alignItems: 'center', gap: 6 },
  actionBtnCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  actionBtnLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  miniStats:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  miniStatItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  miniStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniStatLabel:{ fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  miniStatVal:  { fontSize: 15, fontWeight: '800' },
  card:       { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardTitle:  { fontSize: 17, fontWeight: '700', color: '#0F0F1A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll:     { fontSize: 13, color: '#5B5BD6', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText:  { fontSize: 14, color: '#94A3B8' },
});