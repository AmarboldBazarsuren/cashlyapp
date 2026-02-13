/**
 * Premium Wallet Screen - Modern Dark Theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { getWallet, getTransactions } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import Card from '../../components/common/Card';
import TransactionItem from '../../components/wallet/TransactionItem';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const WalletScreen = ({ navigation }) => {
  const { wallet, setWallet, transactions, setTransactions } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        getWallet(),
        getTransactions(1),
      ]);

      if (walletRes.success) setWallet(walletRes.data.wallet);
      if (transactionsRes.success) setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.log('Load wallet data error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Хэтэвч</Text>
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
        {/* Balance Card - Premium Gradient */}
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceCardInner}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
              <TouchableOpacity>
                <Icon name="eye-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.balanceAmount}>
              {formatMoney(wallet?.balance || 0)}
              <Text style={styles.currency}>₮</Text>
            </Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetail}>
                <Icon name="checkmark-circle" size={16} color={COLORS.white} />
                <View style={styles.balanceDetailContent}>
                  <Text style={styles.balanceDetailLabel}>Боломжит</Text>
                  <Text style={styles.balanceDetailValue}>
                    {formatMoney(wallet?.availableBalance || 0)}₮
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceDetailDivider} />
              
              <View style={styles.balanceDetail}>
                <Icon name="lock-closed" size={16} color={COLORS.white} />
                <View style={styles.balanceDetailContent}>
                  <Text style={styles.balanceDetailLabel}>Түгжигдсэн</Text>
                  <Text style={styles.balanceDetailValue}>
                    {formatMoney(wallet?.frozenBalance || 0)}₮
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit')}
          >
            <LinearGradient
              colors={[COLORS.success, COLORS.successLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIconContainer}
            >
              <Icon name="add" size={28} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.actionText}>Цэнэглэх</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <LinearGradient
              colors={[COLORS.info, COLORS.infoLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIconContainer}
            >
              <Icon name="arrow-down" size={28} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.actionText}>Татах</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile', { screen: 'TransactionHistory' })}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIconContainer}
            >
              <Icon name="receipt-outline" size={28} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.actionText}>Түүх</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Card */}
        <Card variant="glass" style={styles.statsCard}>
          <Text style={styles.cardTitle}>Статистик</Text>
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="arrow-up" size={16} color={COLORS.success} />
            </View>
            <Text style={styles.statLabel}>Нийт цэнэглэсэн</Text>
            <Text style={styles.statValue}>
              {formatMoney(wallet?.totalDeposited || 0)}₮
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="arrow-down" size={16} color={COLORS.info} />
            </View>
            <Text style={styles.statLabel}>Нийт татсан</Text>
            <Text style={styles.statValue}>
              {formatMoney(wallet?.totalWithdrawn || 0)}₮
            </Text>
          </View>
        </Card>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Сүүлийн гүйлгээ</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Profile', { screen: 'TransactionHistory' })
                }
              >
                <Text style={styles.seeAllText}>Бүгд</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction._id} transaction={transaction} />
            ))}
          </View>
        )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  balanceCardInner: {
    position: 'relative',
    zIndex: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '500',
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: '900',
    marginBottom: 20,
  },
  currency: {
    fontSize: 32,
    fontWeight: '700',
    opacity: 0.8,
  },
  balanceDetails: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceDetailContent: {
    marginLeft: 8,
  },
  balanceDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  balanceDetailLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  balanceDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default WalletScreen;