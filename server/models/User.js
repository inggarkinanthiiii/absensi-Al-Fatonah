import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';
import { USER_STATUS } from '../constants/status.js';

const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
      minlength: [2, 'Nama minimal 2 karakter'],
      maxlength: [25, 'Nama maksimal 25 karakter'],
      match: [/^[A-Za-zÀ-ÿ\s]+$/, 'Nama hanya boleh berisi huruf dan spasi'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email format tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
    },
    telepon: {
      type: String,
      required: [true, 'Telepon wajib diisi'],
      trim: true,
      match: [/^[0-9]+$/, 'Nomor telepon hanya boleh berisi angka'],
      minlength: [10, 'Nomor telepon minimal 10 digit'],
      maxlength: [15, 'Nomor telepon maksimal 15 digit'],
    },
    alamat: {
      type: String,
      required: [true, 'Alamat wajib diisi'],
      trim: true,
      minlength: [5, 'Alamat minimal 5 karakter'],
      maxlength: [200, 'Alamat maksimal 200 karakter'],
    },
    role: {
      type: String,
      enum: {
        values: [ROLES.ADMIN, ROLES.JAMAAH],
        message: 'Role tidak valid',
      },
      default: ROLES.JAMAAH,
    },
    status: {
      type: String,
      enum: {
        values: [USER_STATUS.AKTIF, USER_STATUS.NONAKTIF],
        message: 'Status tidak valid',
      },
      default: USER_STATUS.AKTIF,
    },
    foto: {
      type: String,
      default: null,
    },
    tanggalRegistrasi: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
