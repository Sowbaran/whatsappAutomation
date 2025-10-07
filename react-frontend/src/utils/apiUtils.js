import { toast } from 'react-hot-toast';
import config from '../config';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {string} [customMessage] - Custom error message to display
 */
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let errorMessage = customMessage || 'An error occurred. Please try again.';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Your session has expired. Please log in again.';
        // Handle unauthorized (e.g., redirect to login)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.userKey);
          window.location.href = config.routes.login;
        }
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 500:
        errorMessage = 'A server error occurred. Please try again later.';
        break;
      default:
        errorMessage = data.message || `Error: ${status} - ${data.error || 'Unknown error'}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'An unexpected error occurred.';
  }
  
  // Show error toast
  toast.error(errorMessage);
  
  // Return the error message in case the caller wants to use it
  return errorMessage;
};

/**
 * Format API response data consistently
 * @param {Object} response - The API response
 * @returns {Object} Formatted response data
 */
export const formatResponse = (response) => {
  if (!response) return null;
  
  // Handle different response formats
  if (response.data) {
    return response.data;
  }
  
  return response;
};

/**
 * Create query string from object
 * @param {Object} params - Object with query parameters
 * @returns {string} Formatted query string
 */
export const createQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else if (value instanceof Date) {
        queryParams.append(key, value.toISOString());
      } else if (typeof value === 'object') {
        queryParams.append(key, JSON.stringify(value));
      } else {
        queryParams.append(key, value);
      }
    }
  });
  
  return queryParams.toString();
};

/**
 * Get full API URL for a given endpoint
 * @param {string} endpoint - API endpoint
 * @param {Object} [queryParams] - Optional query parameters
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint, queryParams = {}) => {
  const baseUrl = config.api.baseURL;
  const queryString = createQueryString(queryParams);
  const separator = endpoint.includes('?') ? '&' : '?';
  
  return `${baseUrl}${endpoint}${queryString ? `${separator}${queryString}` : ''}`;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} [format='short'] - Format type (short, long, datetime, time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};
