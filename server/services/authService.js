import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { ROLES } from '../constants/roles.js';
import User from '../models/User.js';

export const authService = {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }
    userData.role = ROLES.JAMAAH;
    const user = await userRepository.create(userData);
    return user;
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new Error('Email atau password salah');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Email atau password salah');
    }
    if (user.status !== 'aktif') {
      throw new Error('Akun tidak aktif');
    }
    const token = this.generateToken(user._id, user.role);
    return { user, token };
  },

  generateToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  },

  async getProfile(userId) {
    return await userRepository.findById(userId);
  },

  async updateProfile(userId, profileData) {
    return await userRepository.update(userId, profileData);
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error('Password lama salah');
    }
    user.password = newPassword;
    await user.save();
    return user;
  },
};
