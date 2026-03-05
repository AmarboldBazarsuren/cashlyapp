/**
 * notificationService.js
 * БАЙРШИЛ: src/services/notificationService.js
 * Backend: Notification model → /api/notification/*
 */

import api from './api'; // таны axios instance

// Миний мэдэгдлүүд авах
export const getMyNotifications = async (page = 1, limit = 30) => {
  const res = await api.get(`/notification/my?page=${page}&limit=${limit}`);
  return res.data;
};

// Нэг мэдэгдлийг уншсан болгох
export const markOneRead = async (notificationId) => {
  const res = await api.put(`/notification/${notificationId}/read`);
  return res.data;
};

// Бүгдийг уншсан болгох
export const markAllRead = async () => {
  const res = await api.put('/notification/mark-all-read');
  return res.data;
};

// Уншаагүй тоо авах
export const getUnreadCount = async () => {
  const res = await api.get('/notification/unread-count');
  return res.data;
};  