/**
 * MyLoansScreen.js
 * ✅ ANDROID: useSafeAreaInsets - status bar overlap байхгүй
 * ✅ LoanCard → inline LoanRow: саарал background дээр цагаан card, давхар bg байхгүй
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyLoans } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';

// ── Зээлийн статус тохиргоо ───────────────────────────────────────────────────
const LOAN_STATUS = {
  pending:   { label: 'Хүлээгдэж байна', color: '#F59E0B', bg: '#FEF9C3', icon: 'time-outline' },
  approved:  { label: 'Батлагдсан',      color: '#5B5BD6', bg: '#EEEEFF', icon: 'checkmark-circle-outline' },
  active:    { label: 'Идэвхтэй',        color: '#27AE60', bg: '#E8F8EE', icon: 'flash-outline' },
  extended:  { label: 'Сунгасан',        color: '#22C7BE', bg: '#E5FAFA', icon: 'refresh-outline' },
  overdue:   { label: 'Хугацаа хэтэрсэн', color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle-outline' },
  completed: { label: 'Дууссан',         color: '#64748B', bg: '#F1F5F9', icon: 'checkmark-done-outline' },
  rejected:  { label: 'Татгалзсан',      color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
};

const fmt = (v) => (v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

// ── Inline Loan Card ── саарал page дээр цагаан card ─────────────────────────
const LoanRow = ({ loan, onPress }) => {
  const s = LOAN_STATUS[loan.status] || { label: loan.status, color: '#94A3B8', bg: '#F1F5F9', icon: 'help-circle-outline' };
  const isActive = ['pending', 'approved', 'active', 'extended', 'overdue'].includes(loan.status);
  const progressPct = loan.principal > 0
    ? Math.min(100, Math.round(((loan.principal - (loan.remainingAmount || 0)) / loan.principal) * 100))
    : 0;

  return (
    <TouchableOpacity style={lS.card} onPress={onPress} activeOpacity={0.75}>
      {/* Top row */}
      <View style={lS.topRow}>
        <View style={[lS.iconWrap, { backgroundColor: s.bg }]}>
          <Ionicons name={s.icon} size={20} color={s.color} />
        </View>
        <View style={lS.topMid}>
          <Text style={lS.loanNum}>{loan.loanNumber}</Text>
          <Text style={lS.loanDate}>Огноо: {fmtDate(loan.createdAt)}</Text>
        </View>
        <View style={[lS.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[lS.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>

      {/* Amount row */}
      <View style={lS.amtRow}>
        <View style={lS.amtItem}>
          <Text style={lS.amtLabel}>Зээлийн дүн</Text>
          <Text style={lS.amtVal}>{fmt(loan.principal)}₮</Text>
        </View>
        {isActive && (
          <>
            <View style={lS.amtDivider} />
            <View style={lS.amtItem}>
              <Text style={lS.amtLabel}>Үлдэгдэл</Text>
              <Text style={[lS.amtVal, { color: '#EF4444' }]}>{fmt(loan.remainingAmount)}₮</Text>
            </View>
            <View style={lS.amtDivider} />
            <View style={lS.amtItem}>
              <Text style={lS.amtLabel}>Дуусах огноо</Text>
              <Text style={[lS.amtVal, { fontSize: 13 }]}>{fmtDate(loan.dueDate)}</Text>
            </View>
          </>
        )}
        {!isActive && (
          <>
            <View style={lS.amtDivider} />
            <View style={lS.amtItem}>
              <Text style={lS.amtLabel}>Хүү</Text>
              <Text style={lS.amtVal}>{loan.interestRate || 10}%</Text>
            </View>
          </>
        )}
      </View>

      {/* Progress bar - зөвхөн идэвхтэй зээлд */}
      {isActive && loan.principal > 0 && (
        <View style={lS.progressWrap}>
          <View style={lS.progressBg}>
            <View style={[lS.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={lS.progressTxt}>{progressPct}% төлөгдсөн</Text>
        </View>
      )}

      <View style={lS.arrowRow}>
        <Text style={lS.detailTxt}>Дэлгэрэнгүй харах</Text>
        <Ionicons name="chevron-forward" size={14} color="#5B5BD6" />
      </View>
    </TouchableOpacity>
  );
};

const lS = StyleSheet.create({
  card:        { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  topRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap:    { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  topMid:      { flex: 1 },
  loanNum:     { fontSize: 14, fontWeight: '700', color: '#0F0F1A', marginBottom: 2 },
  loanDate:    { fontSize: 11, color: '#94A3B8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText:  { fontSize: 11, fontWeight: '700' },

  amtRow:     { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12 },
  amtItem:    { flex: 1, alignItems: 'center' },
  amtLabel:   { fontSize: 10, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  amtVal:     { fontSize: 14, fontWeight: '700', color: '#0F0F1A' },
  amtDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 4 },

  progressWrap: { marginBottom: 10 },
  progressBg:   { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#5B5BD6', borderRadius: 3 },
  progressTxt:  { fontSize: 10, color: '#94A3B8', textAlign: 'right' },

  arrowRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  detailTxt: { fontSize: 12, color: '#5B5BD6', fontWeight: '600' },
});

// ── Filter chips ──────────────────────────────────────────────────────────────
const FILTERS = [
  { label: 'Бүгд',      value: 'all',       icon: 'apps' },
  { label: 'Идэвхтэй',  value: 'active',    icon: 'flash' },
  { label: 'Дууссан',   value: 'completed', icon: 'checkmark-circle' },
];

// ── Main screen ───────────────────────────────────────────────────────────────
const MyLoansScreen = ({ navigation }) => {
  const { loans, setLoans } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('all');

  useEffect(() => { loadLoans(); }, []);

  const loadLoans = async () => {
    try {
      const res = await getMyLoans();
      if (res.success) setLoans(res.data.loans);
    } catch (e) { console.log('Load loans error:', e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await loadLoans(); setRefreshing(false);
  }, []);

  const filtered = loans.filter(l => {
    if (filter === 'all')       return true;
    if (filter === 'active')    return ['pending', 'approved', 'active', 'extended', 'overdue'].includes(l.status);
    if (filter === 'completed') return l.status === 'completed';
    return true;
  });

  if (loading) return <Loading />;

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={[S.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={S.pageTitle}>Миний зээлүүд</Text>
          <Text style={S.pageSub}>Нийт {filtered.length} зээл</Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={S.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[S.chip, filter === f.value && S.chipActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.75}
          >
            {filter === f.value ? (
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={S.chipInner}
              >
                <Ionicons name={f.icon} size={14} color="#fff" />
                <Text style={[S.chipTxt, S.chipTxtActive]}>{f.label}</Text>
              </LinearGradient>
            ) : (
              <View style={[S.chipInner, S.chipInnerInactive]}>
                <Ionicons name={f.icon} size={14} color="#94A3B8" />
                <Text style={S.chipTxt}>{f.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* List - саарал (#F2F4F9) background дээр цагаан card item-үүд */}
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <LoanRow
            loan={item}
            onPress={() => navigation.navigate('LoanDetails', { loanId: item._id })}
          />
        )}
        contentContainerStyle={S.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={S.empty}>
            <LinearGradient colors={['#EEEEFF', '#E5FAFA']} style={S.emptyIcon}>
              <Ionicons name="wallet-outline" size={48} color="#5B5BD6" />
            </LinearGradient>
            <Text style={S.emptyTitle}>Зээл байхгүй байна</Text>
            <Text style={S.emptySubtitle}>Та зээл авсны дараа энд харагдана</Text>
          </View>
        }
      />
    </View>
  );
};

const S = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#F2F4F9' },
  header:   { paddingHorizontal: 18, paddingBottom: 8 },
  pageTitle:{ fontSize: 26, fontWeight: '800', color: '#0F0F1A', letterSpacing: -0.5, marginBottom: 2 },
  pageSub:  { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  filterRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 12 },
  chip:             { flex: 1, borderRadius: 12, overflow: 'hidden' },
  chipActive:       {},
  chipInner:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 5 },
  chipInnerInactive:{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8EBF4', borderRadius: 12 },
  chipTxt:          { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  chipTxtActive:    { color: '#fff' },

  list:         { paddingHorizontal: 18, paddingBottom: 100 },
  empty:        { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIcon:    { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#0F0F1A' },
  emptySubtitle:{ fontSize: 13, color: '#94A3B8' },
});

export default MyLoansScreen;