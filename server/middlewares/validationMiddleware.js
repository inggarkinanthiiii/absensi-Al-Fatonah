export const validateRegister = (req, res, next) => {
  const { nama, email, telepon, alamat, password } = req.body;

  if (!nama || !email || !telepon || !alamat || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email format tidak valid' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  next();
};

export const validateKajian = (req, res, next) => {
  const { judul, pemateri, tanggal, jamMulai, jamSelesai, lokasi, latitude, longitude } = req.body;

  if (!judul || !pemateri || !tanggal || !jamMulai || !jamSelesai || !lokasi || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Field kajian tidak lengkap' });
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(jamMulai) || !timeRegex.test(jamSelesai)) {
    return res.status(400).json({ message: 'Format jam tidak valid (HH:mm)' });
  }

  next();
};
