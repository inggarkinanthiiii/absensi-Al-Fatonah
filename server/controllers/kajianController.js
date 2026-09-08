import { kajianService } from '../services/kajianService.js';
import { mosqueLocationService } from '../services/mosqueLocationService.js';

export const kajianController = {
  async getMainLocation(req, res) {
    try {
      const location = await mosqueLocationService.getMainLocation();
      res.status(200).json({ success: true, data: { location } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async saveMainLocation(req, res) {
    try {
      const { latitude, longitude } = req.body;
      if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
        return res.status(400).json({ success: false, message: 'Koordinat lokasi tidak valid' });
      }

      const location = await mosqueLocationService.saveMainLocation({
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      res.status(200).json({ success: true, message: 'Lokasi utama berhasil disimpan', data: { location } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAllKajian(req, res) {
    try {
      const { status, search } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (search) {
        filters.$or = [
          { judul: { $regex: search, $options: 'i' } },
          { pemateri: { $regex: search, $options: 'i' } },
        ];
      }
      const kajian = await kajianService.getAllKajian(filters);
      res.status(200).json({
        success: true,
        count: kajian.length,
        data: { kajian },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getKajianById(req, res) {
    try {
      const kajian = await kajianService.getKajianById(req.params.id);
      res.status(200).json({
        success: true,
        data: { kajian },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async createKajian(req, res) {
    try {
      const kajian = await kajianService.createKajian(req.body);
      res.status(201).json({
        success: true,
        message: 'Kajian berhasil dibuat',
        data: { kajian },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateKajian(req, res) {
    try {
      const kajian = await kajianService.updateKajian(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Kajian berhasil diperbarui',
        data: { kajian },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteKajian(req, res) {
    try {
      await kajianService.deleteKajian(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Kajian berhasil dihapus',
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async toggleKajianStatus(req, res) {
    try {
      const kajian = await kajianService.toggleKajianStatus(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Status kajian berhasil diperbarui',
        data: { kajian },
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};
