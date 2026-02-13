/**
 * Register Screen - Бүртгүүлэх
 * БАЙРШИЛ: Cashly.mn/App/src/screens/auth/RegisterScreen.js
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phoneNumber || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Бүх талбарыг бөглөнө үү',
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

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Нууц үг багадаа 6 тэмдэгттэй байх ёстой',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Нууц үг таарахгүй байна',
      });
      return;
    }

    setLoading(true);
    const result = await register(phoneNumber, password, name);
    setLoading(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Бүртгэлд алдаа гарлаа',
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
          <Text style={styles.title}>Бүртгүүлэх</Text>
          <Text style={styles.subtitle}>Шинэ хэрэглэгч үүсгэх</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Нэр"
            placeholder="Таны нэр"
            value={name}
            onChangeText={setName}
          />

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

          <Input
            label="Нууц үг дахин"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Бүртгүүлэх"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>
              Бүртгэлтэй юу?{' '}
              <Text style={styles.loginTextBold}>Нэвтрэх</Text>
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
  registerButton: {
    marginTop: 24,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default RegisterScreen;