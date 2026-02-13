/**
 * Extend Loan Screen - Зээл сунгах
 * БАЙРШИЛ: Cashly.mn/App/src/screens/loan/ExtendLoanScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getLoanDetails, extendLoan } from '../../services/loanService';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { COLORS } from '../../constants/colors';
import { formatMoney, formatDate } from '../../utils/formatters';
import { MAX_LOAN_EXTENSIONS } from '../../constants/config';

const ExtendLoanScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const { wallet } = useApp();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    loadLoanDetails();
  }, [loanId]);

  const loadLoanDetails = async () => {
    try {
      const response = await getLoanDetails(loanId);
      if (response.success) {
        setLoan(response.data.loan);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Зээлийн мэдээлэл татахад алдаа гарлаа',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!loan) return;

    const extensionFee = loan.interestAmount;

    if (wallet?.balance < extensionFee) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Хэтэвчний үлдэгдэл хүрэлцэхгүй байна',
      });
      return;
    }

    Alert.alert(
      'Зээл сунгах',
      `${formatMoney(extensionFee)}₮ төлж зээлээ сунгах уу?`,
      [
        { text: 'Болих', style: 'cancel' },
        {
          text: 'Сунгах',
          onPress: async () => {
            setExtending(true);
            try {
              const response = await extendLoan(loanId);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Амжилттай',
                  text2: response.message,
                });
                navigation.goBack();
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Алдаа',
                text2: error.message || 'Зээл сунгахад алдаа гарлаа',
              });
            } finally {
              setExtending(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!loan) {
    return null;
  }

  const extensionFee = loan.interestAmount;
  const newDueDate = new Date(loan.dueDate);
  newDueDate.setDate(newDueDate.getDate() + loan.term);
  const remainingExtensions = MAX_LOAN_EXTENSIONS - loan.extensionCount;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Зээл сунгах</Text>
        <Text style={styles.infoText}>
          Зээлийн сунгалт хийхэд үндсэн хүүг төлнө. Зээл сунгасан тохиолдолд
          дуусах огноо автоматаар сунгагдана.
        </Text>
      </Card>

      <Card style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Сунгалтын мэдээлэл</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Сунгалтын төлбөр:</Text>
          <Text style={styles.value}>{formatMoney(extensionFee)}₮</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Одоогийн дуусах огноо:</Text>
          <Text style={styles.value}>{formatDate(loan.dueDate)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Шинэ дуусах огноо:</Text>
          <Text style={[styles.value, { color: COLORS.success }]}>
            {formatDate(newDueDate)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Сунгасан тоо:</Text>
          <Text style={styles.value}>
            {loan.extensionCount} / {MAX_LOAN_EXTENSIONS}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Үлдсэн сунгалт:</Text>
          <Text style={styles.value}>{remainingExtensions} удаа</Text>
        </View>
      </Card>

      <Card style={styles.walletCard}>
        <Text style={styles.cardTitle}>Хэтэвчний үлдэгдэл</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Үлдэгдэл:</Text>
          <Text style={styles.value}>{formatMoney(wallet?.balance || 0)}₮</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Сунгалтын дараа:</Text>
          <Text style={styles.value}>
            {formatMoney((wallet?.balance || 0) - extensionFee)}₮
          </Text>
        </View>
      </Card>

      <Button
        title={`${formatMoney(extensionFee)}₮ төлж сунгах`}
        onPress={handleExtend}
        loading={extending}
        style={styles.extendButton}
        disabled={wallet?.balance < extensionFee}
      />

      {wallet?.balance < extensionFee && (
        <Text style={styles.warningText}>
          ⚠️ Хэтэвчний үлдэгдэл хүрэлцэхгүй байна
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: COLORS.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: 16,
  },
  walletCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  extendButton: {
    marginBottom: 16,
  },
  warningText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.danger,
    marginBottom: 32,
  },
});

export default ExtendLoanScreen;