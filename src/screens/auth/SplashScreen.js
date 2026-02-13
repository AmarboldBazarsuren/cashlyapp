/**
 * Splash Screen - Анхны splash дэлгэц
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/SplashScreen.js
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS } from '../../constants/colors';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.appName}>Cashly</Text>
        <Text style={styles.tagline}>Хурдан, найдвартай зээл</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
});

export default SplashScreen;