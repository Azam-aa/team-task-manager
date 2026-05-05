import axios from 'axios';

// When VITE_API_URL is set (production), use it as base.
// In development, Vite proxy handles /api -> localhost:8080, so baseURL stays empty.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally — token expired or invalid
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────
export const login = (data) => API.post('/api/auth/login', data);
export const signup = (data) => API.post('/api/auth/signup', data);

// ── Projects ──────────────────────────────────
export const getProjects = () => API.get('/api/projects');
export const getProject = (id) => API.get(`/api/projects/${id}`);
export const createProject = (data) => API.post('/api/projects', data);
export const updateProject = (id, data) => API.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/api/projects/${id}`);

// ── Tasks ─────────────────────────────────────
export const getTasksByProject = (projectId) => API.get(`/api/tasks/project/${projectId}`);
export const getMyTasks = () => API.get('/api/tasks/my');
export const getDashboard = () => API.get('/api/tasks/dashboard');
export const createTask = (data) => API.post('/api/tasks', data);
export const updateTask = (id, data) => API.put(`/api/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => API.patch(`/api/tasks/${id}/status`, { status });
export const deleteTask = (id) => API.delete(`/api/tasks/${id}`);

// ── Users ─────────────────────────────────────
export const getUsers = () => API.get('/api/users');
export const getMe = () => API.get('/api/users/me');

export default API;
