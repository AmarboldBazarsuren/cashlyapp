/**
 * CASHLY APP - Main Component
 * ✅ ANDROID EDGE-TO-EDGE FIXED
 * - SafeAreaProvider нэмсэн → бүх дэлгэц зөв insets авна
 * - StatusBar translucent=false + backgroundColor тохируулсан
 */

import React from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

LogBox.ignoreAllLogs();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <NavigationContainer>
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