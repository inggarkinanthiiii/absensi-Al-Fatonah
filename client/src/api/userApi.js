import axios from './axios';

export const userApi = {
  getAllUsers: (params) => axios.get('/users', { params }),
  getUserById: (id) => axios.get(`/users/${id}`),
  createUser: (userData) => axios.post('/users', userData),
  updateUser: (id, userData) => axios.put(`/users/${id}`, userData),
  deleteUser: (id) => axios.delete(`/users/${id}`),
  toggleUserStatus: (id) => axios.patch(`/users/${id}/status`),
};
