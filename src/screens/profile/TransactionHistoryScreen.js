/**
 * Transaction History Screen - Гүйлгээний түүх
 * БАЙРШИЛ: Cashly.mn/App/src/screens/profile/TransactionHistoryScreen.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getTransactions } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import TransactionItem from '../../components/wallet/TransactionItem';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';

const TransactionHistoryScreen = () => {
  const { transactions, setTransactions } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(''); // '', 'deposit', 'withdrawal', 'loan_payment'

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    try {
      const response = await getTransactions(1, filter);
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.log('Load transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [filter]);

  if (loading) {
    return <Loading />;
  }

  const filters = [
    { label: 'Бүгд', value: '' },
    { label: 'Цэнэглэлт', value: 'deposit' },
    { label: 'Зарлага', value: 'withdrawal' },
    { label: 'Зээл', value: 'loan_payment' },
  ];

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterContainer}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.filterButton,
              filter === item.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.value && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Гүйлгээ байхгүй байна</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default TransactionHistoryScreen;