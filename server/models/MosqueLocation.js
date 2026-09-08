import mongoose from 'mongoose';

const mosqueLocationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ['main'],
      unique: true,
      default: 'main',
    },
    nama: {
      type: String,
      required: [true, 'Nama lokasi wajib diisi'],
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
  },
  { timestamps: true }
);

const MosqueLocation = mongoose.model('MosqueLocation', mosqueLocationSchema);

export default MosqueLocation;
