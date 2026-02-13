/**
 * Wallet Service - Хэтэвчний API
 * БАЙРШИЛ: Cashly.mn/App/src/services/walletService.js
 */

import api from './api';

export const getWallet = async () => {
  try {
    const response = await api.get('/wallet/balance');
    return response;
  } catch (error) {
    throw error;
  }
};

export const deposit = async (amount, paymentMethod, referenceNumber) => {
  try {
    const response = await api.post('/wallet/deposit', {
      amount,
      paymentMethod,
      referenceNumber,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const requestWithdrawal = async (amount) => {
  try {
    const response = await api.post('/wallet/request-withdrawal', {
      amount,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getWithdrawalRequests = async () => {
  try {
    const response = await api.get('/wallet/withdrawal-requests');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTransactions = async (page = 1, type = '') => {
  try {
    const response = await api.get('/transaction/history', {
      params: { page, type },
    });
    return response;
  } catch (error) {
    throw error;
  }
};