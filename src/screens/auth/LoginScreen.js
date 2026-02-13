/**
 * Login Screen - Нэвтрэх
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/LoginScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS } from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Утасны дугаар болон нууц үгээ оруулна уу',
      });
      return;
    }

    if (phoneNumber.length !== 8) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Утасны дугаар 8 оронтой байх ёстой',
      });
      return;
    }

    setLoading(true);
    const result = await login(phoneNumber, password);
    setLoading(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Нэвтрэхэд алдаа гарлаа',
        text2: result.message,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>Cashly</Text>
          <Text style={styles.subtitle}>Тавтай морил</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Утасны дугаар"
            placeholder="99119911"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={8}
          />

          <Input
            label="Нууц үг"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Нэвтрэх"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Бүртгэл байхгүй юу?{' '}
              <Text style={styles.registerTextBold}>Бүртгүүлэх</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: 24,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerTextBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default LoginScreen;