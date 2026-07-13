import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// ============ LABOURS ============
export const getLabours = () => API.get('/labours');
export const getLabour = (id) => API.get(`/labours/${id}`);
export const addLabour = (data) => API.post('/labours', data);
export const deleteLabour = (id) => API.delete(`/labours/${id}`);

// ============ ATTENDANCE ============
export const getAttendances = (labourId) => API.get(`/attendances/${labourId}`);
export const markAttendance = (data) => API.post('/attendances', data);

// ============ PAYMENTS ============
export const getPayments = (labourId) => API.get(`/payments/${labourId}`);
export const addPayment = (data) => API.post('/payments', data);

// ============ STATS ============
export const getAllStats = () => API.get('/stats');
export const getLabourStats = (labourId) => API.get(`/stats/${labourId}`);