

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api'; // Таны axios instance

// ── Notification харагдах байдал (app нээлттэй байхад) ──────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // App нээлттэй байхад ч alert харуулна
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ─────────────────────────────────────────────────────────────────────────
/**
 * Push notification бүртгүүлэх
 * Нэвтрэсний дараа дуудна (AuthContext дотор)
 *
 * @returns {String|null} FCM token эсвэл null
 */
export const registerForPushNotifications = async () => {
  try {
    // Жинхэнэ төхөөрөмж биш бол (simulator) алгасна
    if (!Device.isDevice) {
      console.log('Push notification зөвхөн жинхэнэ төхөөрөмж дээр ажиллана');
      return null;
    }

    // ── 1. Эрх шалгах / хүсэх ──────────────────────────────────────────
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification зөвшөөрөл олгоогүй');
      return null;
    }

    // ── 2. Android notification channel үүсгэх ─────────────────────────
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('cashly_notifications', {
        name:              'Cashly мэдэгдэл',
        importance:        Notifications.AndroidImportance.MAX,
        vibrationPattern:  [0, 250, 250, 250],
        lightColor:        '#6C63FF',
        sound:             'default',
        // Дэлгэц унтарсан үед ч харагдана
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge:         true,
      });
    }

    // ── 3. Expo Push Token авах ─────────────────────────────────────────
    // ⚠️ YOUR_EXPO_PROJECT_ID-г expo.dev → Projects → таны app-ийн ID-р солино
    // Жишээ: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EXPO_PROJECT_ID', // ← ЭНД СОЛИХ
    });

    const token = tokenData.data;
    console.log('✅ Expo Push Token:', token);

    // ── 4. Token-г backend-д хадгалах ──────────────────────────────────
    await saveFCMTokenToBackend(token);

    // Local-д ч хадгална (давтан илгээхгүйн тулд)
    await AsyncStorage.setItem('fcmToken', token);

    return token;

  } catch (error) {
    console.error('Push notification бүртгэлийн алдаа:', error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────
/**
 * Token-г backend-д илгээх
 */
const saveFCMTokenToBackend = async (token) => {
  try {
    // Өмнөх token-тэй ижил бол дахин илгээхгүй
    const savedToken = await AsyncStorage.getItem('fcmToken');
    if (savedToken === token) {
      console.log('FCM token өөрчлөгдөөгүй → алгасав');
      return;
    }

    await api.post('/user/update-fcm-token', { fcmToken: token });
    console.log('✅ FCM token backend-д хадгалагдлаа');
  } catch (error) {
    console.error('FCM token хадгалах алдаа:', error.message);
    // Алдаа гарсан ч app ажиллах ёстой → throw хийхгүй
  }
};

// ─────────────────────────────────────────────────────────────────────────
/**
 * Notification listener-үүд
 * App.js-д нэмнэ - notification ирэхэд / дарахад юу хийх
 *
 * @param {Function} onNotification  - Notification ирэхэд (app нээлттэй үед)
 * @param {Function} onPress         - Хэрэглэгч notification дарахад
 * @returns {Function} cleanup функц (useEffect return)
 */
export const addNotificationListeners = (onNotification, onPress) => {
  // App нээлттэй байхад notification ирвэл
  const receivedSub = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification ирлээ:', notification);
    if (onNotification) onNotification(notification);
  });

  // Хэрэглэгч notification дарахад
  const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification дараглаа:', data);
    if (onPress) onPress(data);
  });

  // useEffect дотор return хийх cleanup
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
};

// ─────────────────────────────────────────────────────────────────────────
/**
 * App бүрэн унтарсан үед (killed state) notification дарж нээсэн бол
 * App.js-д нэг удаа шалгана
 *
 * @returns {Object|null} Notification data эсвэл null
 */
export const getInitialNotification = async () => {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (response) {
    return response.notification.request.content.data;
  }
  return null;
};