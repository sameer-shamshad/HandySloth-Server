import jwt from 'jsonwebtoken';
import { 
  JWT_ACCESS_SECRET, 
  JWT_REFRESH_SECRET, 
  JWT_ACCESS_EXPIRY, 
  JWT_REFRESH_EXPIRY 
} from '../config/env.config.js';

export const generateAccessAndRefreshToken = async (user) => {
  const accessToken = jwt.sign(
    { userId: user._id },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const generateAccessToken = async (user) => {
  return jwt.sign(
    { userId: user._id },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
};