/**
 * Premium KYC Documents Screen
 * Step 2: Upload Documents
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { uploadDocument, submitKYC } from '../../services/kycService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import CustomAlert from '../../components/common/CustomAlert';
import { COLORS } from '../../constants/colors';

const KYCDocumentsScreen = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [documents, setDocuments] = useState({
    idCardFront: null,
    idCardBack: null,
    selfie: null,
  });

  const pickImage = async (type) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: 'error',
          text1: 'Зөвшөөрөл хэрэгтэй',
          text2: 'Зургийн сан руу нэвтрэх эрх олгоно уу',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'selfie' ? [3, 4] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadImage(type, result.assets[0]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: 'Зураг сонгоход алдаа гарлаа',
      });
    }
  };

  const uploadImage = async (type, asset) => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `${type}_${Date.now()}.jpg`,
      });
      formData.append('documentType', type);

      const response = await uploadDocument(formData);
      
      if (response.success) {
        setDocuments((prev) => ({
          ...prev,
          [type]: response.data.url,
        }));
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: 'Зураг байршуулагдлаа',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Алдаа',
        text2: error.message || 'Зураг байршуулахад алдаа гарлаа',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = () => {
    if (!documents.idCardFront || !documents.idCardBack || !documents.selfie) {
      Toast.show({
        type: 'error',
        text1: 'Анхааруулга',
        text2: 'Бүх баримт бичгийг байршуулна уу',
      });
      return;
    }

    setAlertVisible(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const response = await submitKYC(documents);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Амжилттай',
          text2: 'KYC хүсэлт илгээгдлээ. Админ баталгаажуулах болно.',
        });
        updateUser(response.data.user);
        navigation.navigate('Home');
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

  const documentTypes = [
    {
      key: 'idCardFront',
      title: 'Иргэний үнэмлэх (урд тал)',
      icon: 'card-outline',
      color: COLORS.primary,
    },
    {
      key: 'idCardBack',
      title: 'Иргэний үнэмлэх (ард тал)',
      icon: 'card-outline',
      color: COLORS.info,
    },
    {
      key: 'selfie',
      title: 'Селфи зураг',
      icon: 'camera-outline',
      color: COLORS.success,
    },
  ];

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
            <Text style={styles.headerTitle}>Баримт бичиг</Text>
            <Text style={styles.headerSubtitle}>Алхам 2/2</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <Card variant="gradient" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressStep}>
                <LinearGradient
                  colors={[COLORS.success, COLORS.successLight]}
                  style={styles.progressCircle}
                >
                  <Icon name="checkmark" size={20} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.progressLabel}>Хувийн мэдээлэл</Text>
              </View>
              
              <View style={[styles.progressLine, styles.progressLineActive]} />
              
              <View style={styles.progressStep}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  style={styles.progressCircle}
                >
                  <Icon name="document-text" size={20} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.progressLabel}>Баримт бичиг</Text>
              </View>
            </View>
          </Card>

          {/* Info Card */}
          <Card variant="glass" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="shield-checkmark" size={24} color={COLORS.success} />
              <Text style={styles.infoTitle}>Нууцлал</Text>
            </View>
            <Text style={styles.infoText}>
              Таны баримт бичиг аюулгүй хадгалагдах бөгөөд зөвхөн таныг таних зорилгоор ашиглагдана.
            </Text>
          </Card>

          {/* Document Upload Cards */}
          {documentTypes.map((docType) => (
            <Card key={docType.key} variant="glass" style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentHeaderLeft}>
                  <View style={[
                    styles.documentIcon,
                    { backgroundColor: docType.color + '20' }
                  ]}>
                    <Icon name={docType.icon} size={24} color={docType.color} />
                  </View>
                  <View>
                    <Text style={styles.documentTitle}>{docType.title}</Text>
                    {documents[docType.key] && (
                      <View style={styles.uploadedBadge}>
                        <Icon name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.uploadedText}>Байршуулсан</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {documents[docType.key] ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: documents[docType.key] }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => pickImage(docType.key)}
                  >
                    <LinearGradient
                      colors={[COLORS.info, COLORS.infoLight]}
                      style={styles.changeButtonGradient}
                    >
                      <Icon name="refresh" size={18} color={COLORS.white} />
                      <Text style={styles.changeButtonText}>Солих</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={() => pickImage(docType.key)}
                  disabled={uploading === docType.key}
                >
                  {uploading === docType.key ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  ) : (
                    <>
                      <LinearGradient
                        colors={[docType.color + '20', docType.color + '10']}
                        style={styles.uploadIconContainer}
                      >
                        <Icon name="cloud-upload-outline" size={40} color={docType.color} />
                      </LinearGradient>
                      <Text style={styles.uploadText}>Зураг сонгох</Text>
                      <Text style={styles.uploadSubtext}>Та энд дарж зураг сонгоно уу</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </Card>
          ))}

          <Button
            title="Илгээх"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            disabled={!documents.idCardFront || !documents.idCardBack || !documents.selfie}
          />
        </ScrollView>
      </View>

      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="KYC хүсэлт илгээх"
        message="Та бүх мэдээллээ шалгаад илгээхдээ итгэлтэй байна уу? Админ баталгаажуулах болно."
        type="info"
        buttons={[
          { text: 'Буцах', style: 'cancel' },
          { text: 'Илгээх', onPress: confirmSubmit }
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
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    marginBottom: 32,
  },
  progressLineActive: {
    backgroundColor: COLORS.success,
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
  documentCard: {
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 6,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default KYCDocumentsScreen;