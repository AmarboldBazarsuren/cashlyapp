/**
 * Premium Home Screen - Modern Dark Theme
 * With Glassmorphism & Gradient Cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProfile, payCreditCheckFee } from '../../services/userService';
import { getWallet } from '../../services/walletService';
import { getActiveLoans } from '../../services/loanService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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

      if (profileRes.success) updateUser(profileRes.data.user);
      if (walletRes.success) setWallet(walletRes.data.wallet);
      if (loansRes.success) setActiveLoans(loansRes.data.loans);
    } catch (error) {
      console.log('Load data error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Сайн байна уу,</Text>
            <Text style={styles.userName}>{user?.name || 'Хэрэглэгч'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.notificationGradient}
            >
              <Icon name="notifications-outline" size={22} color={COLORS.white} />
              <View style={styles.notificationBadge} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Wallet Card with Gradient */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.walletCardInner}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletLabel}>Хэтэвчний үлдэгдэл</Text>
              <TouchableOpacity>
                <Icon name="eye-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.walletBalance}>
              {formatMoney(wallet?.balance || 0)}
              <Text style={styles.currency}>₮</Text>
            </Text>
            
            <View style={styles.walletActions}>
              <TouchableOpacity
                style={styles.walletAction}
                onPress={() => navigation.navigate('Wallet', { screen: 'Deposit' })}
              >
                <View style={styles.walletActionIcon}>
                  <Icon name="add" size={20} color={COLORS.success} />
                </View>
                <Text style={styles.walletActionText}>Цэнэглэх</Text>
              </TouchableOpacity>
              
              <View style={styles.walletActionDivider} />
              
              <TouchableOpacity
                style={styles.walletAction}
                onPress={() => navigation.navigate('Wallet', { screen: 'Withdraw' })}
              >
                <View style={styles.walletActionIcon}>
                  <Icon name="arrow-down" size={20} color={COLORS.info} />
                </View>
                <Text style={styles.walletActionText}>Татах</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Decorative circles */}
          <View style={styles.walletCircle1} />
          <View style={styles.walletCircle2} />
        </LinearGradient>

        {/* Credit Limit Card */}
        {user?.creditLimit > 0 && (
          <Card variant="glass" style={styles.creditCard}>
            <View style={styles.creditHeader}>
              <View>
                <Text style={styles.creditLabel}>Зээлийн эрх</Text>
                <Text style={styles.creditAmount}>
                  {formatMoney(user.creditLimit)}₮
                </Text>
              </View>
              <LinearGradient
                colors={[COLORS.success, COLORS.successLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.creditBadge}
              >
                <Icon name="checkmark-circle" size={20} color={COLORS.white} />
              </LinearGradient>
            </View>
          </Card>
        )}

        {/* Apply Loan Button */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.applyLoanGradient}
        >
          <TouchableOpacity 
            style={styles.applyLoanButton}
            onPress={() => navigation.navigate('ApplyLoan')}
            activeOpacity={0.8}
          >
            <View style={styles.applyLoanIcon}>
              <Icon name="cash-outline" size={28} color={COLORS.white} />
            </View>
            <View style={styles.applyLoanContent}>
              <Text style={styles.applyLoanTitle}>Зээл авах</Text>
              <Text style={styles.applyLoanSubtitle}>
                Хурдан, найдвартай зээл
              </Text>
            </View>
            <Icon name="arrow-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Active Loans Section */}
        {activeLoans && activeLoans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Идэвхтэй зээлүүд</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Бүгд →</Text>
              </TouchableOpacity>
            </View>
            
            {activeLoans.slice(0, 2).map((loan) => (
              <TouchableOpacity
                key={loan._id}
                onPress={() =>
                  navigation.navigate('Loans', {
                    screen: 'LoanDetails',
                    params: { loanId: loan._id },
                  })
                }
              >
                <Card variant="glass" style={styles.loanCard}>
                  <View style={styles.loanCardHeader}>
                    <View>
                      <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                      <Text style={styles.loanAmount}>
                        {formatMoney(loan.principal)}₮
                      </Text>
                    </View>
                    <View style={[
                      styles.loanStatusBadge,
                      { backgroundColor: COLORS.info + '30' },
                    ]}>
                      <Text style={[styles.loanStatusText, { color: COLORS.info }]}>
                        Идэвхтэй
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.loanProgress}>
                    <View style={styles.loanProgressBar}>
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.loanProgressFill,
                          { 
                            width: `${((loan.paidAmount / loan.totalAmount) * 100)}%` 
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.loanProgressText}>
                      {formatMoney(loan.remainingAmount)}₮ үлдсэн
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Түргэн үйлдлүүд</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Loans')}
            >
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '10']}
                style={styles.quickActionIcon}
              >
                <Icon name="wallet-outline" size={28} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.quickActionText}>Миний зээлүүд</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                navigation.navigate('Profile', { screen: 'TransactionHistory' })
              }
            >
              <LinearGradient
                colors={[COLORS.success + '20', COLORS.success + '10']}
                style={styles.quickActionIcon}
              >
                <Icon name="receipt-outline" size={28} color={COLORS.success} />
              </LinearGradient>
              <Text style={styles.quickActionText}>Түүх</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={[COLORS.accent + '20', COLORS.accent + '10']}
                style={styles.quickActionIcon}
              >
                <Icon name="person-outline" size={28} color={COLORS.accent} />
              </LinearGradient>
              <Text style={styles.quickActionText}>Профайл</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient
                colors={[COLORS.warning + '20', COLORS.warning + '10']}
                style={styles.quickActionIcon}
              >
                <Icon name="help-circle-outline" size={28} color={COLORS.warning} />
              </LinearGradient>
              <Text style={styles.quickActionText}>Тусламж</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  notificationButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  notificationGradient: {
    padding: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  walletCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  walletCardInner: {
    position: 'relative',
    zIndex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
  walletBalance: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 20,
  },
  currency: {
    fontSize: 28,
    fontWeight: '700',
    opacity: 0.8,
  },
  walletActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletActionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  walletActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  walletActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  walletCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  creditCard: {
    marginBottom: 16,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  creditAmount: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  creditBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLoanGradient: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  applyLoanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  applyLoanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  applyLoanContent: {
    flex: 1,
  },
  applyLoanTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  applyLoanSubtitle: {
    color: COLORS.white,
    fontSize: 13,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loanCard: {
    marginBottom: 12,
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loanNumber: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  loanAmount: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  loanStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  loanStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanProgress: {
    marginTop: 4,
  },
  loanProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  loanProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loanProgressText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;