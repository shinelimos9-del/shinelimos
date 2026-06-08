import axios from 'axios';

export const API_BASE_URL = 'http://localhost:60000/api';
export const ADMIN_BASE_URL = 'http://localhost:60000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const initiateBooking = async (tripDetails: any) => {
  const response = await api.post('/bookings', { trip_details: tripDetails });
  return response.data;
};

export const finalizeBooking = async (bookingData: any) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const requestPayment = async (bookingId: string) => {
  const response = await api.post('/bookings/request-payment', { booking_id: bookingId });
  return response.data;
};

export const sendPaymentLink = async (bookingId: string) => {
  const response = await api.post('/admin/send-payment-link', { booking_id: bookingId });
  return response.data;
};

// Admin auth routes use the root backend path (not /api)
export const adminLogin = async (email: string, password: string) => {
  const response = await axios.post(`${ADMIN_BASE_URL}/admin_login`, { email, password }, { withCredentials: true });
  return response.data;
};

export const logoutAdmin = async () => {
  const response = await api.post(`${ADMIN_BASE_URL}/admin_logout`, {}, {
    withCredentials: true
  });
  return response.data;
};

export const sendOtpToAdmin = async (email: string) => {
  const response = await axios.post(`${ADMIN_BASE_URL}/sendOtpTOadmin`, { email }, { withCredentials: true });
  return response.data;
};

export const verifyAdminOtp = async (email: string, otp: string) => {
  const response = await axios.post(`${ADMIN_BASE_URL}/verifyOtp`, { email, otp }, { withCredentials: true });
  return response.data;
};

export const adminForgotPassword = async (email: string, newPassword: string) => {
  const response = await axios.post(`${ADMIN_BASE_URL}/admin_forgatePassword?email=${encodeURIComponent(email)}`, { newPassword }, { withCredentials: true });
  return response.data;
};

export const getVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const addVehicle = async (formData: FormData) => {
  const response = await api.post('/vehicles', formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateVehicle = async (formData: FormData, id: string) => {
  const response = await api.put(`/vehicles?_id=${encodeURIComponent(id)}`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete(`/vehicles/${encodeURIComponent(id)}`, {
    withCredentials: true,
  });
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// Admin profile & notifications
export const getAdminProfile = async () => {
  const response = await api.get(`${ADMIN_BASE_URL}/admin/profile`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get(`${ADMIN_BASE_URL}/admin/notifications`);
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await api.patch(`${ADMIN_BASE_URL}/admin/notifications/read`, {});
  return response.data;
};

// Bookings
export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const response = await api.patch(`/bookings/${encodeURIComponent(id)}/status`, { status });
  return response.data;
};

export default api;
