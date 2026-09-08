import axios from './axios';

export const faceApi = {
  getFaceDataByUserId: (userId) => axios.get(`/facedata/user/${userId}`),
  createFaceData: (faceData) => axios.post('/facedata', faceData),
  updateFaceData: (id, faceData) => axios.put(`/facedata/${id}`, faceData),
  deactivateFaceData: (userId) => axios.delete(`/facedata/user/${userId}`),
  deleteFaceData: (id) => axios.delete(`/facedata/${id}`),
};
