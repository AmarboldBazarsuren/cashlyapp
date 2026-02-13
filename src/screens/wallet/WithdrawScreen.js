/**
 * Withdraw Screen - FIXED
 * SafeAreaView, KeyboardAvoidingView, CustomAlert
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { requestWithdrawal } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { MIN_WITHDRAWAL_AMOUNT } from '../../constants/config';
import { formatMoney } from '../../utils/formatters';

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { wallet, setWallet } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const bankInfo = user?.personalInfo?.bankInfo;
  const availableBalance = wallet?.availableBalance || 0;

  const handleWithdraw = () => {
    if (!bankInfo?.bankName || !bankInfo?.accountNumber) {
      setAlertVisible(true);
      return;
    }

    if (!amount || parseFloat(amount) < MIN_WITHDRAWAL_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Хамгийн бага татах дүн ${formatMoney(MIN_WITHDRAWAL_AMOUNT)}₮`,
      });
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Хэтэвчний үлдэгдэл хүрэлцэхгүй байна. Боломжит: ${formatMoney(availableBalance)}₮`,
      });
      return;
    }

    setAlertVisible(true);
  };

  const confirmWithdraw = async () => {
    setLoading(true);
    try {
      const response = await requestWithdrawal(parseFloat(amount));

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: response.message,
        });
        setWallet(response.data.wallet);
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: error.message || 'Хүсэлт илгээхэд алдаа гарлаа',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.background, COLORS.backgroundSecondary]}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мөнгө татах</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Боломжит үлдэгдэл</Text>
            <Text style={styles.balanceAmount}>
              {formatMoney(availableBalance)}₮
            </Text>
          </Card>

          {bankInfo?.bankName && (
            <Card style={styles.bankCard}>
              <Text style={styles.bankTitle}>Банкны мэдээлэл</Text>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Банк:</Text>
                <Text style={styles.bankValue}>{bankInfo.bankName}</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Дансны дугаар:</Text>
                <Text style={styles.bankValue}>{bankInfo.accountNumber}</Text>
              </View>
              {bankInfo.accountName && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Нэр:</Text>
                  <Text style={styles.bankValue}>{bankInfo.accountName}</Text>
                </View>
              )}
            </Card>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Татах дүн</Text>
            <Input
              placeholder="Дүн оруулах"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              suffix="₮"
            />
          </View>

          {amount && parseFloat(amount) >= MIN_WITHDRAWAL_AMOUNT && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Татах дүн:</Text>
                <Text style={styles.summaryValue}>
                  {formatMoney(parseFloat(amount))}₮
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Үлдэх үлдэгдэл:</Text>
                <Text style={styles.summaryValueTotal}>
                  {formatMoney(availableBalance - parseFloat(amount))}₮
                </Text>
              </View>
            </Card>
          )}

          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>
              ℹ️ Татах хүсэлт админ баталгаажуулсны дараа таны данс руу 1-2 хоногт
              шилжүүлэгдэнө.
            </Text>
          </Card>

          <Button
            title="Татах хүсэлт илгээх"
            onPress={handleWithdraw}
            loading={loading}
            style={styles.withdrawButton}
            disabled={!amount || parseFloat(amount) < MIN_WITHDRAWAL_AMOUNT}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={!bankInfo?.bankName ? "Банкны мэдээлэл" : "Мөнгө татах"}
        message={
          !bankInfo?.bankName 
            ? 'Банкны мэдээллээ бүртгүүлээгүй байна. Профайл хэсэгт очиж нэмнэ үү'
            : `${formatMoney(parseFloat(amount || 0))}₮ татах хүсэлт илгээх үү?\n\nАдмин баталгаажуулсны дараа таны данс руу шилжүүлэгдэнэ.`
        }
        type={!bankInfo?.bankName ? "warning" : "info"}
        buttons={
          !bankInfo?.bankName 
            ? [
                { text: 'Болих', style: 'cancel' },
                { text: 'Профайл', onPress: () => navigation.navigate('Profile', { screen: 'ProfileMain' }) }
              ]
            : [
                { text: 'Болих', style: 'cancel' },
                { text: 'Илгээх', onPress: confirmWithdraw }
              ]
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
  },
  balanceCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bankCard: {
    marginBottom: 16,
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: COLORS.info + '10',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  withdrawButton: {
    marginBottom: 32,
  },
});

export default WithdrawScreen;