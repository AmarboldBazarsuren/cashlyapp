/**
 * KYC Info Screen - Хувийн мэдээлэл оруулах
 * БАЙРШИЛ: Cashly.mn/App/src/screens/kyc/KYCInfoScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { COLORS } from '../../constants/colors';
import { EDUCATION_LEVELS, EMPLOYMENT_STATUS, BANKS } from '../../constants/config';

const KYCInfoScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    education: '',
    employmentStatus: '',
    companyName: '',
    position: '',
    monthlyIncome: '',
    city: 'Улаанбаатар',
    district: '',
    khoroo: '',
    building: '',
    apartment: '',
    fullAddress: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    emergencyContact1Name: '',
    emergencyContact1Relationship: '',
    emergencyContact1Phone: '',
    emergencyContact2Name: '',
    emergencyContact2Relationship: '',
    emergencyContact2Phone: '',
    registerNumber: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.education || !formData.employmentStatus) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Боловсрол болон ажил эрхлэлтээ сонгоно уу',
      });
      return false;
    }

    if (!formData.district || !formData.fullAddress) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Хаягийн мэдээллээ бөглөнө үү',
      });
      return false;
    }

    if (!formData.bankName || !formData.accountNumber) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Банкны мэдээллээ бөглөнө үү',
      });
      return false;
    }

    if (!formData.emergencyContact1Name || !formData.emergencyContact1Phone) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Холбоо барих хүний мэдээллийг бөглөнө үү',
      });
      return false;
    }

    if (formData.emergencyContact1Phone.length !== 8) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Утасны дугаар 8 оронтой байх ёстой',
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigation.navigate('KYCDocuments', { formData });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Боловсрол */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Боловсрол</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.education}
              onValueChange={(value) => updateField('education', value)}
              style={styles.picker}
            >
              <Picker.Item label="Сонгоно уу" value="" />
              {EDUCATION_LEVELS.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Ажил эрхлэлт */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ажил эрхлэлт</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.employmentStatus}
              onValueChange={(value) => updateField('employmentStatus', value)}
              style={styles.picker}
            >
              <Picker.Item label="Сонгоно уу" value="" />
              {EMPLOYMENT_STATUS.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>

          {formData.employmentStatus === 'Ажилтай' && (
            <>
              <Input
                label="Байгууллагын нэр"
                placeholder="Байгууллага"
                value={formData.companyName}
                onChangeText={(value) => updateField('companyName', value)}
              />
              <Input
                label="Албан тушаал"
                placeholder="Албан тушаал"
                value={formData.position}
                onChangeText={(value) => updateField('position', value)}
              />
              <Input
                label="Сарын орлого (₮)"
                placeholder="1000000"
                value={formData.monthlyIncome}
                onChangeText={(value) => updateField('monthlyIncome', value)}
                keyboardType="numeric"
              />
            </>
          )}
        </View>

        {/* Хаяг */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хаяг</Text>
          <Input
            label="Дүүрэг"
            placeholder="Дүүрэг"
            value={formData.district}
            onChangeText={(value) => updateField('district', value)}
          />
          <Input
            label="Хороо"
            placeholder="Хороо"
            value={formData.khoroo}
            onChangeText={(value) => updateField('khoroo', value)}
          />
          <Input
            label="Байр"
            placeholder="Байр"
            value={formData.building}
            onChangeText={(value) => updateField('building', value)}
          />
          <Input
            label="Тоот"
            placeholder="Тоот"
            value={formData.apartment}
            onChangeText={(value) => updateField('apartment', value)}
          />
          <Input
            label="Дэлгэрэнгүй хаяг"
            placeholder="Дэлгэрэнгүй хаяг"
            value={formData.fullAddress}
            onChangeText={(value) => updateField('fullAddress', value)}
            multiline
          />
        </View>

        {/* Банкны мэдээлэл */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Банкны мэдээлэл</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.bankName}
              onValueChange={(value) => updateField('bankName', value)}
              style={styles.picker}
            >
              <Picker.Item label="Банк сонгоно уу" value="" />
              {BANKS.map((bank) => (
                <Picker.Item key={bank} label={bank} value={bank} />
              ))}
            </Picker>
          </View>
          <Input
            label="Дансны дугаар"
            placeholder="1234567890"
            value={formData.accountNumber}
            onChangeText={(value) => updateField('accountNumber', value)}
            keyboardType="numeric"
          />
          <Input
            label="Данс эзэмшигчийн нэр"
            placeholder="Нэр"
            value={formData.accountName}
            onChangeText={(value) => updateField('accountName', value)}
          />
        </View>

        {/* Холбоо барих хүн 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Холбоо барих хүн 1</Text>
          <Input
            label="Нэр"
            placeholder="Нэр"
            value={formData.emergencyContact1Name}
            onChangeText={(value) => updateField('emergencyContact1Name', value)}
          />
          <Input
            label="Хамаарал"
            placeholder="Эх, эцэг, ах, эгч гэх мэт"
            value={formData.emergencyContact1Relationship}
            onChangeText={(value) =>
              updateField('emergencyContact1Relationship', value)
            }
          />
          <Input
            label="Утасны дугаар"
            placeholder="99119911"
            value={formData.emergencyContact1Phone}
            onChangeText={(value) => updateField('emergencyContact1Phone', value)}
            keyboardType="phone-pad"
            maxLength={8}
          />
        </View>

        {/* Холбоо барих хүн 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Холбоо барих хүн 2 (сонголттой)</Text>
          <Input
            label="Нэр"
            placeholder="Нэр"
            value={formData.emergencyContact2Name}
            onChangeText={(value) => updateField('emergencyContact2Name', value)}
          />
          <Input
            label="Хамаарал"
            placeholder="Хамаарал"
            value={formData.emergencyContact2Relationship}
            onChangeText={(value) =>
              updateField('emergencyContact2Relationship', value)
            }
          />
          <Input
            label="Утасны дугаар"
            placeholder="99119911"
            value={formData.emergencyContact2Phone}
            onChangeText={(value) => updateField('emergencyContact2Phone', value)}
            keyboardType="phone-pad"
            maxLength={8}
          />
        </View>

        {/* Регистр */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Регистрийн дугаар (сонголттой)</Text>
          <Input
            label="Регистр"
            placeholder="УБ12345678"
            value={formData.registerNumber}
            onChangeText={(value) => updateField('registerNumber', value.toUpperCase())}
            maxLength={10}
          />
        </View>

        <Button
          title="Үргэлжлүүлэх"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  nextButton: {
    marginVertical: 24,
  },
});

export default KYCInfoScreen;