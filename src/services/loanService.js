/**
 * Loan Service - Зээлийн API
 * БАЙРШИЛ: Cashly.mn/App/src/services/loanService.js
 */

import api from './api';

export const applyLoan = async (amount, term, purpose) => {
  try {
    const response = await api.post('/loan/apply', {
      amount,
      term,
      purpose,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMyLoans = async () => {
  try {
    const response = await api.get('/loan/my-loans');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getActiveLoans = async () => {
  try {
    const response = await api.get('/loan/active-loans');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLoanDetails = async (loanId) => {
  try {
    const response = await api.get(`/loan/${loanId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const extendLoan = async (loanId) => {
  try {
    const response = await api.post(`/loan/extend/${loanId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const repayLoan = async (loanId, amount) => {
  try {
    const response = await api.post(`/loan/repay/${loanId}`, {
      amount,
    });
    return response;
  } catch (error) {
    throw error;
  }
};