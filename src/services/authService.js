/**
 * Auth Service - Нэвтрэх, бүртгүүлэх
 * БАЙРШИЛ: Cashly.mn/App/src/services/authService.js
 */

import api from './api';

export const login = async (phoneNumber, password) => {
  try {
    const response = await api.post('/auth/login', {
      phoneNumber,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (phoneNumber, password, name) => {
  try {
    const response = await api.post('/auth/register', {
      phoneNumber,
      password,
      name,
    });
    return response;
  } catch (error) {
    throw error;
  }
};