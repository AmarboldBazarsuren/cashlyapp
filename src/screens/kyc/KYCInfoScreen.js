/**
 * KYC Info Screen - REDESIGNED
 * 3 дахь зураг шиг гоё profile completion + detail panel design
 * 
 * ЗАСВАРУУД:
 * 1. Emoji харагдахгүй → react-native-vector-icons/Ionicons ашиглах
 * 2. SafeAreaView + paddingTop зөв тохируулсан (цаг/battery/сүлжээний доор харагдана)
 * 3. Design 3 дахь зураг шиг болгосон - card-based step completion UI
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── STEP ITEMS (3-р зураг шиг) ──────────────────────────────────────────────
const STEPS = [
  {
    id: 'personal',
    title: 'Хувийн мэдээлэл',
    subtitle: 'Бүртгэлтэй',
    icon: 'person-outline',
    color: '#6C63FF',
    completed: true,
  },
  {
    id: 'employment',
    title: 'Ажлын мэдээлэл',
    subtitle: 'Дутуу',
    icon: 'briefcase-outline',
    color: '#FF6B6B',
    completed: false,
  },
  {
    id: 'income',
    title: 'Орлогын мэдээлэл',
    subtitle: 'Дутуу',
    icon: 'cash-outline',
    color: '#4ECDC4',
    completed: false,
  },
  {
    id: 'bank',
    title: 'Банкны мэдээлэл',
    subtitle: 'Дутуу',
    icon: 'card-outline',
    color: '#FFE66D',
    completed: false,
  },
  {
    id: 'documents',
    title: 'Баримт бичиг',
    subtitle: 'Дутуу',
    icon: 'document-text-outline',
    color: '#A29BFE',
    completed: false,
  },
];

// ─── PERSONAL INFO FIELDS ─────────────────────────────────────────────────────
const BASIC_FIELDS = [
  { key: 'lastName', label: 'Овог', placeholder: 'Овогоо оруулна уу', required: true },
  { key: 'firstName', label: 'Нэр', placeholder: 'Нэрээ оруулна уу', required: true },
  { key: 'registerNumber', label: 'Регистрийн дугаар', placeholder: 'УБ12345678', required: true },
  { key: 'gender', label: 'Хүйс', placeholder: 'Эрэгтэй / Эмэгтэй', required: true },
  { key: 'birthDate', label: 'Төрсөн огноо', placeholder: '1990-01-01', required: false },
];

const CONTACT_FIELDS = [
  { key: 'phone', label: 'Утасны дугаар', placeholder: '99119911', required: true },
  { key: 'email', label: 'И-мэйл', placeholder: 'email@example.com', required: false },
  { key: 'address', label: 'Хаяг', placeholder: 'УБ хот, дүүрэг, хороо...', required: false },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const StepIcon = ({ color, icon, completed }) => (
  <View style={[styles.stepIconWrap, { backgroundColor: color + '22' }]}>
    {completed ? (
      <View style={[styles.stepIconInner, { backgroundColor: color }]}>
        <Icon name="checkmark" size={16} color="#fff" />
      </View>
    ) : (
      <View style={[styles.stepIconInner, { backgroundColor: color + '55' }]}>
        <Icon name={icon} size={16} color={color} />
      </View>
    )}
  </View>
);

const StepRow = ({ step, onPress }) => (
  <TouchableOpacity
    style={[styles.stepRow, step.completed && styles.stepRowCompleted]}
    onPress={() => onPress(step)}
    activeOpacity={0.75}
  >
    <StepIcon color={step.color} icon={step.icon} completed={step.completed} />
    <View style={styles.stepInfo}>
      <Text style={[styles.stepTitle, !step.completed && styles.stepTitleInactive]}>
        {step.title}
      </Text>
      <Text style={[styles.stepSubtitle, step.completed && { color: step.color }]}>
        {step.subtitle}
      </Text>
    </View>
    {step.completed ? (
      <Icon name="checkmark-circle" size={22} color={step.color} />
    ) : (
      <Icon name="chevron-forward" size={18} color="#bbb" />
    )}
  </TouchableOpacity>
);

const FieldRow = ({ field, value, onChange }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>
      {field.label}
      {field.required && <Text style={styles.required}> *</Text>}
    </Text>
    <View style={styles.fieldInputWrap}>
      <TextInput
        style={styles.fieldInput}
        placeholder={field.placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Icon name="chevron-forward" size={16} color="#ccc" />
    </View>
  </View>
);

// ─── PANEL (3-р зураг дахь right panel) ──────────────────────────────────────
const PersonalInfoPanel = ({ visible, onClose, user, formData, setFormData, onSave, loading }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const slideAnim = useRef(new Animated.Value(width)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : width,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  const fields = activeTab === 'basic' ? BASIC_FIELDS : CONTACT_FIELDS;

  return (
    <Animated.View
      style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Panel Header */}
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Хувийн мэдээлэл</Text>
        <TouchableOpacity onPress={onClose} style={styles.panelClose}>
          <Icon name="close" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.panelAvatar}>
        <View style={styles.avatarCircle}>
          <Icon name="person" size={36} color="#fff" />
        </View>
        <Text style={styles.panelName}>
          {formData.firstName && formData.lastName
            ? `${formData.lastName} ${formData.firstName}`
            : user?.name || 'Таны нэр'}
        </Text>
        <Text style={styles.panelPhone}>{user?.phoneNumber || ''}</Text>
        <TouchableOpacity style={styles.editPhotoBtn}>
          <Text style={styles.editPhotoText}>Зураг солих</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'basic' && styles.tabActive]}
          onPress={() => setActiveTab('basic')}
        >
          <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>
            Үндсэн мэдээлэл
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
            Холбоо барих
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fields */}
      <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
        {fields.map((field) => (
          <FieldRow
            key={field.key}
            field={field}
            value={formData[field.key] || ''}
            onChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
          />
        ))}

        {/* Save button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6C63FF', '#4ECDC4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            {loading ? (
              <Icon name="sync" size={20} color="#fff" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Хадгалах</Text>
                <Icon name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const KYCInfoScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [panelVisible, setPanelVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const completedCount = STEPS.filter((s) => s.completed).length;
  const progress = completedCount / STEPS.length;

  const [formData, setFormData] = useState({
    lastName: user?.personalInfo?.lastName || '',
    firstName: user?.personalInfo?.firstName || '',
    registerNumber: user?.personalInfo?.registerNumber || '',
    gender: user?.personalInfo?.gender || '',
    birthDate: user?.personalInfo?.birthDate || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    address: user?.personalInfo?.address?.fullAddress || '',
  });

  const handleStepPress = (step) => {
    if (step.id === 'personal') {
      setActiveStep(step);
      setPanelVisible(true);
    } else {
      Toast.show({
        type: 'info',
        text1: step.title,
        text2: 'Энэ хэсэг удахгүй нэмэгдэнэ',
      });
    }
  };

  const handleSave = async () => {
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
      // submitPersonalInfo(formData) ← таны API дуудах
      await new Promise((r) => setTimeout(r, 800)); // demo delay
      Toast.show({ type: 'success', text1: 'Амжилттай хадгалагдлаа' });
      setPanelVisible(false);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Алдаа гарлаа' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f6fa"
        translucent={false}
      />

      {/* ── BACKGROUND ── */}
      <LinearGradient colors={['#e8eaf6', '#f5f6fa', '#ffffff']} style={StyleSheet.absoluteFill} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Баталгаажуулалт</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>Тусламж</Text>
        </TouchableOpacity>
      </View>

      {/* ── MAIN CARD ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          {/* User greeting */}
          <View style={styles.greetRow}>
            <View style={styles.greetAvatar}>
              <LinearGradient
                colors={['#6C63FF', '#4ECDC4']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.greetAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'Т'}
              </Text>
            </View>
            <View>
              <Text style={styles.greetHi}>Сайн байна уу,</Text>
              <Text style={styles.greetName}>{user?.name || 'Хэрэглэгч'}</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              Профайл гүйцэтгэх ({completedCount}/{STEPS.length})
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* Steps list */}
          <View style={styles.stepsList}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.id}>
                <StepRow step={step} onPress={handleStepPress} />
                {i < STEPS.length - 1 && <View style={styles.stepDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('KYCDocuments')}
          >
            <LinearGradient
              colors={['#6C63FF', '#4ECDC4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaBtnText}>Профайл гүйцэтгэх</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Icon name="shield-checkmark" size={20} color="#6C63FF" />
          <Text style={styles.infoCardText}>
            Таны мэдээлэл нууцлагдах бөгөөд зөвхөн зээл олгох зорилгоор ашиглагдана.
          </Text>
        </View>
      </ScrollView>

      {/* ── PERSONAL INFO PANEL (slide from right) ── */}
      <PersonalInfoPanel
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
        user={user}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        loading={loading}
      />

      {/* Backdrop */}
      {panelVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setPanelVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  helpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  helpText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Main Card
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 16,
  },

  // Greet
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  greetAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    zIndex: 1,
  },
  greetHi: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  greetName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },

  // Progress
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e8eaf6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },

  // Steps
  stepsList: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stepRowCompleted: {
    // slight highlight
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepIconInner: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  stepTitleInactive: {
    color: '#999',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '500',
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 58,
  },

  // CTA
  ctaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0eeff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  // ── PANEL ──
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.92,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 100,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  panelClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar in panel
  panelAvatar: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  panelName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  panelPhone: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  editPhotoBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6C63FF',
  },
  editPhotoText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6C63FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bbb',
  },
  tabTextActive: {
    color: '#6C63FF',
  },

  // Fields
  panelScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#FF6B6B',
  },
  fieldInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '500',
    paddingVertical: 2,
  },

  // Save button
  saveBtn: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Backdrop
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 50,
  },
});

export default KYCInfoScreen;