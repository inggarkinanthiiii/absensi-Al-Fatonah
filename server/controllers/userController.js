import { userService } from '../services/userService.js';

export const userController = {
  async getAllUsers(req, res) {
    try {
      const { role, status, search } = req.query;
      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status = status;
      if (search) {
        filters.$or = [
          { nama: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      const users = await userService.getAllUsers(filters);
      res.status(200).json({
        success: true,
        count: users.length,
        data: { users },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: { user },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'User berhasil diperbarui',
        data: { user },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({
        success: true,
        message: 'User berhasil dihapus',
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async toggleUserStatus(req, res) {
    try {
      const user = await userService.toggleUserStatus(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Status user berhasil diperbarui',
        data: { user },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};
