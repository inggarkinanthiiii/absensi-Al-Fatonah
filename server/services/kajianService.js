import { kajianRepository } from '../repositories/kajianRepository.js';

export const kajianService = {
  async getAllKajian(filters = {}) {
    return await kajianRepository.findAll(filters);
  },

  async getKajianById(id) {
    const kajian = await kajianRepository.findById(id);
    if (!kajian) {
      throw new Error('Kajian tidak ditemukan');
    }
    return kajian;
  },

  async createKajian(kajianData) {
    return await kajianRepository.create(kajianData);
  },

  async updateKajian(id, kajianData) {
    const kajian = await kajianRepository.findById(id);
    if (!kajian) {
      throw new Error('Kajian tidak ditemukan');
    }
    return await kajianRepository.update(id, kajianData);
  },

  async deleteKajian(id) {
    const kajian = await kajianRepository.findById(id);
    if (!kajian) {
      throw new Error('Kajian tidak ditemukan');
    }
    return await kajianRepository.delete(id);
  },

  async toggleKajianStatus(id) {
    const kajian = await kajianRepository.findById(id);
    if (!kajian) {
      throw new Error('Kajian tidak ditemukan');
    }
    const newStatus = kajian.status === 'aktif' ? 'nonaktif' : 'aktif';
    return await kajianRepository.updateStatus(id, newStatus);
  },
};
