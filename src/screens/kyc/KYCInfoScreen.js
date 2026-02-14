/**
 * KYCInfoScreen.js - COMPLETE MULTI-STEP VERSION
 * ✅ 7 алхамтай форм (step бүрт validation)
 * ✅ Дараагийн/Өмнөх товч
 * ✅ Сүүлийн алхам: "Мэдээлэл илгээх"
 * ✅ Navigation warning
 * ✅ Status: not_submitted → pending
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, TextInput, KeyboardAvoidingView, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { submitPersonalInfo, uploadDocument, submitKYC } from '../../services/kycService';
import { COLORS } from '../../constants/colors';
import { BANKS, EDUCATION_LEVELS, EMPLOYMENT_STATUS } from '../../constants/config';

const MONGOLIAN_LETTERS = [
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М',
  'Н', 'О', 'Ө', 'П', 'Р', 'С', 'Т', 'У', 'Ү', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
];

const STEPS = [
  { id: 'personal', title: 'Хувийн', icon: 'person-outline' },
  { id: 'employment', title: 'Ажил', icon: 'briefcase-outline' },
  { id: 'income', title: 'Орлого', icon: 'cash-outline' },
  { id: 'bank', title: 'Банк', icon: 'card-outline' },
  { id: 'address', title: 'Хаяг', icon: 'location-outline' },
  { id: 'emergency', title: 'Холбоо', icon: 'call-outline' },
  { id: 'documents', title: 'Баримт', icon: 'document-text-outline' },
];

const GENDERS = ['Эрэгтэй', 'Эмэгтэй', 'Бусад'];

export default function KYCInfoScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);

  const [formData, setFormData] = useState({
    lastName: user?.personalInfo?.lastName || '',
    firstName: user?.personalInfo?.firstName || '',
    registerLetter1: user?.personalInfo?.registerNumber?.substring(0, 1) || '',
    registerLetter2: user?.personalInfo?.registerNumber?.substring(1, 2) || '',
    registerNumber: user?.personalInfo?.registerNumber?.substring(2) || '',
    gender: user?.personalInfo?.gender || '',
    birthDate: user?.personalInfo?.birthDate || '',
    education: user?.personalInfo?.education || '',
    employmentStatus: user?.personalInfo?.employment?.status || '',
    companyName: user?.personalInfo?.employment?.companyName || '',
    position: user?.personalInfo?.employment?.position || '',
    monthlyIncome: user?.personalInfo?.employment?.monthlyIncome?.toString() || '',
    bankName: user?.personalInfo?.bankInfo?.bankName || '',
    accountNumber: user?.personalInfo?.bankInfo?.accountNumber || '',
    accountName: user?.personalInfo?.bankInfo?.accountName || '',
    city: user?.personalInfo?.address?.city || '',
    district: user?.personalInfo?.address?.district || '',
    khoroo: user?.personalInfo?.address?.khoroo || '',
    building: user?.personalInfo?.address?.building || '',
    apartment: user?.personalInfo?.address?.apartment || '',
    fullAddress: user?.personalInfo?.address?.fullAddress || '',
    emergencyName: user?.personalInfo?.emergencyContacts?.[0]?.name || '',
    emergencyRelationship: user?.personalInfo?.emergencyContacts?.[0]?.relationship || '',
    emergencyPhone: user?.personalInfo?.emergencyContacts?.[0]?.phoneNumber || '',
    idCardFront: null,
    idCardBack: null,
    selfie: null,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      Alert.alert(
        'Хадгалаагүй өөрчлөлт',
        'Таны оруулсан мэдээлэл хадгалагдаагүй байна. Гарах уу?',
        [
          { text: 'Үргэлжлүүлэх', style: 'cancel' },
          { text: 'Гарах', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const selectLetter = (position, letter) => {
    handleInputChange(position === 1 ? 'registerLetter1' : 'registerLetter2', letter);
    setShowLetterModal(null);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('birthDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  const pickImage = async (type) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: 'error', text1: 'Зөвшөөрөл хэрэгтэй' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'selfie' ? [3, 4] : [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      handleInputChange(type, result.assets[0].uri);
    }
  };

  // ✅ VALIDATION - Алхам бүрийн бөглөсөн эсэхийг шалгах
  const isStepValid = (stepId) => {
    switch (stepId) {
      case 'personal':
        return formData.lastName && formData.firstName && formData.registerLetter1 && formData.registerLetter2 && formData.registerNumber.length === 8 && formData.gender && formData.birthDate;
      case 'employment':
        return formData.education && formData.employmentStatus;
      case 'income':
        return formData.monthlyIncome && parseFloat(formData.monthlyIncome) > 0;
      case 'bank':
        return formData.bankName && formData.accountNumber && formData.accountName;
      case 'address':
        return formData.city && formData.district;
      case 'emergency':
        return formData.emergencyName && formData.emergencyPhone && formData.emergencyPhone.length === 8;
      case 'documents':
        return formData.idCardFront && formData.idCardBack && formData.selfie;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStepIndex < STEPS.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // ✅ Бүх алхам бөглөгдсөн эсэхийг шалгах
    for (let i = 0; i < STEPS.length; i++) {
      if (!isStepValid(STEPS[i].id)) {
        Toast.show({ type: 'error', text1: `"${STEPS[i].title}" алхамыг бөглөнө үү` });
        setActiveStepIndex(i);
        return;
      }
    }

    setLoading(true);
    try {
      // Step 1: Хувийн мэдээлэл илгээх (зургагүйгээр)
      const personalInfoPayload = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        registerLetter1: formData.registerLetter1,
        registerLetter2: formData.registerLetter2,
        registerNumber: formData.registerNumber,
        gender: formData.gender,
        birthDate: formData.birthDate,
        education: formData.education,
        employmentStatus: formData.employmentStatus,
        companyName: formData.companyName,
        position: formData.position,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        city: formData.city,
        district: formData.district,
        khoroo: formData.khoroo,
        building: formData.building,
        apartment: formData.apartment,
        fullAddress: formData.fullAddress,
        emergencyName: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
      };

      const res1 = await submitPersonalInfo(personalInfoPayload);
      if (!res1.success) {
        Toast.show({ type: 'error', text1: 'Алдаа', text2: res1.message });
        setLoading(false);
        return;
      }

      // Step 2: Зургуудыг upload хийх
      console.log('📤 Starting image uploads...');
      
      const idFrontRes = await uploadDocument('idCardFront', formData.idCardFront);
      console.log('📸 ID Front Response:', JSON.stringify(idFrontRes, null, 2));
      
      const idBackRes = await uploadDocument('idCardBack', formData.idCardBack);
      console.log('📸 ID Back Response:', JSON.stringify(idBackRes, null, 2));
      
      const selfieRes = await uploadDocument('selfie', formData.selfie);
      console.log('📸 Selfie Response:', JSON.stringify(selfieRes, null, 2));

      // ✅ URL гаргах (axios interceptor response.data буцаадаг)
      const idFrontUrl = idFrontRes?.data?.url;
      const idBackUrl = idBackRes?.data?.url;
      const selfieUrl = selfieRes?.data?.url;

      console.log('📋 Extracted URLs:', { idFrontUrl, idBackUrl, selfieUrl });

      // Validation: Бүх зураг URL байгаа эсэхийг шалгах
      if (!idFrontUrl || !idBackUrl || !selfieUrl) {
        console.error('❌ Missing URLs:', { idFrontUrl, idBackUrl, selfieUrl });
        Toast.show({ type: 'error', text1: 'Зураг upload хийгдээгүй байна' });
        setLoading(false);
        return;
      }

      // Step 3: KYC илгээх (зургууд хамт)
      const kycPayload = {
        idCardFront: idFrontUrl,
        idCardBack: idBackUrl,
        selfie: selfieUrl,
      };

      console.log('📤 Submitting KYC payload:', kycPayload);
      console.log('📤 Payload type:', typeof kycPayload);
      console.log('📤 Payload keys:', Object.keys(kycPayload));
      console.log('📤 Payload values:', Object.values(kycPayload));

      const res2 = await submitKYC(kycPayload);
      console.log('✅ submitKYC response:', res2);

      if (res2.success) {
        Toast.show({ type: 'success', text1: 'Амжилттай илгээгдлээ!' });
        updateUser({ ...user, kycStatus: 'pending' });
        setHasUnsavedChanges(false);
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Алдаа', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const step = STEPS[activeStepIndex];
    switch (step.id) {
      case 'personal':
        return (
          <>
            <FieldRow label="Овог *" value={formData.lastName} onChangeText={(v) => handleInputChange('lastName', v)} />
            <FieldRow label="Нэр *" value={formData.firstName} onChangeText={(v) => handleInputChange('firstName', v)} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Регистр *</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.letterBtn} onPress={() => setShowLetterModal('first')}>
                  <Text style={styles.letterBtnText}>{formData.registerLetter1 || 'А'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.letterBtn} onPress={() => setShowLetterModal('second')}>
                  <Text style={styles.letterBtnText}>{formData.registerLetter2 || 'А'}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.registerInput}
                  placeholder="12345678"
                  placeholderTextColor="#bbb"
                  value={formData.registerNumber}
                  onChangeText={(v) => handleInputChange('registerNumber', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={8}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowGenderModal(true)}>
              <Text style={styles.fieldLabel}>Хүйс *</Text>
              <View style={styles.fieldInputWrap}>
                <Text style={styles.fieldInput}>{formData.gender || 'Сонгох'}</Text>
                <Ionicons name="chevron-down" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.fieldLabel}>Төрсөн огноо *</Text>
              <View style={styles.fieldInputWrap}>
                <Text style={styles.fieldInput}>{formData.birthDate || 'YYYY-MM-DD'}</Text>
                <Ionicons name="calendar-outline" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </>
        );

      case 'employment':
        return (
          <>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowEducationModal(true)}>
              <Text style={styles.fieldLabel}>Боловсрол *</Text>
              <View style={styles.fieldInputWrap}>
                <Text style={styles.fieldInput}>{formData.education || 'Сонгох'}</Text>
                <Ionicons name="chevron-down" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowEmploymentModal(true)}>
              <Text style={styles.fieldLabel}>Ажлын байдал *</Text>
              <View style={styles.fieldInputWrap}>
                <Text style={styles.fieldInput}>{formData.employmentStatus || 'Сонгох'}</Text>
                <Ionicons name="chevron-down" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
            <FieldRow label="Компани" value={formData.companyName} onChangeText={(v) => handleInputChange('companyName', v)} />
            <FieldRow label="Албан тушаал" value={formData.position} onChangeText={(v) => handleInputChange('position', v)} />
          </>
        );

      case 'income':
        return <FieldRow label="Сарын орлого (₮) *" value={formData.monthlyIncome} onChangeText={(v) => handleInputChange('monthlyIncome', v)} keyboardType="numeric" />;

      case 'bank':
        return (
          <>
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowBankModal(true)}>
              <Text style={styles.fieldLabel}>Банк *</Text>
              <View style={styles.fieldInputWrap}>
                <Text style={styles.fieldInput}>{formData.bankName || 'Сонгох'}</Text>
                <Ionicons name="chevron-down" size={16} color="#ccc" />
              </View>
            </TouchableOpacity>
            <FieldRow label="Дансны дугаар *" value={formData.accountNumber} onChangeText={(v) => handleInputChange('accountNumber', v)} />
            <FieldRow label="Дансны нэр *" value={formData.accountName} onChangeText={(v) => handleInputChange('accountName', v)} />
          </>
        );

      case 'address':
        return (
          <>
            <FieldRow label="Хот *" value={formData.city} onChangeText={(v) => handleInputChange('city', v)} />
            <FieldRow label="Дүүрэг *" value={formData.district} onChangeText={(v) => handleInputChange('district', v)} />
            <FieldRow label="Хороо" value={formData.khoroo} onChangeText={(v) => handleInputChange('khoroo', v)} />
            <FieldRow label="Байр" value={formData.building} onChangeText={(v) => handleInputChange('building', v)} />
            <FieldRow label="Тоот" value={formData.apartment} onChangeText={(v) => handleInputChange('apartment', v)} />
            <FieldRow label="Бүтэн хаяг" value={formData.fullAddress} onChangeText={(v) => handleInputChange('fullAddress', v)} multiline />
          </>
        );

      case 'emergency':
        return (
          <>
            <FieldRow label="Нэр *" value={formData.emergencyName} onChangeText={(v) => handleInputChange('emergencyName', v)} />
            <FieldRow label="Хамаарал" value={formData.emergencyRelationship} onChangeText={(v) => handleInputChange('emergencyRelationship', v)} />
            <FieldRow label="Утас (8 орон) *" value={formData.emergencyPhone} onChangeText={(v) => handleInputChange('emergencyPhone', v.replace(/[^0-9]/g, ''))} keyboardType="phone-pad" maxLength={8} />
          </>
        );

      case 'documents':
        return (
          <>
            {[
              { key: 'idCardFront', label: 'Иргэний үнэмлэх (урд) *' },
              { key: 'idCardBack', label: 'Иргэний үнэмлэх (ард) *' },
              { key: 'selfie', label: 'Селфи зураг *' },
            ].map((doc) => (
              <TouchableOpacity key={doc.key} style={styles.uploadBtn} onPress={() => pickImage(doc.key)}>
                <Ionicons name={formData[doc.key] ? 'checkmark-circle' : 'cloud-upload-outline'} size={20} color={formData[doc.key] ? '#10B981' : '#999'} />
                <Text style={styles.uploadBtnText}>{formData[doc.key] ? `✓ ${doc.label}` : doc.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  const currentStepValid = isStepValid(STEPS[activeStepIndex].id);
  const isLastStep = activeStepIndex === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Мэдээлэл</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Steps */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepChip, activeStepIndex === i && styles.stepChipActive]}
                onPress={() => setActiveStepIndex(i)}
              >
                <Ionicons name={step.icon} size={14} color={activeStepIndex === i ? '#fff' : '#999'} />
                <Text style={[styles.stepChipText, activeStepIndex === i && { color: '#fff' }]}>{step.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.mainCard}>
            {renderContent()}

            {/* Navigation Buttons */}
            <View style={styles.navRow}>
              {activeStepIndex > 0 && (
                <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
                  <Text style={styles.navBtnText}>Өмнөх</Text>
                </TouchableOpacity>
              )}

              {!isLastStep ? (
                <TouchableOpacity
                  style={[styles.navBtn, styles.navBtnPrimary, !currentStepValid && styles.navBtnDisabled]}
                  onPress={handleNext}
                  disabled={!currentStepValid}
                >
                  <LinearGradient colors={currentStepValid ? ['#6C63FF', '#4ECDC4'] : ['#ddd', '#ccc']} style={styles.navBtnGradient}>
                    <Text style={styles.navBtnTextPrimary}>Дараагийн</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navBtn, styles.navBtnPrimary, (!currentStepValid || loading) && styles.navBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!currentStepValid || loading}
                >
                  <LinearGradient colors={currentStepValid && !loading ? ['#6C63FF', '#4ECDC4'] : ['#ddd', '#ccc']} style={styles.navBtnGradient}>
                    <Text style={styles.navBtnTextPrimary}>{loading ? 'Илгээж байна...' : 'Мэдээлэл илгээх'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SelectModal visible={showLetterModal !== null} title="Үсэг сонгох" items={MONGOLIAN_LETTERS} onSelect={(item) => selectLetter(showLetterModal === 'first' ? 1 : 2, item)} onClose={() => setShowLetterModal(null)} />
      <SelectModal visible={showGenderModal} title="Хүйс сонгох" items={GENDERS} onSelect={(item) => { handleInputChange('gender', item); setShowGenderModal(false); }} onClose={() => setShowGenderModal(false)} />
      <SelectModal visible={showBankModal} title="Банк сонгох" items={BANKS} onSelect={(item) => { handleInputChange('bankName', item); setShowBankModal(false); }} onClose={() => setShowBankModal(false)} />
      <SelectModal visible={showEducationModal} title="Боловсрол сонгох" items={EDUCATION_LEVELS} onSelect={(item) => { handleInputChange('education', item); setShowEducationModal(false); }} onClose={() => setShowEducationModal(false)} />
      <SelectModal visible={showEmploymentModal} title="Ажлын байдал" items={EMPLOYMENT_STATUS} onSelect={(item) => { handleInputChange('employmentStatus', item); setShowEmploymentModal(false); }} onClose={() => setShowEmploymentModal(false)} />
    </SafeAreaView>
  );
}

const FieldRow = ({ label, value, onChangeText, keyboardType, maxLength, multiline }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
      placeholder={label}
      placeholderTextColor="#bbb"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      multiline={multiline}
    />
  </View>
);

const SelectModal = ({ visible, title, items, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalScroll}>
          {items.map((item) => (
            <TouchableOpacity key={item} style={styles.modalItem} onPress={() => onSelect(item)}>
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f6fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  stepsRow: { marginBottom: 16 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', marginRight: 6 },
  stepChipActive: { backgroundColor: '#6C63FF' },
  stepChipText: { fontSize: 11, color: '#999', fontWeight: '600' },
  mainCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  fieldRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  fieldLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6 },
  fieldInput: { fontSize: 15, color: '#1a1a2e', fontWeight: '500', paddingVertical: 2 },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  letterBtn: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  letterBtnText: { fontSize: 20, fontWeight: '700', color: '#333' },
  registerInput: { flex: 1, height: 50, borderRadius: 10, backgroundColor: '#f0f0f0', paddingHorizontal: 12, fontSize: 15, fontWeight: '500' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  navBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  navBtnPrimary: { flex: 2 },
  navBtnDisabled: { opacity: 0.5 },
  navBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#6C63FF', textAlign: 'center', paddingVertical: 16 },
  navBtnTextPrimary: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  modalScroll: { maxHeight: 400 },
  modalItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalItemText: { fontSize: 15, color: '#333' },
});