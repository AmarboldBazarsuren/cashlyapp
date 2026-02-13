/**
 * ProfileScreen.js
 * src/screens/profile/ProfileScreen.js
 *
 * ✅ @expo/vector-icons (Ionicons) — emoji байхгүй
 * ✅ Light theme — KYC дизайнтай уялдуулсан
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

// ─── Config ──────────────────────────────────────────────────
const MENU_SECTIONS = [
  {
    title: 'Миний мэдээлэл',
    items: [
      { icon: 'person-outline',      color: '#5B5BD6', bg: '#EEEEFF', label: 'Хувийн мэдээлэл',    screen: 'PersonalInfo' },
      { icon: 'shield-checkmark-outline', color: '#10B981', bg: '#D1FAE5', label: 'KYC Баталгаажуулалт', screen: 'KYCInfo' },
      { icon: 'card-outline',        color: '#22C7BE', bg: '#E5FAFA', label: 'Банкны мэдээлэл',    screen: 'BankInfo' },
    ],
  },
  {
    title: 'Гүйлгээ & Зээл',
    items: [
      { icon: 'receipt-outline',     color: '#F97316', bg: '#FFEDD5', label: 'Гүйлгээний түүх', screen: 'TransactionHistory' },
      { icon: 'cash-outline',        color: '#5B5BD6', bg: '#EEEEFF', label: 'Зээлийн түүх',   screen: 'LoanHistory' },
      { icon: 'document-text-outline', color: '#EAB308', bg: '#FEF9C3', label: 'Гэрээнүүд',     screen: 'Contracts' },
    ],
  },
  {
    title: 'Тохиргоо',
    items: [
      { icon: 'notifications-outline', color: '#3B82F6', bg: '#DBEAFE', label: 'Мэдэгдэл',        screen: 'Notifications' },
      { icon: 'lock-closed-outline',   color: '#7C3AED', bg: '#EDE9FE', label: 'Нууц үг',         screen: 'ChangePassword' },
      { icon: 'help-circle-outline',   color: '#22C7BE', bg: '#E5FAFA', label: 'Тусламж & Дэмжлэг', screen: 'Support' },
    ],
  },
];

const KYC_STATUS = {
  approved:  { label: 'Баталгаажсан',    color: '#27AE60', bg: '#E8F8EE', icon: 'checkmark-circle' },
  pending:   { label: 'Хянагдаж байна', color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  rejected:  { label: 'Татгалзсан',     color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
  not_submitted: { label: 'Баталгаажаагүй', color: '#94A3B8', bg: '#F1F5F9', icon: 'alert-circle-outline' },
};

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const kyc = KYC_STATUS[user?.kycStatus] || KYC_STATUS.not_submitted;

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.log(e); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── PAGE TITLE ──────────────────────── */}
        <Text style={styles.pageTitle}>Профайл</Text>

        {/* ── PROFILE CARD ────────────────────── */}
        <LinearGradient
          colors={['#5B5BD6', '#22C7BE']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.avatarWrap}>
            <LinearGradient colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']} style={styles.avatar}>
              <Ionicons name="person" size={36} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.profileName}>{user?.name || 'Хэрэглэгч'}</Text>
          <Text style={styles.profilePhone}>{user?.phoneNumber || '—'}</Text>

          {/* KYC status badge */}
          <TouchableOpacity
            style={[styles.kycBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
            onPress={() => navigation.navigate('KYCInfo')}
          >
            <Ionicons name={kyc.icon} size={13} color="#fff" />
            <Text style={styles.kycBadgeText}>{kyc.label}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── QUICK STATS ─────────────────────── */}
        <View style={styles.statsCard}>
          {[
            { icon: 'wallet-outline',  color: '#5B5BD6', bg: '#EEEEFF', label: 'Зээлийн эрх',  val: `${(user?.creditLimit || 0).toLocaleString()}₮` },
            { icon: 'trending-up-outline', color: '#22C7BE', bg: '#E5FAFA', label: 'Credit score', val: user?.creditScore || '—' },
            { icon: 'star-outline',    color: '#EAB308', bg: '#FEF9C3', label: 'Нийт зээл',    val: user?.totalLoans || 0 },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <View style={[styles.statItemIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={16} color={s.color} />
                </View>
                <Text style={styles.statItemVal}>{s.val}</Text>
                <Text style={styles.statItemLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── MENU SECTIONS ───────────────────── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i, arr) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => navigation.navigate(item.screen)}
                    activeOpacity={0.72}
                  >
                    <View style={[styles.menuRowIcon, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={19} color={item.color} />
                    </View>
                    <Text style={styles.menuRowLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                  {i < arr.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* ── LOGOUT ──────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Гарах</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F2F4F9' },
  scroll:     { paddingHorizontal: 18, paddingTop: 10 },
  pageTitle:  { fontSize: 26, fontWeight: '800', color: '#0F0F1A', letterSpacing: -0.5, marginBottom: 18 },

  // Profile card
  profileCard: { borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 22, elevation: 9 },
  decoCircle1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)', top: -40, right: -30 },
  decoCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -30, left: -20 },
  avatarWrap:  { marginBottom: 12 },
  avatar:      { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.2 },
  profilePhone:{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  kycBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  kycBadgeText:{ fontSize: 12, color: '#fff', fontWeight: '600' },

  // Stats card
  statsCard:   { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2 },
  statItem:    { flex: 1, alignItems: 'center', gap: 6 },
  statItemIcon:{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statItemVal: { fontSize: 15, fontWeight: '800', color: '#0F0F1A' },
  statItemLabel:{ fontSize: 10, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },
  statSep:     { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 4 },

  // Menu
  menuSection:     { marginBottom: 16 },
  menuSectionTitle:{ fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
  menuCard:        { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  menuRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuRowIcon:     { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuRowLabel:    { flex: 1, fontSize: 15, fontWeight: '500', color: '#0F0F1A' },
  menuDivider:     { height: 1, backgroundColor: '#F1F5F9', marginLeft: 68 },

  // Logout
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 16, paddingVertical: 16, marginBottom: 10 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});