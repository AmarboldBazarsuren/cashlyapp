/**
 * API Service - Axios instance болон interceptors
 * БАЙРШИЛ: Cashly.mn/App/src/services/api.js
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

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
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Алдаа боловсруулах
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
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