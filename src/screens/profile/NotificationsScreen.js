/**
 * NotificationsScreen.js
 * БАЙРШИЛ: src/screens/profile/NotificationsScreen.js
 * ✅ ANDROID: useSafeAreaInsets
 * ✅ Backend: GET /api/notification/my  (Notification model)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyNotifications, markAllRead, markOneRead } from '../../services/notificationService';

// ── Notification type тохиргоо ───────────────────────────────────────────────
const TYPE_CONFIG = {
  kyc_approved:         { icon: 'checkmark-circle',      color: '#27AE60', bg: '#E8F8EE', label: 'KYC баталгаажлаа' },
  kyc_rejected:         { icon: 'close-circle',          color: '#EF4444', bg: '#FEE2E2', label: 'KYC татгалзагдлаа' },
  credit_limit_set:     { icon: 'wallet',                color: '#5B5BD6', bg: '#EEEEFF', label: 'Зээлийн эрх' },
  loan_approved:        { icon: 'checkmark-done-circle', color: '#27AE60', bg: '#E8F8EE', label: 'Зээл зөвшөөрөгдлөө' },
  loan_rejected:        { icon: 'close-circle',          color: '#EF4444', bg: '#FEE2E2', label: 'Зээл татгалзагдлаа' },
  loan_disbursed:       { icon: 'cash',                  color: '#5B5BD6', bg: '#EEEEFF', label: 'Зээл олгогдлоо' },
  withdrawal_approved:  { icon: 'arrow-up-circle',       color: '#22C7BE', bg: '#E5FAFA', label: 'Татах зөвшөөрөгдлөө' },
  withdrawal_rejected:  { icon: 'arrow-up-circle',       color: '#EF4444', bg: '#FEE2E2', label: 'Татах татгалзагдлаа' },
  withdrawal_completed: { icon: 'checkmark-circle',      color: '#27AE60', bg: '#E8F8EE', label: 'Шилжүүлэгдлээ' },
  payment_reminder:     { icon: 'alarm',                 color: '#F59E0B', bg: '#FEF9C3', label: 'Төлбөр сануулга' },
  loan_due_soon:        { icon: 'time',                  color: '#F97316', bg: '#FFEDD5', label: 'Хугацаа дуусахад ойрхон' },
  loan_overdue:         { icon: 'warning',               color: '#EF4444', bg: '#FEE2E2', label: 'Хугацаа хэтэрсэн' },
  extension_reminder:   { icon: 'refresh-circle',        color: '#22C7BE', bg: '#E5FAFA', label: 'Сунгалт сануулга' },
  general:              { icon: 'notifications',         color: '#5B5BD6', bg: '#EEEEFF', label: 'Мэдэгдэл' },
};

const fmtDate = (d) => {
  if (!d) return '';
  const now = new Date();
  const dt  = new Date(d);
  const diff = Math.floor((now - dt) / 1000);
  if (diff < 60)   return 'Дөнгөж сая';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин өмнө`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} цаг өмнө`;
  if (diff < 604800)return `${Math.floor(diff / 86400)} өдөр өмнө`;
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

// ── Single notification card ──────────────────────────────────────────────────
const NotifCard = ({ item, onPress }) => {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
  return (
    <TouchableOpacity
      style={[N.card, !item.isRead && N.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      {/* Unread dot */}
      {!item.isRead && <View style={N.dot} />}

      <View style={[N.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>

      <View style={N.body}>
        <Text style={[N.title, !item.isRead && N.titleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={N.msg} numberOfLines={2}>{item.message}</Text>
        <Text style={N.time}>{fmtDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [markingAll, setMarkingAll]       = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getMyNotifications();
      if (res.success) setNotifications(res.data.notifications || []);
    } catch (e) { console.log('Notifications load error:', e); }
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, []);

  const handlePress = async (item) => {
    if (!item.isRead) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n._id === item._id ? { ...n, isRead: true } : n)
      );
      try { await markOneRead(item._id); } catch (e) {}
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.log('Mark all error:', e); }
    finally { setMarkingAll(false); }
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={[S.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0F0F1A" />
        </TouchableOpacity>
        <View style={S.headerMid}>
          <Text style={S.headerTitle}>Мэдэгдэл</Text>
          {unreadCount > 0 && (
            <View style={S.headerBadge}>
              <Text style={S.headerBadgeTxt}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} disabled={markingAll}>
            <Text style={S.markAllTxt}>{markingAll ? '...' : 'Бүгд уншсан'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 72 }} />
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <NotifCard item={item} onPress={handlePress} />}
        contentContainerStyle={S.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B5BD6" />
        }
        ListEmptyComponent={
          !loading && (
            <View style={S.empty}>
              <View style={S.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
              </View>
              <Text style={S.emptyTitle}>Мэдэгдэл байхгүй</Text>
              <Text style={S.emptySub}>Шинэ мэдэгдэл ирэхэд энд харагдана</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F2F4F9' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F2F4F9',
  },
  backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerMid:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:  { fontSize: 20, fontWeight: '800', color: '#0F0F1A' },
  headerBadge:  { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  headerBadgeTxt:{ fontSize: 11, fontWeight: '700', color: '#fff' },
  markAllTxt:   { fontSize: 13, color: '#5B5BD6', fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  empty:      { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F0F1A' },
  emptySub:   { fontSize: 13, color: '#94A3B8' },
});

const N = StyleSheet.create({
  card:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, position: 'relative' },
  cardUnread:  { backgroundColor: '#FAFBFF', borderWidth: 1, borderColor: '#E0E0F8' },
  dot:         { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: '#5B5BD6' },
  iconWrap:    { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  body:        { flex: 1 },
  title:       { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 3 },
  titleUnread: { fontWeight: '700', color: '#0F0F1A' },
  msg:         { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 6 },
  time:        { fontSize: 11, color: '#94A3B8' },
});