/**
 * Deposit Screen - Цэнэглэх (test only)
 * БАЙРШИЛ: Cashly.mn/App/src/screens/wallet/DepositScreen.js
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
import { deposit } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { MIN_DEPOSIT_AMOUNT } from '../../constants/config';
import { formatMoney } from '../../utils/formatters';

const DepositScreen = ({ navigation }) => {
  const { wallet, setWallet } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10000, 50000, 100000, 500000];

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < MIN_DEPOSIT_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Хамгийн бага цэнэглэх дүн ${formatMoney(MIN_DEPOSIT_AMOUNT)}₮`,
      });
      return;
    }

    Alert.alert(
      'Цэнэглэх',
      `${formatMoney(parseFloat(amount))}₮ цэнэглэх үү?\n\n⚠️ Энэ нь test цэнэглэлт. Production дээр төлбөрийн системтэй холбогдоно.`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Цэнэглэх',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await deposit(
                parseFloat(amount),
                'admin',
                'TEST_' + Date.now()
              );

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
                text2: error.message || 'Цэнэглэлт хийхэд алдаа гарлаа',
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
        <Text style={styles.balanceLabel}>Одоогийн үлдэгдэл</Text>
        <Text style={styles.balanceAmount}>
          {formatMoney(wallet?.balance || 0)}₮
        </Text>
      </Card>

      <Card style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Анхааруулга</Text>
        <Text style={styles.warningText}>
          Энэ нь test цэнэглэлт функц юм. Production дээр төлбөрийн системтэй
          (QPay, Social Pay гэх мэт) холбогдоно.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.label}>Цэнэглэх дүн</Text>
        <Input
          placeholder="Дүн оруулах"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          suffix="₮"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Түргэн сонголт</Text>
        <View style={styles.quickAmounts}>
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              title={formatMoney(quickAmount) + '₮'}
              onPress={() => setAmount(quickAmount.toString())}
              variant="outline"
              style={styles.quickButton}
            />
          ))}
        </View>
      </View>

      {amount && parseFloat(amount) >= MIN_DEPOSIT_AMOUNT && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Цэнэглэх дүн:</Text>
            <Text style={styles.summaryValue}>
              {formatMoney(parseFloat(amount))}₮
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Шинэ үлдэгдэл:</Text>
            <Text style={styles.summaryValueTotal}>
              {formatMoney((wallet?.balance || 0) + parseFloat(amount))}₮
            </Text>
          </View>
        </Card>
      )}

      <Button
        title="Цэнэглэх"
        onPress={handleDeposit}
        loading={loading}
        style={styles.depositButton}
        disabled={!amount || parseFloat(amount) < MIN_DEPOSIT_AMOUNT}
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
  warningCard: {
    marginBottom: 16,
    backgroundColor: COLORS.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickButton: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
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
  depositButton: {
    marginBottom: 32,
  },
});

export default DepositScreen;