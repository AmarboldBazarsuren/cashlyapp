/**
 * Premium Profile Screen - FIXED
 * KYC Button нэмэгдсэн
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import CustomAlert from '../../components/common/CustomAlert';
import LoanStatusBadge from '../../components/loan/LoanStatusBadge';
import { COLORS } from '../../constants/colors';
import { formatMoney } from '../../utils/formatters';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [logoutAlertVisible, setLogoutAlertVisible] = React.useState(false);

  const handleLogout = () => {
    setLogoutAlertVisible(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const menuItems = [
    {
      icon: 'receipt-outline',
      title: 'Гүйлгээний түүх',
      color: COLORS.primary,
      onPress: () => navigation.navigate('TransactionHistory'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Аюулгүй байдал',
      color: COLORS.success,
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Тусламж',
      color: COLORS.warning,
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      title: 'Апп-ийн тухай',
      color: COLORS.info,
      onPress: () => {},
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
          <Text style={styles.headerTitle}>Профайл</Text>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userCard}
          >
            <View style={styles.userCardInner}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </Text>
              </View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
              {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
            </View>
            
            <View style={styles.userCardCircle1} />
            <View style={styles.userCardCircle2} />
          </LinearGradient>

          {/* KYC Button - not_submitted бол харагдана */}
          {user?.kycStatus === 'not_submitted' && (
            <TouchableOpacity
              style={styles.kycActionButton}
              onPress={() => navigation.navigate('KYCInfo')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.kycActionGradient}
              >
                <Icon name="shield-checkmark-outline" size={24} color={COLORS.white} />
                <View style={styles.kycActionText}>
                  <Text style={styles.kycActionTitle}>Хувийн мэдээлэл баталгаажуулах</Text>
                  <Text style={styles.kycActionSubtitle}>Зээл авахын тулд шаардлагатай</Text>
                </View>
                <Icon name="arrow-forward" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Card variant="glass" style={styles.kycCard}>
            <View style={styles.kycHeader}>
              <View style={styles.kycHeaderLeft}>
                <Icon name="document-text-outline" size={24} color={COLORS.textPrimary} />
                <Text style={styles.kycTitle}>KYC статус</Text>
              </View>
              <LoanStatusBadge status={user?.kycStatus} />
            </View>
            {user?.kycStatus === 'rejected' && user?.kycRejectedReason && (
              <View style={styles.rejectedContainer}>
                <Icon name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.rejectedReason}>
                  {user.kycRejectedReason}
                </Text>
              </View>
            )}
          </Card>

          {user?.creditLimit > 0 && (
            <View style={styles.creditContainer}>
              <Card variant="glass" style={styles.creditCardSmall}>
                <View style={styles.creditIconContainer}>
                  <LinearGradient
                    colors={[COLORS.success, COLORS.successLight]}
                    style={styles.creditIcon}
                  >
                    <Icon name="cash-outline" size={24} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <Text style={styles.creditLabel}>Зээлийн эрх</Text>
                <Text style={styles.creditValue}>
                  {formatMoney(user.creditLimit)}₮
                </Text>
              </Card>

              <Card variant="glass" style={styles.creditCardSmall}>
                <View style={styles.creditIconContainer}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.creditIcon}
                  >
                    <Icon name="trending-up-outline" size={24} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <Text style={styles.creditLabel}>Credit Score</Text>
                <Text style={styles.creditValue}>{user.creditScore || 0}</Text>
              </Card>
            </View>
          )}

          <Card variant="glass" style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[
                    styles.menuIconContainer,
                    { backgroundColor: item.color + '20' }
                  ]}>
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </Card>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.danger, COLORS.dangerLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Icon name="log-out-outline" size={22} color={COLORS.white} />
              <Text style={styles.logoutText}>Гарах</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CustomAlert
        visible={logoutAlertVisible}
        onClose={() => setLogoutAlertVisible(false)}
        title="Гарах"
        message="Та гарахдаа итгэлтэй байна уу?"
        type="warning"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Гарах', onPress: confirmLogout, style: 'destructive' }
        ]}
      />
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
    paddingBottom: 120,
  },
  userCard: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  userCardInner: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatar: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  userPhone: {
    fontSize: 15,
    color: COLORS.white,
    opacity: 0.9,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  userCardCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userCardCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  kycActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  kycActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  kycActionText: {
    flex: 1,
    marginLeft: 12,
  },
  kycActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  kycActionSubtitle: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
  },
  kycCard: {
    marginBottom: 16,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  rejectedContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: COLORS.danger + '10',
    borderRadius: 12,
  },
  rejectedReason: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.danger,
  },
  creditContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  creditCardSmall: {
    flex: 1,
  },
  creditIconContainer: {
    marginBottom: 12,
  },
  creditIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  creditValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuCard: {
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
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default ProfileScreen;