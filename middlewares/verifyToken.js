import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/env.config.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: 'Unauthorized request.' });

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized request.' });
  }

}