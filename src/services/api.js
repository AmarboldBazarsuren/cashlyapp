/**
 * API Service - Axios instance болон interceptors
 * БАЙРШИЛ: Cashly.mn/App/src/services/api.js
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
console.log('🔗 API_URL:', API_URL); // ← Энийг нэмэх

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token оруулах
api.interceptors.request.use(
  async (config) => {
        console.log('📤 API Request:', config.url); // ← Энийг нэмэх

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
        console.log('❌ Request Error:', error); // ← Энийг нэмэх

    return Promise.reject(error);
  }
);

// Response interceptor - Алдаа боловсруулах
api.interceptors.response.use(
  (response) => {
        console.log('✅ API Response:', response.config.url); // ← Энийг нэмэх

    return response.data;
  },
  async (error) => {
        console.log('❌ Response Error:', error.message); // ← Энийг нэмэх

    if (error.response) {
      // 401 - Token хүчингүй, logout хийх
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // Navigation reset хийх хэрэгтэй (AuthContext дээр)
      }
      
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject({
      success: false,
      message: 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу',
    });
  }
);

export default api;