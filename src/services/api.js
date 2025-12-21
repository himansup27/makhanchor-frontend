// src/services/api.js

import axios from 'axios';

// Base API URL - change this based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://makhanchor-backend-production.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  // Login
  login: async (mobile, password) => {
    const response = await api.post('/auth/login', { mobile, password });
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ==================== PRODUCTION APIs ====================

export const productionAPI = {
  // Get all production records
  getAll: async (params = {}) => {
    const response = await api.get('/production', { params });
    return response.data;
  },

  // Get single production record
  getById: async (id) => {
    const response = await api.get(`/production/${id}`);
    return response.data;
  },

  // Create production record
  create: async (data) => {
    const response = await api.post('/production', data);
    return response.data;
  },

  // Update production record
  update: async (id, data) => {
    const response = await api.put(`/production/${id}`, data);
    return response.data;
  },

  // Delete production record
  delete: async (id) => {
    const response = await api.delete(`/production/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async (params = {}) => {
    const response = await api.get('/production/stats', { params });
    return response.data;
  },
};

// ==================== INVENTORY APIs ====================

export const inventoryAPI = {
  // Get inventory by category
  getByCategory: async (category, params = {}) => {
    const response = await api.get(`/inventory/${category}`, { params });
    return response.data;
  },

  // Create inventory entry
  create: async (category, data) => {
    const response = await api.post(`/inventory/${category}`, data);
    return response.data;
  },

  // Update inventory entry
  update: async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  // Delete inventory entry
  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Get category statistics
  getCategoryStats: async (category) => {
    const response = await api.get(`/inventory/${category}/stats`);
    return response.data;
  },

  // Get all inventory statistics
  getAllStats: async () => {
    const response = await api.get('/inventory/all/stats');
    return response.data;
  },
};

// ==================== SALES APIs ====================

export const salesAPI = {
  // Get all sales records
  getAll: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Get single sales record
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Create sales record
  create: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  // Update sales record
  update: async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },

  // Delete sales record
  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async (params = {}) => {
    const response = await api.get('/sales/stats', { params });
    return response.data;
  },
};

export default api;