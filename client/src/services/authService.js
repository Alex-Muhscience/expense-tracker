import api from './api';

const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error('Registration error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      console.error('Forgot password error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async verifyToken() {
    try {
      const response = await api.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  },

  logout() {
    // Clear all auth-related items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally call backend logout endpoint
    return true;
  },
};

export default authService;