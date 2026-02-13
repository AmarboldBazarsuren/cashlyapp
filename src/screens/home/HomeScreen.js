/**
 * Premium Home Screen - FIXED VERSION
 * SafeAreaView, Loan Types, Better Layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProfile } from '../../services/userService';
import { getWallet } from '../../services/walletService';
import { getActiveLoans } from '../../services/loanService';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const HomeScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { wallet, setWallet, activeLoans, setActiveLoans } = useApp();
  const [refreshing, setRefreshing] = useState(false);

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

  const loanTypes = [
    {
      id: 'digital',
      title: 'Дижитал зээл',
      subtitle: 'Хурдан, хялбар',
      icon: 'flash',
      gradient: [COLORS.gradientStart, COLORS.gradientMiddle],
      available: true,
      onPress: () => {
        if (user?.kycStatus !== 'approved') {
          Toast.show({
            type: 'info',
            text1: 'Эхлээд хувийн мэдээлэл баталгаажуулна уу',
          });
          navigation.navigate('KYCInfo');
          return;
        }
        navigation.navigate('ApplyLoan');
      }
    },
    {
      id: 'car',
      title: 'Автомашин',
      subtitle: 'Тун удахгүй',
      icon: 'car-sport',
      gradient: [COLORS.info, COLORS.infoLight],
      available: false,
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Тун удахгүй',
          text2: 'Автомашины барицаат зээл удахгүй нэмэгдэнэ',
        });
      }
    },
    {
      id: 'property',
      title: 'Үл хөдлөх хөрөнгө',
      subtitle: 'Тун удахгүй',
      icon: 'home',
      gradient: [COLORS.success, COLORS.successLight],
      available: false,
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Тун удахгүй',
          text2: 'Үл хөдлөх хөрөнгийн барицаат зээл удахгүй нэмэгдэнэ',
        });
      }
    },
    {
      id: 'business',
      title: 'Бизнес зээл',
      subtitle: 'Тун удахгүй',
      icon: 'briefcase',
      gradient: [COLORS.warning, COLORS.warningLight],
      available: false,
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Тун удахгүй',
          text2: 'Бизнес зээл удахгүй нэмэгдэнэ',
        });
      }
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
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
            
            <View style={styles.walletCircle1} />
            <View style={styles.walletCircle2} />
          </LinearGradient>

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Зээлийн төрлүүд</Text>
            <View style={styles.loanTypesGrid}>
              {loanTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.loanTypeCard}
                  onPress={type.onPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={type.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loanTypeGradient}
                  >
                    <View style={styles.loanTypeContent}>
                      <View style={styles.loanTypeIconContainer}>
                        <Icon name={type.icon} size={32} color={COLORS.white} />
                      </View>
                      <View style={styles.loanTypeTextContainer}>
                        <Text style={styles.loanTypeTitle}>{type.title}</Text>
                        <Text style={styles.loanTypeSubtitle}>{type.subtitle}</Text>
                      </View>
                      {!type.available && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Удахгүй</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {activeLoans && activeLoans.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Идэвхтэй зээлүүд</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 20,
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
    paddingBottom: 120,
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
    marginBottom: 24,
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
    marginBottom: 16,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loanTypesGrid: {
    gap: 12,
  },
  loanTypeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  loanTypeGradient: {
    padding: 20,
  },
  loanTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loanTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  loanTypeTextContainer: {
    flex: 1,
  },
  loanTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  loanTypeSubtitle: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
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
});

export default HomeScreen;