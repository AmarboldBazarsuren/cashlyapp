/**
 * Auth Context - Хэрэглэгчийн authentication
 * БАЙРШИЛ: Cashly.mn/App/src/context/AuthContext.js
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // App эхлэхэд token шалгах
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Нэвтрэх
  const login = async (phoneNumber, password) => {
    try {
      const response = await loginService(phoneNumber, password);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Нэвтрэхэд алдаа гарлаа' };
    }
  };

  // Бүртгүүлэх
  const register = async (phoneNumber, password, name) => {
    try {
      const response = await registerService(phoneNumber, password, name);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Бүртгэлд алдаа гарлаа' };
    }
  };

  // Гарах
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // User мэдээлэл шинэчлэх
  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Update user error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};