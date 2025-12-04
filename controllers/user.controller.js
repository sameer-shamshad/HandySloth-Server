import mongoose from 'mongoose';
import { User } from '../models/user.model.js';

export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: 'The user id is missing. Please authenticate.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const user = await User.findById(userId).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'The user id is invalid.' });
    }

    const user = await User.findById(userId).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};
