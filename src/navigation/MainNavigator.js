/**
 * Premium Main Navigator - FIXED
 * Emoji → Ionicons
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import MyLoansScreen from '../screens/loan/MyLoansScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Loan Screens
import ApplyLoanScreen from '../screens/loan/ApplyLoanScreen';
import LoanDetailsScreen from '../screens/loan/LoanDetailsScreen';
import ExtendLoanScreen from '../screens/loan/ExtendLoanScreen';

// KYC Screens
import KYCInfoScreen from '../screens/kyc/KYCInfoScreen';
import KYCDocumentsScreen from '../screens/kyc/KYCDocumentsScreen';

// Wallet Screens
import DepositScreen from '../screens/wallet/DepositScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';

// Profile Screens
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={[COLORS.backgroundCard, COLORS.background]}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Icon names
            const iconNames = {
              Home: isFocused ? 'home' : 'home-outline',
              Loans: isFocused ? 'wallet' : 'wallet-outline',
              Wallet: isFocused ? 'card' : 'card-outline',
              Profile: isFocused ? 'person' : 'person-outline',
            };

            // Labels
            const labels = {
              Home: 'Нүүр',
              Loans: 'Зээлүүд',
              Wallet: 'Хэтэвч',
              Profile: 'Профайл',
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                {isFocused ? (
                  <LinearGradient
                    colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeTabBackground}
                  >
                    <Ionicons 
                      name={iconNames[route.name]} 
                      size={24} 
                      color={COLORS.white}
                    />
                  </LinearGradient>
                ) : (
                  <Ionicons 
                    name={iconNames[route.name]} 
                    size={24} 
                    color={COLORS.textTertiary}
                  />
                )}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {labels[route.name]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ApplyLoan" component={ApplyLoanScreen} />
    <Stack.Screen name="KYCInfo" component={KYCInfoScreen} />
    <Stack.Screen name="KYCDocuments" component={KYCDocumentsScreen} />
  </Stack.Navigator>
);

// Loans Stack
const LoansStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="MyLoansMain" component={MyLoansScreen} />
    <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
    <Stack.Screen name="ExtendLoan" component={ExtendLoanScreen} />
  </Stack.Navigator>
);

// Wallet Stack
const WalletStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="WalletMain" component={WalletScreen} />
    <Stack.Screen name="Deposit" component={DepositScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Loans" component={LoansStack} />
      <Tab.Screen name="Wallet" component={WalletStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  tabBarGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTabBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default MainNavigator;