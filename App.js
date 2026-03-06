/**
 * CASHLY APP - Main Component
 * ✅ ANDROID EDGE-TO-EDGE FIXED
 * ✅ PUSH NOTIFICATION LISTENER НЭМСЭН
 */

import React, { useEffect, useRef } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { addNotificationListeners, getInitialNotification } from './src/services/notificationSetup';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

LogBox.ignoreAllLogs();

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    // ── App бүрэн унтарсан үед notification дарж нээсэн бол ──
    getInitialNotification().then(data => {
      if (data?.type) {
        // Navigation бэлэн болтол хүлээнэ
        setTimeout(() => handleNotificationNavigation(data), 1000);
      }
    });

    // ── Notification listener нэмэх ──
    const cleanup = addNotificationListeners(
      // App нээлттэй байхад notification ирвэл
      (notification) => {
        console.log('🔔 Notification ирлээ:', notification.request.content.title);
      },
      // Хэрэглэгч notification дарахад
      (data) => {
        handleNotificationNavigation(data);
      }
    );

    return cleanup;
  }, []);

  // Notification дарахад зохих дэлгэц рүү шилжих
  const handleNotificationNavigation = (data) => {
    if (!navigationRef.current) return;

    switch (data?.type) {
      case 'loan_approved':
      case 'loan_rejected':
      case 'loan_due_soon':
      case 'loan_overdue':
      case 'payment_reminder':
      case 'extension_reminder':
        navigationRef.current.navigate('MyLoans');
        break;
      case 'kyc_approved':
      case 'kyc_rejected':
      case 'credit_limit_set':
        navigationRef.current.navigate('Profile');
        break;
      case 'withdrawal_approved':
      case 'withdrawal_rejected':
      case 'withdrawal_completed':
        navigationRef.current.navigate('Wallet');
        break;
      default:
        navigationRef.current.navigate('Notifications');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
                translucent={false}
              />
              <AppNavigator />
              <Toast />
            </NavigationContainer>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;