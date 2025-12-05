import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/env.config.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Unauthorized request.' });

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token: userId not found.' });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(401).json({ message: 'Unauthorized request.' });
  }

}