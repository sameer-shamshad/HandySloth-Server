import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { JWT_REFRESH_SECRET } from '../config/env.config.js';
import { generateAccessToken, generateAccessAndRefreshToken } from '../services/token.service.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists.' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    return res.status(201).json({ 
      message: 'User registered successfully.',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ 
        message: 'The email or password is incorrect.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'The email or password is incorrect.' 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    // Store refresh token in user model
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: 'Login successfully.',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const checkSession = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password -__v -recentlyViewedTools');

    if (!user) {
      return res.status(404).json({  message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Check session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    // Validate input
    if (!token)
      return res.status(400).json({ message: 'The refresh token is required.' });

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'The refresh token is invalid or expired.' });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password -__v -recentlyViewedTools');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the refresh token matches the one stored in database
    if (user.refreshToken !== token)
      return res.status(401).json({ message: 'The refresh token is invalid.' });

    // Generate new access token
    const accessToken = await generateAccessToken(user);

    return res.status(200).json({ accessToken, user, refreshToken: user.refreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'The refresh token is invalid or expired.' });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the refresh token matches the one stored in database
    if (user.refreshToken !== token) {
      return res.status(401).json({ message: 'The refresh token is invalid.' });
    }

    // Clear refresh token from database
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}