import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Foods API
export const foodsAPI = {
  getFoods: (params) => api.get('/foods', { params }),
  getFoodById: (id) => api.get(`/foods/${id}`),
  createFood: (data) => api.post('/foods', data),
  updateFood: (id, data) => api.put(`/foods/${id}`, data),
  deleteFood: (id) => api.delete(`/foods/${id}`),
};

// Meal Plans API
export const mealPlansAPI = {
  getMealPlan: (weekStartDate) => api.get('/meal-plans', { params: { week_start_date: weekStartDate } }),
  createMealPlan: (data) => api.post('/meal-plans', data),
  createOrUpdateEntry: (mealPlanId, data) => api.post(`/meal-plans/${mealPlanId}/entries`, data),
  deleteEntry: (mealPlanId, entryId) => api.delete(`/meal-plans/${mealPlanId}/entries/${entryId}`),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
  getStats: () => api.get('/user/stats'),
};

export default api;