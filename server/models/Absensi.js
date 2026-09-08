import mongoose from 'mongoose';
import { ABSENSI_STATUS } from '../constants/status.js';

const absensiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID wajib diisi'],
    },
    kajianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kajian',
      required: [true, 'Kajian ID wajib diisi'],
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal absensi wajib diisi'],
    },
    waktu: {
      type: String,
      required: [true, 'Waktu absensi wajib diisi'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu tidak valid (HH:mm)'],
    },
    status: {
      type: String,
      enum: {
        values: [ABSENSI_STATUS.HADIR, ABSENSI_STATUS.TIDAK_HADIR],
        message: 'Status tidak valid',
      },
      default: ABSENSI_STATUS.HADIR,
    },
    metode: {
      type: String,
      required: [true, 'Metode absensi wajib diisi'],
      default: 'face_recognition',
    },
    lokasi: {
      type: String,
      required: [true, 'Lokasi absensi wajib diisi'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude wajib diisi'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude wajib diisi'],
      min: -180,
      max: 180,
    },
    distance: {
      type: Number,
      required: [true, 'Distance wajib diisi'],
      min: 0,
    },
    foto: {
      type: String,
      required: [true, 'Foto absensi wajib diisi'],
    },
  },
  {
    timestamps: true,
  }
);

// Index
absensiSchema.index({ userId: 1 });
absensiSchema.index({ kajianId: 1 });
absensiSchema.index({ tanggal: 1 });

// Compound unique index untuk mencegah duplikasi absensi
absensiSchema.index({ userId: 1, kajianId: 1 }, { unique: true });

const Absensi = mongoose.model('Absensi', absensiSchema);

export default Absensi;
