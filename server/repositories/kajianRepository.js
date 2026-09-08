import Kajian from '../models/Kajian.js';

export const kajianRepository = {
  async findById(id) {
    return await Kajian.findById(id);
  },

  async findAll(filters = {}) {
    return await Kajian.find(filters);
  },

  async create(kajianData) {
    return await Kajian.create(kajianData);
  },

  async update(id, kajianData) {
    return await Kajian.findByIdAndUpdate(id, kajianData, { new: true, runValidators: true });
  },

  async delete(id) {
    return await Kajian.findByIdAndDelete(id);
  },

  async updateStatus(id, status) {
    return await Kajian.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  },
};
