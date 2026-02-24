/**
 * HomeScreen.js - COMPLETE WITH CREDIT LIMIT SECTION
 * ✅ Зээлийн эрх хэсэг нэмсэн (design + lock логик)
 * ✅ Available credit limit харуулах
 * ✅ KYC + Credit check flow бүрэн
 * ✅ FIXED: usedCreditLimit ашиглаж зөв тооцоолох
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProfile } from '../../services/userService';
import { getWallet } from '../../services/walletService';
import { getActiveLoans } from '../../services/loanService';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const LOAN_TYPES = [
  {
    id: 'digital', label: 'Дижитал зээл', sub: 'Хурдан, хялбар',
    icon: 'flash', bg: '#EEEEFF', color: '#5B5BD6', available: true,
  },
  {
    id: 'car', label: 'Автомашин', sub: 'Тун удахгүй',
    icon: 'car-sport-outline', bg: '#E5FAFA', color: '#22C7BE', available: false,
  },
  {
    id: 'realty', label: 'Үл хөдлөх', sub: 'Тун удахгүй',
    icon: 'home-outline', bg: '#D1FAE5', color: '#10B981', available: false,
  },
  {
    id: 'biz', label: 'Бизнес', sub: 'Тун удахгүй',
    icon: 'briefcase-outline', bg: '#FEF9C3', color: '#EAB308', available: false,
  },
];

const StatPill = ({ icon, iconColor, bg, label, value }) => (
  <View style={styles.statPill}>
    <View style={[styles.statPillIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={iconColor} />
    </View>
    <View>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={styles.statPillValue}>{value}</Text>
    </View>
  </View>
);

const LoanRow = ({ item, onPress, isLocked }) => (
  <TouchableOpacity 
    style={[styles.loanRow, isLocked && styles.loanRowLocked]} 
    onPress={() => onPress(item)} 
    activeOpacity={0.75}
    disabled={isLocked && !item.available}
  >
    <View style={[styles.loanRowIcon, { backgroundColor: item.bg }]}>
      <Ionicons name={item.icon} size={22} color={item.color} />
      {isLocked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={12} color="#fff" />
        </View>
      )}
    </View>
    <View style={styles.loanRowMid}>
      <Text style={styles.loanRowLabel}>{item.label}</Text>
      <Text style={styles.loanRowSub}>{item.sub}</Text>
    </View>
    {!isLocked && item.available && (
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    )}
    {!isLocked && !item.available && (
      <View style={[styles.comingTag, { backgroundColor: item.bg }]}>
        <Text style={[styles.comingTagText, { color: item.color }]}>Удахгүй</Text>
      </View>
    )}
    {isLocked && (
      <View style={styles.lockedTag}>
        <Ionicons name="lock-closed" size={14} color="#666" />
        <Text style={styles.lockedTagText}>Түгжээтэй</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { wallet, setWallet, activeLoans, setActiveLoans } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [p, w, l] = await Promise.all([getProfile(), getWallet(), getActiveLoans()]);
      if (p?.success) updateUser(p.data.user);
      if (w?.success) setWallet(w.data.wallet);
      if (l?.success) setActiveLoans(l.data.loans);
    } catch (e) { console.log('load error', e); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const handleLoan = (item) => {
    if (!item.available) {
      Toast.show({ type: 'info', text1: item.label, text2: 'Тун удахгүй нэмэгдэнэ!' });
      return;
    }
    
    // Step 1: Check KYC
    if (user?.kycStatus !== 'approved') {
      Toast.show({ type: 'info', text1: 'Эхлээд мэдээлэл баталгаажуулна уу' });
      navigation.navigate('KYCInfo');
      return;
    }
    
    // Step 2: Check credit check payment
    if (!user?.creditCheckPaid) {
      navigation.navigate('CreditCheck');
      return;
    }
    
    // Step 3: Check if credit limit is set
    if (user?.creditLimit === 0 || !user?.creditLimit) {
      Toast.show({ 
        type: 'info', 
        text1: 'Зээлийн эрх шалгагдаж байна', 
        text2: '24-48 цагийн дотор таны зээлийн эрх тогтоогдоно',
        visibilityTime: 4000,
      });
      return;
    }
    
    // Step 4: Ready to apply
    navigation.navigate('ApplyLoan');
  };

  // ✅ FIXED: usedCreditLimit ашиглаж зөв тооцоолох
  const totalCreditLimit = user?.creditLimit || 0;
  const usedCreditLimit = user?.usedCreditLimit || 0;
  const availableCreditLimit = Math.max(0, totalCreditLimit - usedCreditLimit);

  // Determine if loans are locked
  const isLoansLocked = user?.kycStatus !== 'approved' || !user?.creditCheckPaid || totalCreditLimit === 0;

  // ✅ 14 хоногийн cooldown шалгах
  const canPayCreditCheck = () => {
    if (!user?.creditCheckAttemptAt) return true;
    const daysSinceAttempt = Math.floor(
      (Date.now() - new Date(user.creditCheckAttemptAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceAttempt >= 14;
  };

  const daysUntilNextAttempt = () => {
    if (!user?.creditCheckAttemptAt) return 0;
    const daysSince = Math.floor(
      (Date.now() - new Date(user.creditCheckAttemptAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, 14 - daysSince);
  };

  // ✅ DEBUG: Console-д хэвлэж харах (тест хийхдээ)
  useEffect(() => {
    console.log('=== HOME SCREEN CREDIT INFO ===');
    console.log('Total Credit Limit:', totalCreditLimit);
    console.log('Used Credit Limit:', usedCreditLimit);
    console.log('Available Credit Limit:', availableCreditLimit);
    console.log('===============================');
  }, [totalCreditLimit, usedCreditLimit, availableCreditLimit]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetText}>Сайн байна уу,</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.nameText}>{user?.name || 'Хэрэглэгч'}</Text>
              <Ionicons name="hand-left-outline" size={22} color="#EAB308" />
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color="#0F0F1A" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* WALLET CARD */}
        <LinearGradient
          colors={['#5B5BD6', '#22C7BE']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.decoA} />
          <View style={styles.decoB} />

          <View style={styles.walletTopRow}>
            <Text style={styles.walletCaption}>Хэтэвчний үлдэгдэл</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(v => !v)}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18} color="rgba(255,255,255,0.75)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.walletBalance}>
            {balanceVisible ? `${formatMoney(wallet?.balance || 0)}₮` : '••••••₮'}
          </Text>

          <View style={styles.walletDivider} />

          <View style={styles.walletActions}>
            {[
              { icon: 'add-circle-outline', label: 'Цэнэглэх', nav: () => navigation.navigate('Wallet', { screen: 'Deposit' }) },
              { icon: 'arrow-down-circle-outline', label: 'Татах', nav: () => navigation.navigate('Wallet', { screen: 'Withdraw' }) },
              { icon: 'receipt-outline', label: 'Түүх', nav: () => navigation.navigate('Profile', { screen: 'TransactionHistory' }) },
            ].map((a) => (
              <TouchableOpacity key={a.label} style={styles.walletAction} onPress={a.nav}>
                <View style={styles.walletActionCircle}>
                  <Ionicons name={a.icon} size={20} color="#5B5BD6" />
                </View>
                <Text style={styles.walletActionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* ✅ ЗЭЭЛИЙН ЭРХ CARD - ШИНЭ ХЭСЭГ */}
        <LinearGradient
          colors={isLoansLocked ? ['#E2E8F0', '#F1F5F9'] : ['#7C3AED', '#EC4899']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.creditLimitCard}
        >
          <View style={styles.creditDecoA} />
          <View style={styles.creditDecoB} />

          <View style={styles.creditTopRow}>
            <View style={styles.creditIconWrap}>
              {isLoansLocked ? (
                <Ionicons name="lock-closed" size={28} color="#94A3B8" />
              ) : (
                <Ionicons name="shield-checkmark" size={28} color="#fff" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.creditCaption, isLoansLocked && { color: '#64748B' }]}>
                Зээлийн эрх
              </Text>
              {isLoansLocked ? (
                <Text style={styles.creditLockedText}>
                  {user?.kycStatus !== 'approved' 
                    ? 'KYC баталгаажуулна уу'
                    : !user?.creditCheckPaid
                    ? '3000₮ төлж эрх шалгуулна уу'
                    : 'Шалгагдаж байна...'}
                </Text>
              ) : (
                <>
                  <Text style={styles.creditAmount}>
                    {formatMoney(availableCreditLimit)}₮
                  </Text>
                  <Text style={styles.creditSubtext}>
                    Нийт: {formatMoney(totalCreditLimit)}₮
                    {usedCreditLimit > 0 && ` · Ашигласан: ${formatMoney(usedCreditLimit)}₮`}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.creditDivider} />

          <TouchableOpacity
            style={[styles.creditButton, isLoansLocked && styles.creditButtonLocked]}
            onPress={() => handleLoan(LOAN_TYPES[0])}
            activeOpacity={0.8}
          >
            {isLoansLocked && <Ionicons name="lock-closed" size={16} color="#64748B" style={{ marginRight: 6 }} />}
            <Text style={[styles.creditButtonText, isLoansLocked && { color: '#64748B' }]}>
              {isLoansLocked ? 'Түгжээтэй' : 'Зээл авах'}
            </Text>
            {!isLoansLocked && <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />}
          </TouchableOpacity>
        </LinearGradient>

        {/* STATS */}
        {totalCreditLimit > 0 && (
          <View style={styles.statsRow}>
            <StatPill
              icon="trending-up-outline" iconColor="#22C7BE" bg="#E5FAFA"
              label="Credit score" value={user?.creditScore || '—'}
            />
            <View style={styles.statsDivider} />
            <StatPill
              icon="time-outline" iconColor="#F59E0B" bg="#FEF9C3"
              label="Идэвхтэй зээл" value={activeLoans?.length || 0}
            />
          </View>
        )}

        {/* KYC BANNER */}
        {user?.kycStatus !== 'approved' && (
          <TouchableOpacity
            style={styles.kycBanner}
            onPress={() => navigation.navigate('KYCInfo')}
            activeOpacity={0.82}
          >
            <View style={styles.kycBannerLeft}>
              <View style={styles.kycBannerIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#5B5BD6" />
              </View>
              <View>
                <Text style={styles.kycBannerTitle}>Хувийн мэдээлэл баталгаажуулах</Text>
                <Text style={styles.kycBannerSub}>Зээл авахын тулд шаардлагатай</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#5B5BD6" />
          </TouchableOpacity>
        )}

        {/* CREDIT CHECK BANNER */}
        {user?.kycStatus === 'approved' && !user?.creditCheckPaid && (
          <TouchableOpacity
            style={[styles.kycBanner, { backgroundColor: canPayCreditCheck() ? '#FEF9C3' : '#FEE2E2', borderColor: canPayCreditCheck() ? '#EAB308' : '#EF4444' }]}
            onPress={canPayCreditCheck() ? () => navigation.navigate('CreditCheck') : null}
            activeOpacity={canPayCreditCheck() ? 0.82 : 1}
            disabled={!canPayCreditCheck()}
          >
            <View style={styles.kycBannerLeft}>
              <View style={[styles.kycBannerIconWrap, { backgroundColor: '#fff' }]}>
                <Ionicons name={canPayCreditCheck() ? "card-outline" : "time-outline"} size={20} color={canPayCreditCheck() ? "#EAB308" : "#EF4444"} />
              </View>
              <View>
                <Text style={styles.kycBannerTitle}>
                  {canPayCreditCheck() ? 'Зээлийн эрх шалгах' : 'Хүлээнэ үү'}
                </Text>
                <Text style={styles.kycBannerSub}>
                  {canPayCreditCheck() 
                    ? '3000₮ төлж зээлийн эрхээ тогтоох'
                    : `${daysUntilNextAttempt()} хоногийн дараа дахин шалгуулна уу`}
                </Text>
              </View>
            </View>
            {canPayCreditCheck() && <Ionicons name="chevron-forward" size={16} color="#EAB308" />}
          </TouchableOpacity>
        )}

        {/* CREDIT CHECK PROCESSING BANNER */}
        {user?.kycStatus === 'approved' && user?.creditCheckPaid && totalCreditLimit === 0 && (
          <View style={[styles.kycBanner, { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }]}>
            <View style={styles.kycBannerLeft}>
              <View style={[styles.kycBannerIconWrap, { backgroundColor: '#fff' }]}>
                <Ionicons name="time-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.kycBannerTitle}>Зээлийн эрх шалгагдаж байна</Text>
                <Text style={styles.kycBannerSub}>24-48 цагийн дотор тогтоогдоно</Text>
              </View>
            </View>
          </View>
        )}

        {/* LOAN TYPES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Зээлийн төрлүүд</Text>
          {LOAN_TYPES.map((item, i) => (
            <React.Fragment key={item.id}>
              <LoanRow item={item} onPress={handleLoan} isLocked={isLoansLocked} />
              {i < LOAN_TYPES.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ACTIVE LOANS */}
        {activeLoans?.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Идэвхтэй зээлүүд</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
                <Text style={styles.seeAll}>Бүгд харах</Text>
              </TouchableOpacity>
            </View>
            {activeLoans.slice(0, 2).map((loan, i) => (
              <TouchableOpacity
                key={loan._id}
                style={[styles.loanItem, i < Math.min(activeLoans.length, 2) - 1 && styles.loanItemBorder]}
                onPress={() => navigation.navigate('Loans', { screen: 'LoanDetails', params: { loanId: loan._id } })}
                activeOpacity={0.75}
              >
                <View style={styles.loanItemIcon}>
                  <Ionicons name="cash-outline" size={18} color="#5B5BD6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.loanItemNum}>{loan.loanNumber}</Text>
                  <Text style={styles.loanItemAmt}>{formatMoney(loan.principal)}₮</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.loanItemRemain}>{formatMoney(loan.remainingAmount)}₮</Text>
                  <Text style={styles.loanItemRemainLabel}>үлдэгдэл</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F9' },
  scroll: { paddingHorizontal: 18, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  greetText: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  nameText: { fontSize: 24, fontWeight: '800', color: '#0F0F1A', letterSpacing: -0.3 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  notifBadge: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff' },
  
  // Wallet Card
  walletCard: { borderRadius: 24, padding: 22, marginBottom: 16, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 10 },
  decoA: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30 },
  decoB: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -60, left: -40 },
  walletTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  walletCaption: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  walletBalance: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 18, letterSpacing: -1 },
  walletDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16 },
  walletActions: { flexDirection: 'row', justifyContent: 'space-around' },
  walletAction: { alignItems: 'center', gap: 6 },
  walletActionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  walletActionLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  
  // ✅ ЗЭЭЛИЙН ЭРХ CARD - ШИНЭ STYLES
  creditLimitCard: { borderRadius: 24, padding: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.24, shadowRadius: 20, elevation: 8 },
  creditDecoA: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)', top: -20, right: -20 },
  creditDecoB: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -50, left: -30 },
  creditTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  creditIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  creditCaption: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 4 },
  creditAmount: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.8, marginBottom: 2 },
  creditSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  creditLockedText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  creditDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  creditButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  creditButtonLocked: { backgroundColor: '#fff', borderColor: '#E2E8F0' },
  creditButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2 },
  statPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statPillIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statPillLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  statPillValue: { fontSize: 15, fontWeight: '800', color: '#0F0F1A' },
  statsDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
  
  kycBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EEEEFF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#D4D4F8' },
  kycBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  kycBannerIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  kycBannerTitle: { fontSize: 13, fontWeight: '700', color: '#0F0F1A', marginBottom: 1 },
  kycBannerSub: { fontSize: 11, color: '#5B5BD6' },
  
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0F0F1A', marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 13, color: '#5B5BD6', fontWeight: '600' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },
  
  loanRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  loanRowLocked: { opacity: 0.6 },
  loanRowIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, position: 'relative' },
  lockBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#666', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  loanRowMid: { flex: 1 },
  loanRowLabel: { fontSize: 15, fontWeight: '600', color: '#0F0F1A', marginBottom: 2 },
  loanRowSub: { fontSize: 12, color: '#94A3B8' },
  comingTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  comingTagText: { fontSize: 11, fontWeight: '700' },
  lockedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#F1F5F9' },
  lockedTagText: { fontSize: 11, fontWeight: '700', color: '#666' },
  
  loanItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  loanItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  loanItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEEEFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  loanItemNum: { fontSize: 11, color: '#94A3B8', marginBottom: 2 },
  loanItemAmt: { fontSize: 15, fontWeight: '700', color: '#0F0F1A' },
  loanItemRemain: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  loanItemRemainLabel: { fontSize: 11, color: '#94A3B8' },
});