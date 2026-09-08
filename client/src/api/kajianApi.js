import axios from './axios';

export const kajianApi = {
  getMainLocation: () => axios.get('/kajian/location/main'),
  saveMainLocation: (locationData) => axios.put('/kajian/location/main', locationData),
  getAllKajian: (params) => axios.get('/kajian', { params }),
  getKajianById: (id) => axios.get(`/kajian/${id}`),
  createKajian: (kajianData) => axios.post('/kajian', kajianData),
  updateKajian: (id, kajianData) => axios.put(`/kajian/${id}`, kajianData),
  deleteKajian: (id) => axios.delete(`/kajian/${id}`),
  toggleKajianStatus: (id) => axios.patch(`/kajian/${id}/status`),
};
