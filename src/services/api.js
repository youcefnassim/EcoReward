import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // Bypass ngrok warning page
  },
});

// ─── Attach JWT token from localStorage ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eco_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Normalize errors ─────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Une erreur est survenue';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  recycle: (machineId, itemType) => api.post('/users/recycle', { machineId, itemType }),
};

// ─── Rewards ─────────────────────────────────────────────────────────────────
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  redeem: (rewardId) => api.post(`/rewards/${rewardId}/redeem`),
};

// ─── History ─────────────────────────────────────────────────────────────────
export const historyAPI = {
  getAll: (limit = 20) => api.get(`/history?limit=${limit}`),
};

// ─── Machines ────────────────────────────────────────────────────────────────
export const machinesAPI = {
  getAll: () => api.get('/machines'),
  getById: (id) => api.get(`/machines/${id}`),
};

// ─── Gamification ─────────────────────────────────────────────────────────────
export const gamificationAPI = {
  getLeaderboard: () => api.get('/gamification/leaderboard'),
  scan: (machineId) => api.post('/gamification/scan', { machineId }),
  getBadges: () => api.get('/gamification/badges'),
};

export default api;
