/**
 * Main Navigator
 * ✅ NotificationsScreen ProfileStack-д нэмсэн
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import MyLoansScreen from '../screens/loan/MyLoansScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ApplyLoanScreen from '../screens/loan/ApplyLoanScreen';
import LoanDetailsScreen from '../screens/loan/LoanDetailsScreen';
import ExtendLoanScreen from '../screens/loan/ExtendLoanScreen';
import KYCInfoScreen from '../screens/kyc/KYCInfoScreen';
import KYCDocumentsScreen from '../screens/kyc/KYCDocumentsScreen';
import CreditCheckScreen from '../screens/kyc/CreditCheckScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import DepositScreen from '../screens/wallet/DepositScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';
import PersonalInfoViewScreen from '../screens/profile/PersonalInfoViewScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ICON_MAP = {
  Home:    { active: 'home',   inactive: 'home-outline' },
  Loans:   { active: 'wallet', inactive: 'wallet-outline' },
  Wallet:  { active: 'card',   inactive: 'card-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};
const LABEL_MAP = {
  Home: 'Нүүр', Loans: 'Зээлүүд', Wallet: 'Хэтэвч', Profile: 'Профайл',
};

const CustomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = ICON_MAP[route.name] || { active: 'apps', inactive: 'apps-outline' };

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {isFocused ? (
                <LinearGradient
                  colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeCircle}
                >
                  <Ionicons name={icons.active} size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIcon}>
                  <Ionicons name={icons.inactive} size={22} color={COLORS.textTertiary} />
                </View>
              )}
              <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
                {LABEL_MAP[route.name]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ApplyLoan" component={ApplyLoanScreen} />
    <Stack.Screen name="KYCInfo" component={KYCInfoScreen} />
    <Stack.Screen name="KYCDocuments" component={KYCDocumentsScreen} />
    <Stack.Screen name="CreditCheck" component={CreditCheckScreen} />
    {/* ✅ Notifications HomeStack-аас ч нээгдэх боломжтой */}
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const LoansStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyLoansMain" component={MyLoansScreen} />
    <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
    <Stack.Screen name="ExtendLoan" component={ExtendLoanScreen} />
  </Stack.Navigator>
);

const WalletStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WalletMain" component={WalletScreen} />
    <Stack.Screen name="Deposit" component={DepositScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    <Stack.Screen name="PersonalInfoView" component={PersonalInfoViewScreen} />
    {/* ✅ NotificationsScreen ProfileStack-д нэмсэн */}
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Loans" component={LoansStack} />
    <Tab.Screen name="Wallet" component={WalletStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 14,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 54,
  },
  activeCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default MainNavigator;