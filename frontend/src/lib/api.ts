import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
};

// Researchers API
export const researchersApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/researchers', { params }),
  getById: (id: string) => api.get(`/researchers/${id}`),
  getMyProfile: () => api.get('/researchers/me'),
  getTimeAllocation: (id: string, params?: { from?: string; to?: string }) =>
    api.get(`/researchers/${id}/time-allocation`, { params }),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/researchers/${id}`, data),
};

// Grants API
export const grantsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/grants', { params }),
  getById: (id: string) => api.get(`/grants/${id}`),
  create: (data: Record<string, any>) => api.post('/grants', data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/grants/${id}`, data),
  delete: (id: string) => api.delete(`/grants/${id}`),
  getSuccessRate: (params?: Record<string, any>) =>
    api.get('/grants/success-rate', { params }),
  getTimeSpent: (id: string) => api.get(`/grants/${id}/time-spent`),
};

// Time Logs API
export const timeLogsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/time-logs', { params }),
  getById: (id: string) => api.get(`/time-logs/${id}`),
  create: (data: Record<string, any>) => api.post('/time-logs', data),
  bulkCreate: (logs: Record<string, any>[]) =>
    api.post('/time-logs/bulk', { logs }),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/time-logs/${id}`, data),
  delete: (id: string) => api.delete(`/time-logs/${id}`),
  getWeekly: (researcherId: string, weekOf?: string) =>
    api.get(`/time-logs/weekly/${researcherId}`, { params: { weekOf } }),
  getAdminBreakdown: (params?: Record<string, any>) =>
    api.get('/time-logs/admin-breakdown', { params }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: (institutionId?: string) =>
    api.get('/analytics/dashboard', { params: { institutionId } }),
  getTimeTrends: (params?: { institutionId?: string; months?: number }) =>
    api.get('/analytics/time-trends', { params }),
  getBottlenecks: (params?: Record<string, any>) =>
    api.get('/analytics/bottlenecks', { params }),
  getResearcherComparison: (institutionId: string, departmentId?: string) =>
    api.get('/analytics/researcher-comparison', {
      params: { institutionId, departmentId },
    }),
  getGrantPipeline: (institutionId?: string) =>
    api.get('/analytics/grant-pipeline', { params: { institutionId } }),
  getBenchmarks: (institutionId: string) =>
    api.get('/analytics/benchmarks', { params: { institutionId } }),
};

// Institutions API
export const institutionsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/institutions', { params }),
  getById: (id: string) => api.get(`/institutions/${id}`),
  getStats: (id: string) => api.get(`/institutions/${id}/stats`),
  getDepartments: (id: string) => api.get(`/institutions/${id}/departments`),
};
