/**
 * Premium Register Screen - Modern Dark Theme
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundSecondary, COLORS.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Icon name="person-add" size={32} color={COLORS.white} />
            </LinearGradient>
            
            <Text style={styles.title}>Бүртгүүлэх</Text>
            <Text style={styles.subtitle}>Шинэ хэрэглэгч үүсгэх</Text>
          </View>

          <View style={styles.formContainer}>
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
              prefix="🇲🇳"
            />

            <Input
              label="Нууц үг"
              placeholder="Багадаа 6 тэмдэгт"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Нууц үг дахин"
              placeholder="Нууц үг давтах"
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>эсвэл</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>Бүртгэлтэй юу? </Text>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginTextGradient}
              >
                <Text style={styles.loginTextBold}>Нэвтрэх</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textTertiary,
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  loginTextGradient: {
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  loginTextBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default RegisterScreen;