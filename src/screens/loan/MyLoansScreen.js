/**
 * Premium My Loans Screen
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
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { getMyLoans } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import LoanCard from '../../components/loan/LoanCard';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';

const MyLoansScreen = ({ navigation }) => {
  const { loans, setLoans } = useApp();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

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
      return ['pending', 'approved', 'active', 'extended', 'overdue'].includes(loan.status);
    if (filter === 'completed') return loan.status === 'completed';
    return true;
  });

  const filters = [
    { label: 'Бүгд', value: 'all', icon: 'apps' },
    { label: 'Идэвхтэй', value: 'active', icon: 'flash' },
    { label: 'Дууссан', value: 'completed', icon: 'checkmark-circle' },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Миний зээлүүд</Text>
        <Text style={styles.headerSubtitle}>
          Нийт {filteredLoans.length} зээл
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item.value}
            onPress={() => setFilter(item.value)}
            activeOpacity={0.7}
            style={styles.filterWrapper}
          >
            {filter === item.value ? (
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterButton}
              >
                <Icon name={item.icon} size={16} color={COLORS.white} />
                <Text style={[styles.filterText, styles.filterTextActive]}>
                  {item.label}
                </Text>
              </LinearGradient>
            ) : (
              <View style={[styles.filterButton, styles.filterButtonInactive]}>
                <Icon name={item.icon} size={16} color={COLORS.textTertiary} />
                <Text style={styles.filterText}>{item.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.accent + '20']}
              style={styles.emptyIcon}
            >
              <Icon name="wallet-outline" size={48} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.emptyText}>Зээл байхгүй байна</Text>
            <Text style={styles.emptySubtext}>
              Та зээл авснаар энд харагдана
            </Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  filterButtonInactive: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default MyLoansScreen;