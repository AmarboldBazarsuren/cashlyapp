/**
 * My Loans Screen - Миний бүх зээлүүд
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/MyLoansScreen.js
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
import { getMyLoans } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import LoanCard from '../../components/loan/LoanCard';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';

const MyLoansScreen = ({ navigation }) => {
  const { loans, setLoans } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await getMyLoans();
      if (response.success) {
        setLoans(response.data.loans);
      }
    } catch (error) {
      console.log('Load loans error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  }, []);

  const filteredLoans = loans.filter((loan) => {
    if (filter === 'all') return true;
    if (filter === 'active')
      return ['pending', 'approved', 'active', 'extended', 'overdue'].includes(
        loan.status
      );
    if (filter === 'completed') return loan.status === 'completed';
    return true;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            Бүгд
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.filterTextActive,
            ]}
          >
            Идэвхтэй
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.filterTextActive,
            ]}
          >
            Дууссан
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loans List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            onPress={() =>
              navigation.navigate('LoanDetails', { loanId: item._id })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Зээл байхгүй байна</Text>
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
    fontSize: 14,
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

export default MyLoansScreen;