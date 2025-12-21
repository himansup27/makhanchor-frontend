// src/utils/excelHelper.js

/**
 * Converts Excel date to YYYY-MM-DD string WITHOUT timezone conversion
 * @param {number|string|Date} excelDate - The date value from Excel
 * @returns {string} - Date in YYYY-MM-DD format (exact date, no timezone shift)
 */
export const parseExcelDate = (excelDate) => {
  // If it's a number (Excel serial date)
  if (typeof excelDate === 'number') {
    // Excel stores dates as days since December 30, 1899
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const msPerDay = 86400000;
    const jsDate = new Date(excelEpoch.getTime() + excelDate * msPerDay);
    
    // Extract year, month, day without timezone conversion
    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // If it's already a Date object
  if (excelDate instanceof Date) {
    const year = excelDate.getFullYear();
    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
    const day = String(excelDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // If it's a string
  if (typeof excelDate === 'string') {
    // Remove any whitespace
    const cleaned = excelDate.trim();
    
    // Try DD-MM-YYYY or DD/MM/YYYY format
    const ddmmyyyyRegex = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
    const ddmmMatch = cleaned.match(ddmmyyyyRegex);
    
    if (ddmmMatch) {
      const day = ddmmMatch[1].padStart(2, '0');
      const month = ddmmMatch[2].padStart(2, '0');
      const year = ddmmMatch[3];
      return `${year}-${month}-${day}`;
    }
    
    // Try YYYY-MM-DD format (already correct)
    const yyyymmddRegex = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/;
    const yyyymmMatch = cleaned.match(yyyymmddRegex);
    
    if (yyyymmMatch) {
      const year = yyyymmMatch[1];
      const month = yyyymmMatch[2].padStart(2, '0');
      const day = yyyymmMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try MM-DD-YYYY format
    const mmddyyyyRegex = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
    const mmddMatch = cleaned.match(mmddyyyyRegex);
    
    if (mmddMatch) {
      // Ambiguous - assume DD-MM-YYYY for Indian format
      const day = mmddMatch[1].padStart(2, '0');
      const month = mmddMatch[2].padStart(2, '0');
      const year = mmddMatch[3];
      return `${year}-${month}-${day}`;
    }
  }
  
  // Default to today if all else fails
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display (DD-MM-YYYY)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Date in DD-MM-YYYY format
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Validate if string is a valid date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};