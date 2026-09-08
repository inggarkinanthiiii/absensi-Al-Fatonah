import FaceData from '../models/FaceData.js';

export const faceDataRepository = {
  async findById(id) {
    return await FaceData.findById(id);
  },

  async findByUserId(userId) {
    return await FaceData.find({ userId });
  },

  async findActiveByUserId(userId) {
    return await FaceData.findOne({ userId, isActive: true });
  },

  async findAllActive() {
    return await FaceData.find({ isActive: true });
  },

  async create(faceData) {
    return await FaceData.create(faceData);
  },

  async update(id, faceData) {
    return await FaceData.findByIdAndUpdate(id, faceData, { new: true, runValidators: true });
  },

  async deactivateByUserId(userId) {
    return await FaceData.updateMany({ userId }, { isActive: false });
  },

  async delete(id) {
    return await FaceData.findByIdAndDelete(id);
  },
};
