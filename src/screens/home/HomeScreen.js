/**
 * Home Screen - Нүүр хуудас
 * БАЙРШИЛ: Cashly.mn/App/src/screens/home/HomeScreen.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProfile, payCreditCheckFee } from '../../services/userService';
import { getWallet } from '../../services/walletService';
import { getActiveLoans } from '../../services/loanService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoanCard from '../../components/loan/LoanCard';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';
import { CREDIT_CHECK_FEE } from '../../constants/config';

const HomeScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { wallet, setWallet, activeLoans, setActiveLoans } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, walletRes, loansRes] = await Promise.all([
        getProfile(),
        getWallet(),
        getActiveLoans(),
      ]);

      if (profileRes.success) {
        updateUser(profileRes.data.user);
      }

      if (walletRes.success) {
        setWallet(walletRes.data.wallet);
      }

      if (loansRes.success) {
        setActiveLoans(loansRes.data.loans);
      }
    } catch (error) {
      console.log('Load data error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handlePayCreditCheck = async () => {
    Alert.alert(
      'Зээлийн эрх шалгах',
      `${CREDIT_CHECK_FEE}₮ төлбөр төлөх үү?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Төлөх',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await payCreditCheckFee();
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Амжилттай',
                  text2: response.message,
                });
                await loadData();
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Алдаа',
                text2: error.message,
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleApplyLoan = () => {
    // KYC шалгах
    if (user?.kycStatus === 'not_submitted') {
      Alert.alert(
        'Хувийн мэдээлэл',
        'Зээл авахын тулд эхлээд хувийн мэдээлэл баталгаажуулна уу',
        [
          { text: 'Болих', style: 'cancel' },
          {
            text: 'Баталгаажуулах',
            onPress: () => navigation.navigate('KYCInfo'),
          },
        ]
      );
      return;
    }

    if (user?.kycStatus === 'pending') {
      Alert.alert(
        'Хүлээгдэж байна',
        'Таны хувийн мэдээлэл хянагдаж байна. Түр хүлээнэ үү'
      );
      return;
    }

    if (user?.kycStatus === 'rejected') {
      Alert.alert(
        'Татгалзсан',
        'Таны хувийн мэдээлэл татгалзагдсан. Дахин илгээнэ үү',
        [
          { text: 'Болих', style: 'cancel' },
          {
            text: 'Дахин илгээх',
            onPress: () => navigation.navigate('KYCInfo'),
          },
        ]
      );
      return;
    }

    // Credit check төлбөр шалгах
    if (!user?.creditCheckPaid) {
      Alert.alert(
        'Зээлийн эрх шалгах',
        `Зээл авахын тулд эхлээд ${CREDIT_CHECK_FEE}₮ зээлийн эрх шалгах төлбөр төлнө үү`,
        [
          { text: 'Болих', style: 'cancel' },
          { text: 'Төлөх', onPress: handlePayCreditCheck },
        ]
      );
      return;
    }

    // Credit limit шалгах
    if (user?.creditLimit === 0) {
      Alert.alert(
        'Хүлээгдэж байна',
        'Админ танд зээлийн эрх тогтоож байна. Түр хүлээнэ үү'
      );
      return;
    }

    // Зээл авах хуудас руу шилжих
    navigation.navigate('ApplyLoan');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Сайн байна уу,</Text>
          <Text style={styles.userName}>{user?.name || 'Хэрэглэгч'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Wallet Card */}
      <Card style={styles.walletCard}>
        <Text style={styles.walletLabel}>Хэтэвчний үлдэгдэл</Text>
        <Text style={styles.walletBalance}>
          {formatMoney(wallet?.balance || 0)}₮
        </Text>
        <View style={styles.walletActions}>
          <TouchableOpacity
            style={styles.walletAction}
            onPress={() => navigation.navigate('Wallet', { screen: 'Deposit' })}
          >
            <Icon name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.walletActionText}>Цэнэглэх</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.walletAction}
            onPress={() => navigation.navigate('Wallet', { screen: 'Withdraw' })}
          >
            <Icon name="arrow-down-circle" size={24} color={COLORS.primary} />
            <Text style={styles.walletActionText}>Татах</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Credit Limit */}
      {user?.creditLimit > 0 && (
        <Card style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <Text style={styles.creditLabel}>Зээлийн эрх</Text>
            <Icon name="checkmark-circle" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.creditAmount}>
            {formatMoney(user.creditLimit)}₮
          </Text>
        </Card>
      )}

      {/* Apply Loan Button */}
      <Button
        title="🎯 Зээл авах"
        onPress={handleApplyLoan}
        style={styles.applyButton}
        loading={loading}
      />

      {/* Active Loans */}
      {activeLoans && activeLoans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Идэвхтэй зээлүүд</Text>
          {activeLoans.map((loan) => (
            <LoanCard
              key={loan._id}
              loan={loan}
              onPress={() =>
                navigation.navigate('Loans', {
                  screen: 'LoanDetails',
                  params: { loanId: loan._id },
                })
              }
            />
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Түргэн үйлдлүүд</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Loans')}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="wallet" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Миний зээлүүд</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate('Profile', { screen: 'TransactionHistory' })
            }
          >
            <View style={styles.quickActionIcon}>
              <Icon name="list" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Түүх</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="person" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Профайл</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  userName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  walletCard: {
    margin: 16,
    marginTop: -30,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  walletLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  walletAction: {
    alignItems: 'center',
  },
  walletActionText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  creditCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  creditAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  applyButton: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;