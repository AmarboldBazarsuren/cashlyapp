/**
 * PersonalInfoViewScreen.js - Read-only хувийн мэдээлэл
 * Бүх мэдээллийг харуулна, гэхдээ засах боломжгүй
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function PersonalInfoViewScreen({ navigation }) {
  const { user } = useAuth();
  const info = user?.personalInfo || {};

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={18} color="#64748B" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F9" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Хувийн мэдээлэл</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusCard}>
          <Ionicons 
            name={user?.kycStatus === 'approved' ? 'checkmark-circle' : 'time-outline'} 
            size={24} 
            color={user?.kycStatus === 'approved' ? '#10B981' : '#F59E0B'}
          />
          <Text style={[styles.statusText, { color: user?.kycStatus === 'approved' ? '#10B981' : '#F59E0B' }]}>
            {user?.kycStatus === 'approved' ? 'Баталгаажсан' : 'Хянагдаж байна'}
          </Text>
        </View>

        {/* Personal Info */}
        <Section title="Үндсэн мэдээлэл">
          <InfoRow icon="person-outline" label="Овог" value={info.lastName} />
          <InfoRow icon="person-outline" label="Нэр" value={info.firstName} />
          <InfoRow icon="card-outline" label="Регистр" value={info.registerNumber} />
          <InfoRow icon="male-female-outline" label="Хүйс" value={info.gender} />
          <InfoRow icon="calendar-outline" label="Төрсөн огноо" value={info.birthDate} />
        </Section>

        {/* Education & Employment */}
        <Section title="Боловсрол & Ажил">
          <InfoRow icon="school-outline" label="Боловсрол" value={info.education} />
          <InfoRow icon="briefcase-outline" label="Ажлын байдал" value={info.employment?.status} />
          {info.employment?.companyName && (
            <InfoRow icon="business-outline" label="Компани" value={info.employment.companyName} />
          )}
          {info.employment?.position && (
            <InfoRow icon="person-circle-outline" label="Албан тушаал" value={info.employment.position} />
          )}
          {info.employment?.monthlyIncome > 0 && (
            <InfoRow icon="cash-outline" label="Сарын орлого" value={`${info.employment.monthlyIncome.toLocaleString()}₮`} />
          )}
        </Section>

        {/* Bank Info */}
        {info.bankInfo?.bankName && (
          <Section title="Банкны мэдээлэл">
            <InfoRow icon="card-outline" label="Банк" value={info.bankInfo.bankName} />
            <InfoRow icon="keypad-outline" label="Дансны дугаар" value={info.bankInfo.accountNumber} />
            {info.bankInfo.accountName && (
              <InfoRow icon="person-outline" label="Дансны нэр" value={info.bankInfo.accountName} />
            )}
          </Section>
        )}

        {/* Address */}
        {(info.address?.city || info.address?.district) && (
          <Section title="Хаяг">
            {info.address.city && <InfoRow icon="location-outline" label="Хот" value={info.address.city} />}
            {info.address.district && <InfoRow icon="map-outline" label="Дүүрэг" value={info.address.district} />}
            {info.address.khoroo && <InfoRow icon="navigate-outline" label="Хороо" value={info.address.khoroo} />}
            {info.address.building && <InfoRow icon="home-outline" label="Байр" value={info.address.building} />}
            {info.address.apartment && <InfoRow icon="home-outline" label="Тоот" value={info.address.apartment} />}
            {info.address.fullAddress && (
              <View style={styles.fullAddressRow}>
                <Ionicons name="location-outline" size={18} color="#64748B" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Бүтэн хаяг</Text>
                  <Text style={styles.fullAddressValue}>{info.address.fullAddress}</Text>
                </View>
              </View>
            )}
          </Section>
        )}

        {/* Emergency Contact */}
        {info.emergencyContacts && info.emergencyContacts.length > 0 && (
          <Section title="Яаралтай холбоо барих">
            <InfoRow icon="person-outline" label="Нэр" value={info.emergencyContacts[0].name} />
            <InfoRow icon="people-outline" label="Хамаарал" value={info.emergencyContacts[0].relationship} />
            <InfoRow icon="call-outline" label="Утас" value={info.emergencyContacts[0].phoneNumber} />
          </Section>
        )}

        {/* Documents Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={20} color="#5B5BD6" />
          <Text style={styles.noticeText}>
            Иргэний үнэмлэх болон селфи зурагнууд нь нууцлалын үүднээс харагдахгүй
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll: { paddingHorizontal: 18, paddingTop: 10 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statusText: { fontSize: 15, fontWeight: '700' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
  sectionContent: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#5B5BD6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  infoLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0F0F1A', textAlign: 'right', flex: 1 },
  fullAddressRow: { flexDirection: 'row', gap: 8, paddingVertical: 10 },
  fullAddressValue: { fontSize: 14, color: '#0F0F1A', lineHeight: 20, marginTop: 4 },
  noticeCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EEEEFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#D4D4F8' },
  noticeText: { fontSize: 13, color: '#5B5BD6', flex: 1, lineHeight: 18 },
});