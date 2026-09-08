import User from '../models/User.js';

export const userRepository = {
  async findById(id, includeRole = false, includePassword = false) {
    if (includePassword) {
      return await User.findById(id);
    }
    if (includeRole) {
      return await User.findById(id).select('-password');
    }
    return await User.findById(id).select('-password');
  },

  async findByEmail(email, includePassword = false) {
    if (includePassword) {
      return await User.findOne({ email }).select('+password');
    }
    return await User.findOne({ email }).select('-password');
  },

  async findAll(filters = {}) {
    return await User.find(filters).select('-password');
  },

  async create(userData) {
    return await User.create(userData);
  },

  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true }).select('-password');
  },

  async delete(id) {
    return await User.findByIdAndDelete(id);
  },

  async updateStatus(id, status) {
    return await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
  },
};
