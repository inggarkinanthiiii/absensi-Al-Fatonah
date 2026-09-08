import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@masjid-alhikmah.com' });
    if (existingAdmin) {
      console.log('Admin user already exists, updating role to admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role updated successfully');
    } else {
      console.log('Creating new admin user...');
      const admin = await User.create({
        nama: 'Admin Masjid',
        email: 'admin@masjid-alhikmah.com',
        telepon: '081234567890',
        alamat: 'Alamat Admin',
        password: 'admin123',
        role: 'admin',
        status: 'aktif',
      });
      console.log('Admin user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
