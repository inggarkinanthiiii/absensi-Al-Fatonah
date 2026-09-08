import axios from './axios';

export const absensiApi = {
  getAllAbsensi: () => axios.get('/absensi'),
  createAbsensi: (absensiData) => axios.post('/absensi', absensiData),
  getAbsensiByKajian: (kajianId) => axios.get(`/absensi/kajian/${kajianId}`),
  getAbsensiByUser: (userId) => axios.get(`/absensi/user/${userId}`),
  getAbsensiStats: (kajianId) => axios.get(`/absensi/stats/${kajianId}`),
  getAttendanceRekap: (kajianId) => axios.get(`/absensi/rekap/${kajianId}`),
  deleteAbsensi: (id) => axios.delete(`/absensi/${id}`),
};
