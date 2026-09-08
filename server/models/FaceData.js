import mongoose from 'mongoose';

const faceDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID wajib diisi'],
    },
    descriptor: {
      type: [Number],
      required: [true, 'Face descriptor wajib diisi'],
    },
    foto: {
      type: String,
      required: [true, 'Foto wajah wajib diisi'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
faceDataSchema.index({ userId: 1 });
faceDataSchema.index({ userId: 1, isActive: 1 });

const FaceData = mongoose.model('FaceData', faceDataSchema);

export default FaceData;
