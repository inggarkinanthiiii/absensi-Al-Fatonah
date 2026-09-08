import Absensi from '../models/Absensi.js';
import { ABSENSI_STATUS } from '../constants/status.js';
import { getJakartaDateTime } from '../utils/jakartaTime.js';

export const absensiRepository = {
  async findById(id) {
    return await Absensi.findById(id).populate('userId kajianId');
  },

  async findAll(filters = {}) {
    return await Absensi.find(filters).populate('userId kajianId');
  },

  async create(absensiData) {
    return await Absensi.create(absensiData);
  },

  async update(id, absensiData) {
    return await Absensi.findByIdAndUpdate(id, absensiData, { new: true, runValidators: true });
  },

  async delete(id) {
    return await Absensi.findByIdAndDelete(id);
  },

  async findByUserAndKajian(userId, kajianId) {
    return await Absensi.findOne({ userId, kajianId });
  },

  async findByUserId(userId) {
    return await Absensi.find({ userId }).populate('kajianId').sort({ createdAt: -1 });
  },

  async findByKajianId(kajianId) {
    return await Absensi.find({ kajianId }).populate('userId');
  },

  async getAttendanceRekap(kajianId) {
    const User = (await import('../models/User.js')).default;
    const Kajian = (await import('../models/Kajian.js')).default;

    // Get kajian data
    const kajian = await Kajian.findById(kajianId);
    if (!kajian) {
      throw new Error('Kajian tidak ditemukan');
    }

    // Get all active jamaah
    const allJamaah = await User.find({ role: 'jamaah', status: 'aktif' });

    // Get all absensi for this kajian
    const absensiList = await Absensi.find({ kajianId }).populate('userId');

    // Create a map of userId -> absensi data
    const absensiMap = new Map();
    absensiList.forEach(absensi => {
      const userId = absensi.userId?._id || absensi.userId;
      if (userId && Object.values(ABSENSI_STATUS).includes(absensi.status)) {
        absensiMap.set(userId.toString(), absensi);
      }
    });

    // Determine if kajian is finished
    const now = new Date();
    const kajianDateTime = getJakartaDateTime(kajian.tanggal, kajian.jamSelesai);
    const isKajianFinished = now > kajianDateTime;

    // Build rekap for all jamaah
    const rekap = allJamaah.map(jamaah => {
      const absensi = absensiMap.get(jamaah._id.toString());
      let status = 'belum_presensi';
      let waktu = null;
      let metode = null;
      let distance = null;

      if (absensi) {
        status = absensi.status;
        waktu = absensi.waktu;
        metode = absensi.metode;
        distance = absensi.distance;
      } else if (isKajianFinished) {
        status = 'tidak_hadir';
      }

      return {
        _id: absensi?._id,
        userId: jamaah._id,
        nama: jamaah.nama,
        email: jamaah.email,
        status,
        waktu,
        metode,
        lokasi: absensi?.lokasi || null,
        latitude: absensi?.latitude ?? null,
        longitude: absensi?.longitude ?? null,
        distance: absensi?.distance ?? null,
        foto: absensi?.foto || null,
        kajianId,
        kajianJudul: kajian.judul,
        kajianTanggal: kajian.tanggal,
        kajianJamMulai: kajian.jamMulai,
        kajianJamSelesai: kajian.jamSelesai,
        isKajianFinished
      };
    });

    // Sort by status (hadir first, then belum_presensi/tidak_hadir), then by name
    rekap.sort((a, b) => {
      const statusOrder = { hadir: 0, belum_presensi: 1, tidak_hadir: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return String(a.nama || '').localeCompare(String(b.nama || ''));
    });

    return rekap;
  },
};
