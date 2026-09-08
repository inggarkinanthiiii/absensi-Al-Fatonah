import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res) {
    try {
      const { nama, email, telepon, alamat, password } = req.body;
      const user = await authService.register({ nama, email, telepon, alamat, password });
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: { user },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: { user, token },
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  async getMe(req, res) {
    try {
      const user = await authService.getProfile(req.user._id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nama, email, telepon, alamat, foto } = req.body;
      const user = await authService.updateProfile(req.user._id, { nama, email, telepon, alamat, foto });
      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: { user },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await authService.changePassword(req.user._id, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password berhasil diubah',
        data: { user },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
