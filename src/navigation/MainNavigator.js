/**
 * Main Navigator - Нэвтэрсний дараах navigation
 * БАЙРШИЛ: Cashly.mn/App/src/navigation/MainNavigator.js
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

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

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'Нүүр' }}
    />
    <Stack.Screen 
      name="ApplyLoan" 
      component={ApplyLoanScreen}
      options={{ title: 'Зээл авах' }}
    />
    <Stack.Screen 
      name="KYCInfo" 
      component={KYCInfoScreen}
      options={{ title: 'Хувийн мэдээлэл' }}
    />
    <Stack.Screen 
      name="KYCDocuments" 
      component={KYCDocumentsScreen}
      options={{ title: 'Баримт бичиг' }}
    />
  </Stack.Navigator>
);

// Loans Stack
const LoansStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="MyLoansMain" 
      component={MyLoansScreen}
      options={{ title: 'Миний зээлүүд' }}
    />
    <Stack.Screen 
      name="LoanDetails" 
      component={LoanDetailsScreen}
      options={{ title: 'Зээлийн дэлгэрэнгүй' }}
    />
    <Stack.Screen 
      name="ExtendLoan" 
      component={ExtendLoanScreen}
      options={{ title: 'Зээл сунгах' }}
    />
  </Stack.Navigator>
);

// Wallet Stack
const WalletStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="WalletMain" 
      component={WalletScreen}
      options={{ title: 'Хэтэвч' }}
    />
    <Stack.Screen 
      name="Deposit" 
      component={DepositScreen}
      options={{ title: 'Цэнэглэх' }}
    />
    <Stack.Screen 
      name="Withdraw" 
      component={WithdrawScreen}
      options={{ title: 'Татах' }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'Профайл' }}
    />
    <Stack.Screen 
      name="TransactionHistory" 
      component={TransactionHistoryScreen}
      options={{ title: 'Гүйлгээний түүх' }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Loans') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Нүүр' }}
      />
      <Tab.Screen 
        name="Loans" 
        component={LoansStack}
        options={{ tabBarLabel: 'Зээлүүд' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletStack}
        options={{ tabBarLabel: 'Хэтэвч' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Профайл' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;