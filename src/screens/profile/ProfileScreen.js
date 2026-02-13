/**
 * Profile Screen - Профайл
 * БАЙРШИЛ: Cashly.mn/App/src/screens/profile/ProfileScreen.js
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import LoanStatusBadge from '../../components/loan/LoanStatusBadge';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Гарах', 'Та гарахдаа итгэлтэй байна уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Гарах',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'list',
      title: 'Гүйлгээний түүх',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
    {
      icon: 'help-circle',
      title: 'Тусламж',
      onPress: () => Alert.alert('Тусламж', 'Холбоо барих: support@cashly.mn'),
    },
    {
      icon: 'information-circle',
      title: 'Апп-ийн тухай',
      onPress: () => Alert.alert('Cashly', 'Version 1.0.0'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <Card style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
        {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
      </Card>

      {/* KYC Status */}
      <Card style={styles.kycCard}>
        <View style={styles.kycHeader}>
          <Text style={styles.kycTitle}>KYC статус</Text>
          <LoanStatusBadge status={user?.kycStatus} />
        </View>
        {user?.kycStatus === 'rejected' && user?.kycRejectedReason && (
          <Text style={styles.rejectedReason}>
            Шалтгаан: {user.kycRejectedReason}
          </Text>
        )}
      </Card>

      {/* Credit Info */}
      {user?.creditLimit > 0 && (
        <Card style={styles.creditCard}>
          <Text style={styles.creditTitle}>Зээлийн мэдээлэл</Text>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Зээлийн эрх:</Text>
            <Text style={styles.creditValue}>
              {formatMoney(user.creditLimit)}₮
            </Text>
          </View>
          <View style={styles.creditRow}>
            <Text style={styles.creditLabel}>Credit score:</Text>
            <Text style={styles.creditValue}>{user.creditScore || 0}</Text>
          </View>
        </Card>
      )}

      {/* Menu */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index !== menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Icon name={item.icon} size={24} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-forward" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={24} color={COLORS.danger} />
        <Text style={styles.logoutText}>Гарах</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  userCard: {
    margin: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  kycCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rejectedReason: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.danger,
  },
  creditCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 8,
  },
});

export default ProfileScreen;