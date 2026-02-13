/**
 * Withdraw Screen - Мөнгө татах
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/WithdrawScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { requestWithdrawal } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { MIN_WITHDRAWAL_AMOUNT } from '../../constants/config';
import { formatMoney } from '../../utils/formatters';

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { wallet, setWallet } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const bankInfo = user?.personalInfo?.bankInfo;
  const availableBalance = wallet?.availableBalance || 0;

  const handleWithdraw = async () => {
    if (!bankInfo?.bankName || !bankInfo?.accountNumber) {
      Alert.alert(
        'Банкны мэдээлэл',
        'Банкны мэдээллээ бүртгүүлээгүй байна. Профайл хэсэгт очиж нэмнэ үү',
        [
          { text: 'Болих', style: 'cancel' },
          {
            text: 'Профайл',
            onPress: () =>
              navigation.navigate('Profile', { screen: 'ProfileMain' }),
          },
        ]
      );
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

    Alert.alert(
      'Мөнгө татах',
      `${formatMoney(parseFloat(amount))}₮ татах хүсэлт илгээх үү?\n\nАдмин баталгаажуулсны дараа таны данс руу шилжүүлэгдэнэ.`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Илгээх',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
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