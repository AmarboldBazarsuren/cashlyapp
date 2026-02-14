/**
 * KYC Service - UPDATED
 * submitPersonalInfo API нэмсэн
 */

import api from './api';

/**
 * Хувийн мэдээлэл илгээх (Step 1) - баримт бичиггүйгээр
 */
export const submitPersonalInfo = async (personalData) => {
  try {
    const response = await api.post('/user/submit-personal-info', personalData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Зураг (баримт бичиг) upload хийх
 * @param {String} documentType - 'idCardFront', 'idCardBack', 'selfie'
 * @param {String} base64Data - Base64 зураг
 */
export const uploadDocument = async (documentType, base64Data) => {
  try {
    const response = await api.post('/user/upload-document', {
      documentType,
      base64Data,
    });
    return response;
  } catch (error) {
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
      idCardFront: documents.idCardFront,
      idCardBack: documents.idCardBack,
      selfie: documents.selfie,
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