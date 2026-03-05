/**
 * Notification Service - Frontend API
 * БАЙРШИЛ: src/services/notificationService.js
 *
 * Backend-тэй холбогдох API функцүүд
 * Endpoints:
 *   GET  /api/notification/my           - Мэдэгдлүүд татах
 *   GET  /api/notification/unread-count - Уншаагүй тоо
 *   PUT  /api/notification/:id/read     - Нэг уншсан болгох
 *   PUT  /api/notification/mark-all-read - Бүгдийг уншсан болгох
 */

import api from './api';

/**
 * Миний бүх мэдэгдлүүд татах
 * @param {number} page - Хуудасны дугаар (default: 1)
 * @param {number} limit - Нэг хуудсанд харуулах тоо (default: 30)
 */
export const getMyNotifications = async (page = 1, limit = 30) => {
  const response = await api.get('/notification/my', { params: { page, limit } });
  return response.data;
};

/**
 * Уншаагүй мэдэгдлийн тоо авах
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notification/unread-count');
  return response.data;
};

/**
 * Нэг мэдэгдэл уншсан болгох
 * @param {string} notificationId - Мэдэгдлийн ID
 */
export const markOneRead = async (notificationId) => {
  const response = await api.put(`/notification/${notificationId}/read`);
  return response.data;
};

/**
 * Бүх мэдэгдлийг уншсан болгох
 */
export const markAllRead = async () => {
  const response = await api.put('/notification/mark-all-read');
  return response.data;
};