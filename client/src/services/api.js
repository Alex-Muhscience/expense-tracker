// Updated api.js
import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction 
  ? process.env.REACT_APP_API_BASE_URL 
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Better error handling
const handleRequestError = (error) => {
  if (error.response) {
    // Server responded with a status code outside 2xx range
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  } else if (error.request) {
    // Request made but no response received
    console.error('API Request Error:', error.request);
  } else {
    // Something happened in setting up the request
    console.error('API Setup Error:', error.message);
  }
  
  return Promise.reject(error);
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  handleRequestError
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    handleRequestError(error);
    
    // Specific handling for common cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?sessionExpired=true';
    }
    
    if (error.response?.status === 429) {
      console.warn('API Rate Limit Exceeded');
    }
    
    const errorMessage = error.response?.data?.message ||
                       error.response?.statusText ||
                       error.message ||
                       'An unexpected error occurred';
    
    return Promise.reject(errorMessage);
  }
);

export default api;
