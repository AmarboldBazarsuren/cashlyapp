/**
 * Notification Service - Frontend API
 * БАЙРШИЛ: src/services/notificationService.js
 * ✅ ЗАСВАР: response.data → response (api.js interceptor аль хэдийн .data буцаана)
 */

import api from './api';

export const getMyNotifications = async (page = 1, limit = 30) => {
  try {
    const response = await api.get('/notification/my', { params: { page, limit } });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notification/unread-count');
    return response;
  } catch (error) {
    throw error;
  }
};

export const markOneRead = async (notificationId) => {
  try {
    const response = await api.put(`/notification/${notificationId}/read`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markAllRead = async () => {
  try {
    const response = await api.put('/notification/mark-all-read');
    return response;
  } catch (error) {
    throw error;
  }
};