/**
 * Validation Utility - Өгөгдөл шалгах
 * БАЙРШИЛ: Cashly.mn/App/src/utils/validation.js
 */

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRegisterNumber = (registerNumber) => {
  const registerRegex = /^[А-ЯӨҮ]{2}[0-9]{8}$/;
  return registerRegex.test(registerNumber);
};

export const validateAmount = (amount, min = 0, max = Infinity) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= min && numAmount <= max;
};