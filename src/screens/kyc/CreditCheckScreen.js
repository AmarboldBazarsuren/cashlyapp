/**
 * CreditCheckScreen.js - Зээлийн эрх тогтоох (3000₮ төлбөр)
 * src/screens/kyc/CreditCheckScreen.js
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { payCreditCheckFee } from '../../services/userService';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';
import CustomAlert from '../../components/common/CustomAlert';

const CREDIT_CHECK_FEE = 3000;

export default function CreditCheckScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { wallet } = useApp();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const hasBalance = wallet?.balance >= CREDIT_CHECK_FEE;

  const handlePayment = () => {
    if (!hasBalance) {
      Toast.show({
        type: 'error',
        text1: 'Хэтэвчний үлдэгдэл хүрэлцэхгүй',
        text2: `Хэтэвчнээ ${CREDIT_CHECK_FEE}₮ цэнэглэнэ үү`,
      });
      return;
    }

    setAlertVisible(true);
  };

  const confirmPayment = async () => {
    setLoading(true);
    try {
      const response = await payCreditCheckFee();

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай!',
          text2: 'Таны зээлийн эрхийг 24-48 цагт тооцоолж байна',
          visibilityTime: 4000,
        });
        
        updateUser({ 
          ...user, 
          creditCheckPaid: true, 
          creditCheckPaidAt: response.data.creditCheckPaidAt 
        });

        // Navigate back to Home
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: error.message || 'Төлбөр төлөхөд алдаа гарлаа',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн эрх тогтоох</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={['#EAB308', '#F59E0B']}
            style={styles.iconGradient}
          >
            <Ionicons name="shield-checkmark" size={48} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Зээлийн эрх тогтоох</Text>
        <Text style={styles.subtitle}>
          Таны зээлийн эрхийг тогтоохын тулд 3000₮ төлбөр төлөх шаардлагатай
        </Text>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Танд тохирсон зээлийн эрхийг тогтооно</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>24-48 цагийн дотор мэдэгдэл ирнэ</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Зээлийн эрх олдсоны дараа зээл авах боломжтой</Text>
          </View>
        </View>

        {/* Fee Card */}
        <View style={styles.feeCard}>
          <Text style={styles.feeLabel}>Төлбөр</Text>
          <Text style={styles.feeAmount}>{formatMoney(CREDIT_CHECK_FEE)}₮</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Хэтэвчний үлдэгдэл</Text>
            <Text style={styles.balanceValue}>{formatMoney(wallet?.balance || 0)}₮</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Төлсний дараа</Text>
            <Text style={[styles.balanceValue, { color: hasBalance ? '#10B981' : '#EF4444' }]}>
              {formatMoney(Math.max(0, (wallet?.balance || 0) - CREDIT_CHECK_FEE))}₮
            </Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={hasBalance ? ['#EAB308', '#F59E0B'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.payBtnGradient}
          >
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.payBtnText}>
              {loading ? 'Төлж байна...' : hasBalance ? 'Төлөх' : 'Хэтэвч цэнэглэх'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {!hasBalance && (
          <TouchableOpacity
            style={styles.depositBtn}
            onPress={() => navigation.navigate('Wallet', { screen: 'Deposit' })}
          >
            <Text style={styles.depositBtnText}>Хэтэвч цэнэглэх</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Зээлийн эрх тогтоох"
        message={`Хэтэвчээс ${formatMoney(CREDIT_CHECK_FEE)}₮ хасагдах болно. Үргэлжлүүлэх үү?`}
        type="info"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Төлөх', onPress: confirmPayment }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },
  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: '#EAB308', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F0F1A', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  feeCard: { backgroundColor: '#FEF9C3', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  feeLabel: { fontSize: 13, color: '#92400E', marginBottom: 6 },
  feeAmount: { fontSize: 32, fontWeight: '900', color: '#EAB308' },
  balanceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 24 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  balanceLabel: { fontSize: 14, color: '#64748B' },
  balanceValue: { fontSize: 16, fontWeight: '700', color: '#0F0F1A' },
  payBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  payBtnDisabled: { opacity: 0.6 },
  payBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  depositBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  depositBtnText: { fontSize: 15, fontWeight: '600', color: '#5B5BD6' },
});