/**
 * User Service - Хэрэглэгчийн API
 * БАЙРШИЛ: Cashly.mn/App/src/services/userService.js
 */

import api from './api';

export const getProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

export const submitKYC = async (kycData) => {
  try {
    const response = await api.post('/user/submit-kyc', kycData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const payCreditCheckFee = async () => {
  try {
    const response = await api.post('/user/pay-credit-check');
    return response;
  } catch (error) {
    throw error;
  }
};