/**
 * KYC Documents Screen - Баримт бичиг upload
 * БАЙРШИЛ: Cashly.mn/App/src/screens/kyc/KYCDocumentsScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { submitKYC } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants/colors';

const KYCDocumentsScreen = ({ route, navigation }) => {
  const { formData } = route.params;
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [documents, setDocuments] = useState({
    idCardFront: null,
    idCardBack: null,
    selfie: null,
  });

  const pickImage = (type) => {
    Alert.alert('Зураг сонгох', 'Зураг хаанаас сонгох вэ?', [
      {
        text: 'Камер',
        onPress: () => takePhoto(type),
      },
      {
        text: 'Зургийн сан',
        onPress: () => chooseFromLibrary(type),
      },
      {
        text: 'Болих',
        style: 'cancel',
      },
    ]);
  };

  const takePhoto = async (type) => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });

    if (result.assets && result.assets[0]) {
      setDocuments({
        ...documents,
        [type]: result.assets[0],
      });
    }
  };

  const chooseFromLibrary = async (type) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });

    if (result.assets && result.assets[0]) {
      setDocuments({
        ...documents,
        [type]: result.assets[0],
      });
    }
  };

  const handleSubmit = async () => {
    if (!documents.idCardFront || !documents.idCardBack || !documents.selfie) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Бүх зургийг оруулна уу',
      });
      return;
    }

    setLoading(true);

    try {
      const kycData = {
        ...formData,
        emergencyContacts: [
          {
            name: formData.emergencyContact1Name,
            relationship: formData.emergencyContact1Relationship,
            phoneNumber: formData.emergencyContact1Phone,
          },
        ],
        idCardFrontBase64: `data:image/jpeg;base64,${documents.idCardFront.base64}`,
        idCardBackBase64: `data:image/jpeg;base64,${documents.idCardBack.base64}`,
        selfieBase64: `data:image/jpeg;base64,${documents.selfie.base64}`,
      };

      // Холбоо барих хүн 2 байвал нэмэх
      if (formData.emergencyContact2Name) {
        kycData.emergencyContacts.push({
          name: formData.emergencyContact2Name,
          relationship: formData.emergencyContact2Relationship,
          phoneNumber: formData.emergencyContact2Phone,
        });
      }

      const response = await submitKYC(kycData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: response.message,
        });

        // User мэдээлэл шинэчлэх
        updateUser({ kycStatus: 'pending' });

        // Home screen руу буцах
        navigation.navigate('HomeMain');
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

  const renderImagePicker = (type, label, icon) => {
    return (
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => pickImage(type)}
      >
        {documents[type] ? (
          <Image
            source={{ uri: documents[type].uri }}
            style={styles.previewImage}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name={icon} size={48} color={COLORS.primary} />
            <Text style={styles.placeholderText}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Баримт бичиг</Text>
        <Text style={styles.subtitle}>
          Иргэний үнэмлэхний урд, ард болон селфи зургаа оруулна уу
        </Text>
      </View>

      <View style={styles.documents}>
        {renderImagePicker('idCardFront', 'Үнэмлэхний урд тал', 'card-outline')}
        {renderImagePicker('idCardBack', 'Үнэмлэхний ард тал', 'card-outline')}
        {renderImagePicker('selfie', 'Таны селфи зураг', 'person-circle-outline')}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>⚠️ Анхааруулга:</Text>
        <Text style={styles.tipText}>• Зураг тод харагдах ёстой</Text>
        <Text style={styles.tipText}>• Бүх мэдээлэл унших боломжтой байх</Text>
        <Text style={styles.tipText}>• Селфи зургаа царайтай авна уу</Text>
      </View>

      <Button
        title="Илгээх"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  documents: {
    padding: 16,
  },
  imagePicker: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tips: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  submitButton: {
    margin: 16,
    marginBottom: 32,
  },
});

export default KYCDocumentsScreen;