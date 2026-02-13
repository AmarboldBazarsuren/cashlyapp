/**
 * Wallet Screen - Хэтэвч
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/WalletScreen.js
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

      if (walletRes.success) {
        setWallet(walletRes.data.wallet);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions);
      }
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
        <Text style={styles.balanceAmount}>
          {formatMoney(wallet?.balance || 0)}₮
        </Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetail}>
            <Text style={styles.balanceDetailLabel}>Боломжит</Text>
            <Text style={styles.balanceDetailValue}>
              {formatMoney(wallet?.availableBalance || 0)}₮
            </Text>
          </View>
          <View style={styles.balanceDetailDivider} />
          <View style={styles.balanceDetail}>
            <Text style={styles.balanceDetailLabel}>Түгжигдсэн</Text>
            <Text style={styles.balanceDetailValue}>
              {formatMoney(wallet?.frozenBalance || 0)}₮
            </Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Deposit')}
        >
          <View style={styles.actionIcon}>
            <Icon name="add-circle" size={32} color={COLORS.success} />
          </View>
          <Text style={styles.actionText}>Цэнэглэх</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Withdraw')}
        >
          <View style={styles.actionIcon}>
            <Icon name="arrow-down-circle" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Татах</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Статистик</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Нийт цэнэглэсэн:</Text>
          <Text style={styles.statValue}>
            {formatMoney(wallet?.totalDeposited || 0)}₮
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Нийт татсан:</Text>
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
              <Text style={styles.seeAllText}>Бүгдийг харах</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction) => (
            <TransactionItem key={transaction._id} transaction={transaction} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  balanceCard: {
    margin: 16,
    backgroundColor: COLORS.primary,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  balanceDetail: {
    flex: 1,
  },
  balanceDetailDivider: {
    width: 1,
    backgroundColor: COLORS.white + '30',
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  transactionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default WalletScreen;