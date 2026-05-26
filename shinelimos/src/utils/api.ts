import axios from 'axios';

const API_BASE_URL = 'http://localhost:60000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const initiateBooking = async (tripDetails: any) => {
  const response = await api.post('/bookings', { trip_details: tripDetails });
  return response.data;
};

export const finalizeBooking = async (bookingData: any) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Admin login uses the root backend path (not /api)
export const adminLogin = async (email: string, password: string) => {
  const response = await axios.post('http://localhost:60000/admin_login', { email, password }, { withCredentials: true });
  return response.data;
};

export default api;
