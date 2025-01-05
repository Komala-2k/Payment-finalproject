// Default to localhost if REACT_APP_API_URL is not set
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  verify: `${BASE_URL}/auth/verify`,
  forgotPassword: `${BASE_URL}/auth/forgot-password`,
  resetPassword: (token) => `${BASE_URL}/auth/reset-password/${token}`,
  
  // User endpoints
  profile: `${BASE_URL}/users/profile`,
  changePassword: `${BASE_URL}/users/change-password`,
  
  // Transaction endpoints
  balance: `${BASE_URL}/transactions/balance`,
  addMoney: `${BASE_URL}/transactions/add-money`,
  sendMoney: `${BASE_URL}/transactions/send-money`,
  transactionHistory: `${BASE_URL}/transactions/history`
};

// Helper function to create headers with auth token
export const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Helper function to handle API responses
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  return response.json();
};

// Helper function to make API requests
export const makeApiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_ENDPOINTS;
