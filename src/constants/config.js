/**
 * Config - Апп-ийн тохиргоо
 * БАЙРШИЛ: Cashly.mn/App/src/constants/config.js
 */

import { API_BASE_URL } from '@env';

export const API_URL = API_BASE_URL || 'http://localhost:5000/api';

export const LOAN_TERMS = [
  { value: 14, label: '14 хоног', rate: 1.8 },
  { value: 21, label: '21 хоног', rate: 2.4 },
  { value: 90, label: '90 хоног', rate: 2.4 },
];

export const BANKS = [
  'Хаан банк',
  'Төрийн банк',
  'Голомт банк',
  'Хас банк',
  'Капитрон банк',
  'Ариг банк',
  'Богд банк',
  'Чингис хаан банк',
  'Худалдаа хөгжлийн банк',
  'Үндэсний хөрөнгө оруулалтын банк',
];

export const EDUCATION_LEVELS = [
  'Бага',
  'Дунд',
  'Тусгай дунд',
  'Бакалавр',
  'Магистр',
  'Доктор',
];

export const EMPLOYMENT_STATUS = [
  'Ажилтай',
  'Ажилгүй',
  'Оюутан',
  'Тэтгэвэрт',
  'Бизнес эрхлэгч',
];

export const CREDIT_CHECK_FEE = 3000; // 3000₮
export const MIN_LOAN_AMOUNT = 10000; // 10,000₮
export const MIN_WITHDRAWAL_AMOUNT = 10000; // 10,000₮
export const MIN_DEPOSIT_AMOUNT = 1000; // 1,000₮
export const MAX_LOAN_EXTENSIONS = 4; // Хамгийн их 4 удаа сунгаж болно