/**
 * Premium KYC Info Screen
 * Step 1: Personal Information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { submitPersonalInfo } from '../../services/kycService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

const KYCInfoScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.personalInfo?.firstName || '',
    lastName: user?.personalInfo?.lastName || '',
    registerNumber: user?.personalInfo?.registerNumber || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    address: user?.personalInfo?.address || '',
    bankName: user?.personalInfo?.bankInfo?.bankName || '',
    accountNumber: user?.personalInfo?.bankInfo?.accountNumber || '',
    accountName: user?.personalInfo?.bankInfo?.accountName || '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.registerNumber) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Овог, нэр, регистрийн дугаар заавал оруулна уу',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await submitPersonalInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        registerNumber: formData.registerNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        bankInfo: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: 'Хувийн мэдээлэл хадгалагдлаа',
        });
        updateUser(response.data.user);
        navigation.navigate('KYCDocuments');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: error.message || 'Мэдээлэл хадгалахад алдаа гарлаа',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>KYC Баталгаажуулалт</Text>
            <Text style={styles.headerSubtitle}>Алхам 1/2</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Card */}
          <Card variant="gradient" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressStep}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.progressCircle}
                >
                  <Icon name="checkmark" size={20} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.progressLabel}>Хувийн мэдээлэл</Text>
              </View>
              
              <View style={styles.progressLine} />
              
              <View style={styles.progressStep}>
                <View style={[styles.progressCircle, styles.progressCircleInactive]}>
                  <Icon name="document-outline" size={20} color={COLORS.textTertiary} />
                </View>
                <Text style={[styles.progressLabel, styles.progressLabelInactive]}>
                  Баримт бичиг
                </Text>
              </View>
            </View>
          </Card>

          {/* Info Card */}
          <Card variant="glass" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle" size={24} color={COLORS.info} />
              <Text style={styles.infoTitle}>Анхааруулга</Text>
            </View>
            <Text style={styles.infoText}>
              Таны хувийн мэдээлэл нууцлагдах бөгөөд зөвхөн зээл олгох зорилгоор ашиглагдана.
            </Text>
          </Card>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="person-outline" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Хувийн мэдээлэл</Text>
            </View>
            
            <Input
              label="Овог"
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              placeholder="Овог оруулах"
              icon="person-outline"
            />
            
            <Input
              label="Нэр"
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              placeholder="Нэр оруулах"
              icon="person-outline"
            />
            
            <Input
              label="Регистрийн дугаар"
              value={formData.registerNumber}
              onChangeText={(value) => handleChange('registerNumber', value)}
              placeholder="Регистрийн дугаар"
              maxLength={10}
              icon="card-outline"
            />
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="call-outline" size={22} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Холбоо барих</Text>
            </View>
            
            <Input
              label="Утасны дугаар"
              value={formData.phoneNumber}
              onChangeText={(value) => handleChange('phoneNumber', value)}
              placeholder="Утасны дугаар"
              keyboardType="phone-pad"
              icon="call-outline"
              editable={false}
            />
            
            <Input
              label="И-мэйл (заавал биш)"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="И-мэйл хаяг"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />
            
            <Input
              label="Хаяг"
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              placeholder="Гэрийн хаяг"
              multiline
              numberOfLines={2}
              icon="location-outline"
            />
          </View>

          {/* Bank Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="business-outline" size={22} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Банкны мэдээлэл</Text>
            </View>
            
            <Input
              label="Банкны нэр"
              value={formData.bankName}
              onChangeText={(value) => handleChange('bankName', value)}
              placeholder="Жишээ: Хаан банк"
              icon="business-outline"
            />
            
            <Input
              label="Дансны дугаар"
              value={formData.accountNumber}
              onChangeText={(value) => handleChange('accountNumber', value)}
              placeholder="Дансны дугаар"
              keyboardType="numeric"
              icon="card-outline"
            />
            
            <Input
              label="Дансны нэр (заавал биш)"
              value={formData.accountName}
              onChangeText={(value) => handleChange('accountName', value)}
              placeholder="Дансны эзэмшигчийн нэр"
              icon="person-outline"
            />
          </View>

          <Button
            title="Дараагийн алхам →"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </View>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  progressCard: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressCircleInactive: {
    backgroundColor: COLORS.glass,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressLabelInactive: {
    color: COLORS.textTertiary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    marginBottom: 32,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  submitButton: {
    marginBottom: 24,
  },
});

export default KYCInfoScreen;