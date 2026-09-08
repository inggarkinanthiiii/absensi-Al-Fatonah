import mongoose from 'mongoose';
import { KAJIAN_STATUS } from '../constants/status.js';

const kajianSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, 'Judul kajian wajib diisi'],
      trim: true,
    },
    deskripsi: {
      type: String,
      trim: true,
      default: null,
    },
    pemateri: {
      type: String,
      required: [true, 'Pemateri wajib diisi'],
      trim: true,
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal kajian wajib diisi'],
    },
    jamMulai: {
      type: String,
      required: [true, 'Jam mulai wajib diisi'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam mulai tidak valid (HH:mm)'],
    },
    jamSelesai: {
      type: String,
      required: [true, 'Jam selesai wajib diisi'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format jam selesai tidak valid (HH:mm)'],
    },
    lokasi: {
      type: String,
      required: [true, 'Lokasi wajib diisi'],
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
    radius: {
      type: Number,
      required: [true, 'Radius wajib diisi'],
      default: 50,
      min: 1,
    },
    status: {
      type: String,
      enum: {
        values: [KAJIAN_STATUS.AKTIF, KAJIAN_STATUS.NONAKTIF],
        message: 'Status tidak valid',
      },
      default: KAJIAN_STATUS.AKTIF,
    },
  },
  {
    timestamps: true,
  }
);

// Index
kajianSchema.index({ tanggal: 1 });
kajianSchema.index({ status: 1 });

// Validate jamSelesai > jamMulai
kajianSchema.pre('save', function (next) {
  if (this.jamMulai && this.jamSelesai) {
    const mulai = this.jamMulai.split(':').map(Number);
    const selesai = this.jamSelesai.split(':').map(Number);
    const mulaiMinutes = mulai[0] * 60 + mulai[1];
    const selesaiMinutes = selesai[0] * 60 + selesai[1];
    
    if (selesaiMinutes <= mulaiMinutes) {
      next(new Error('Jam selesai harus lebih besar dari jam mulai'));
      return;
    }
  }
  next();
});

const Kajian = mongoose.model('Kajian', kajianSchema);

export default Kajian;
