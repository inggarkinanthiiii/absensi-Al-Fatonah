import axios from './axios';

export const authApi = {
  register: (userData) => axios.post('/auth/register', userData),
  login: (credentials) => axios.post('/auth/login', credentials),
  getMe: () => axios.get('/auth/me'),
  updateProfile: (profileData) => axios.put('/auth/profile', profileData),
  changePassword: (passwordData) => axios.put('/auth/change-password', passwordData),
};
