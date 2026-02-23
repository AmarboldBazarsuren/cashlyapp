/**
 * Wallet Service - Хэтэвчний API
 * БАЙРШИЛ: src/services/walletService.js
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
    const response = await api.post('/wallet/request-withdrawal', { amount });
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

/**
 * ✅ ЗАСВАР: page болон type зөв дамжуулах
 * @param {number|object} page - хуудасны дугаар (default: 1)
 * @param {string} type - шүүх төрөл (default: '')
 */
export const getTransactions = async (page = 1, type = '') => {
  try {
    // Хэрэв page нь object байвал (хуучин дуудалт: getTransactions({ limit: 20 }))
    // автоматаар 1 болгоно
    const pageNum = typeof page === 'object' ? 1 : page;
    const limit = typeof page === 'object' ? (page.limit || 20) : 20;

    const response = await api.get('/transaction/history', {
      params: { page: pageNum, type, limit },
    });
    return response;
  } catch (error) {
    throw error;
  }
};