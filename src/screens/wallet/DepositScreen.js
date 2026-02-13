/**
 * Premium Deposit Screen - FIXED
 * SafeAreaView, KeyboardAvoidingView, CustomAlert
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { deposit } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';
import { MIN_DEPOSIT_AMOUNT } from '../../constants/config';
import { formatMoney } from '../../utils/formatters';

const DepositScreen = ({ navigation }) => {
  const { wallet, setWallet } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const quickAmounts = [10000, 50000, 100000, 500000];

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) < MIN_DEPOSIT_AMOUNT) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: `Хамгийн бага цэнэглэх дүн ${formatMoney(MIN_DEPOSIT_AMOUNT)}₮`,
      });
      return;
    }

    setAlertVisible(true);
  };

  const confirmDeposit = async () => {
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
          <Text style={styles.headerTitle}>Цэнэглэх</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance Card */}
          <LinearGradient
            colors={[COLORS.success, COLORS.successLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceCardInner}>
              <Icon name="wallet" size={32} color={COLORS.white} />
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Одоогийн үлдэгдэл</Text>
                <Text style={styles.balanceAmount}>
                  {formatMoney(wallet?.balance || 0)}₮
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Warning Card */}
          <Card variant="glass" style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Icon name="information-circle" size={24} color={COLORS.warning} />
              <Text style={styles.warningTitle}>Анхааруулга</Text>
            </View>
            <Text style={styles.warningText}>
              Энэ нь test цэнэглэлт функц юм. Production дээр төлбөрийн системтэй холбогдоно.
            </Text>
          </Card>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Цэнэглэх дүн</Text>
            <Input
              placeholder="Дүн оруулах"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              suffix="₮"
            />
          </View>

          {/* Quick Amounts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Түргэн сонголт</Text>
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount.toString())}
                  activeOpacity={0.7}
                  style={styles.quickAmountWrapper}
                >
                  <LinearGradient
                    colors={[COLORS.glass, COLORS.glassHighlight]}
                    style={styles.quickAmountButton}
                  >
                    <Text style={styles.quickAmountText}>
                      {formatMoney(quickAmount)}₮
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Summary */}
          {amount && parseFloat(amount) >= MIN_DEPOSIT_AMOUNT && (
            <Card variant="gradient" style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Нэгтгэл</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Цэнэглэх дүн:</Text>
                <Text style={styles.summaryValue}>
                  {formatMoney(parseFloat(amount))}₮
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Шинэ үлдэгдэл:</Text>
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
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Цэнэглэх"
        message={`${formatMoney(parseFloat(amount || 0))}₮ цэнэглэх үү?\n\nЭнэ нь test цэнэглэлт.`}
        type="info"
        buttons={[
          { text: 'Болих', style: 'cancel' },
          { text: 'Цэнэглэх', onPress: confirmDeposit }
        ]}
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
    padding: 20,
    paddingBottom: 150,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceContent: {
    marginLeft: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  warningCard: {
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAmountWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  quickAmountButton: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.success,
  },
  depositButton: {
    marginBottom: 24,
  },
});

export default DepositScreen;