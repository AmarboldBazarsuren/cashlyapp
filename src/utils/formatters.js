/**
 * Formatters Utility - Өгөгдөл форматлах
 * БАЙРШИЛ: Cashly.mn/App/src/utils/formatters.js
 */

/**
 * Мөнгөн дүн форматлах
 * @param {number} amount
 * @returns {string}
 */
export const formatMoney = (amount) => {
  if (!amount) return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Огноо форматлах
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Огноо болон цаг форматлах
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Утасны дугаар форматлах
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone || phone.length !== 8) return phone;
  return `${phone.slice(0, 4)}-${phone.slice(4)}`;
};

/**
 * Хувь форматлах
 * @param {number} percent
 * @returns {string}
 */
export const formatPercent = (percent) => {
  return `${percent.toFixed(1)}%`;
};
