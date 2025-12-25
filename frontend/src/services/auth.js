import api from './api';
import { AUTH_API, STORAGE_KEYS } from '../utils/constants';

export const authService = {
  // Login
  login: async (username, password) => {
    const response = await api.post(`${AUTH_API}/login`, { username, password });
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      // In production, save token from backend
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'demo-token');
    }
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post(`${AUTH_API}/register`, userData);
    if (response.data.success) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'demo-token');
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Check if admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.userType === 'ADMIN';
  }
};