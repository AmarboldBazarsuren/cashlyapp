/**
 * KYC Service - Хувийн мэдээлэл баталгаажуулах API
 * БАЙРШИЛ: src/services/kycService.js
 */

import api from './api';

/**
 * Хувийн мэдээлэл илгээх (Step 1)
 */
export const submitPersonalInfo = async (personalData) => {
  try {
    const response = await api.post('/user/submit-kyc', personalData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Зураг (баримт бичиг) upload хийх
 * @param {FormData} formData - зурагтай FormData
 */
export const uploadDocument = async (formData) => {
  try {
    const response = await api.post('/user/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    // Upload endpoint байхгүй тохиолдолд base64 ашиглана
    throw error;
  }
};

/**
 * KYC бүрэн илгээх - зурагтай хамт (Step 2)
 * @param {Object} documents - { idCardFront, idCardBack, selfie } URLs
 */
export const submitKYC = async (documents) => {
  try {
    const response = await api.post('/user/submit-kyc', {
      idCardFrontBase64: documents.idCardFront,
      idCardBackBase64: documents.idCardBack,
      selfieBase64: documents.selfie,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * KYC статус шалгах
 */
export const getKYCStatus = async () => {
  try {
    const response = await api.get('/user/profile');
    return {
      success: true,
      data: {
        kycStatus: response.data?.user?.kycStatus,
        kycSubmittedAt: response.data?.user?.kycSubmittedAt,
      },
    };
  } catch (error) {
    throw error;
  }
};