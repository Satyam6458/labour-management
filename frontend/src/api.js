import axios from 'axios';

const API_BASE = import.meta.env.PROD 
  ? 'https://labour-api.onrender.com/api' 
  : '/api';

const API = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Token management
let authToken = localStorage.getItem('authToken');

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('authToken', token);
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
  delete API.defaults.headers.common['Authorization'];
};

// Restore token on load
if (authToken) {
  API.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export const isAuthenticated = () => !!authToken;

// ============ AUTH ============
export const login = (username, password) => API.post('/login', { username, password });

// ============ LABOURS ============
export const getLabours = () => API.get('/labours');
export const getLabour = (id) => API.get(`/labours/${id}`);
export const addLabour = (data) => API.post('/labours', data);
export const deleteLabour = (id) => API.delete(`/labours/${id}`);

// ============ ATTENDANCE ============
export const getAttendances = (labourId) => API.get(`/attendances/${labourId}`);
export const markAttendance = (data) => API.post('/attendances', data);
export const updateAttendance = (id, data) => API.put(`/attendances/${id}`, data);
export const deleteAttendance = (id) => API.delete(`/attendances/${id}`);

// ============ PAYMENTS ============
export const getPayments = (labourId) => API.get(`/payments/${labourId}`);
export const addPayment = (data) => API.post('/payments', data);
export const updatePayment = (id, data) => API.put(`/payments/${id}`, data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);

// ============ STATS ============
export const getAllStats = () => API.get('/stats');
export const getLabourStats = (labourId) => API.get(`/stats/${labourId}`);