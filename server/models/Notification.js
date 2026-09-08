import mongoose from 'mongoose';
import { NOTIFICATION_TYPE, NOTIFICATION_RELATED_TYPE } from '../constants/status.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID wajib diisi'],
    },
    type: {
      type: String,
      enum: {
        values: [NOTIFICATION_TYPE.ABSENSI, NOTIFICATION_TYPE.IZIN, NOTIFICATION_TYPE.JAMAAH_BARU, NOTIFICATION_TYPE.STATISTIK],
        message: 'Type tidak valid',
      },
      required: [true, 'Type wajib diisi'],
    },
    title: {
      type: String,
      required: [true, 'Title wajib diisi'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message wajib diisi'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedType: {
      type: String,
      enum: {
        values: [NOTIFICATION_RELATED_TYPE.ABSENSI, NOTIFICATION_RELATED_TYPE.IZIN, NOTIFICATION_RELATED_TYPE.USER],
        message: 'Related type tidak valid',
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
