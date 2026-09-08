import { userRepository } from '../repositories/userRepository.js';

export const userService = {
  async getAllUsers(filters = {}) {
    return await userRepository.findAll(filters);
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    return user;
  },

  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }
    return await userRepository.create(userData);
  },

  async updateUser(id, userData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    if (userData.email && userData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email sudah terdaftar');
      }
    }
    return await userRepository.update(id, userData);
  },

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    return await userRepository.delete(id);
  },

  async toggleUserStatus(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    const newStatus = user.status === 'aktif' ? 'nonaktif' : 'aktif';
    return await userRepository.updateStatus(id, newStatus);
  },
};
