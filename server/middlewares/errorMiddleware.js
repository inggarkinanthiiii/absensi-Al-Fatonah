export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} sudah terdaftar` });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token tidak valid' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token telah kadaluarsa' });
  }

  res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
};

export const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
};
