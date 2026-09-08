import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ERROR_MESSAGES } from '../constants/errors.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: ERROR_MESSAGES.TOKEN_INVALID });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      }
      return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
  }

  if (!token) {
    return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: ERROR_MESSAGES.FORBIDDEN });
    }
    next();
  };
};
