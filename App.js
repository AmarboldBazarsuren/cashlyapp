/**
 * CASHLY APP - Main Component
 * ЗАСВАР: StatusBar translucent=false → хуудас status bar-ын ард ордоггүй болно
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

LogBox.ignoreAllLogs();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer>
         
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.background}
              translucent={false}
            />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;