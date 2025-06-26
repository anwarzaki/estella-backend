import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import User from '../models/user.js';

export const register = async (req, res) => {
  const { name, email, password, superKey, role } = req.body;
  // console.log('SuperKey:', superKey);
  // console.log('role is:', role);
  // console.log('Env superkey', process.env.SUPERKEY);
  try {
    if (role === 'admin' && superKey !== process.env.SUPERKEY) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const user = new User({ name, email, password , role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    const errorMessage = error.message || 'An unexpected error occurred';
    res.status(500).json({ message: errorMessage, details: error });
  }
};

// // Backend login controller
// export const login = async (req, res) => {
//   console.log('Login request received:', req.body); // Add this
//   const { email, password, superKey } = req.body;
//   // console.log('SuperKey:', superKey);
//   // console.log('Env superkey', process.env.SUPERKEY);
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     if (user.role === 'admin') {
//       if (!superKey || superKey !== process.env.SUPERKEY) {
//         return res.status(400).json({ message: 'Invalid superkey' });
//       }
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

export const login = async (req, res) => {
  const { email, password, superKey } = req.body;
  // console.log('Login request received:', req.body);
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    // If user is admin, verify superkey
    if (user.role === 'admin') {
      if (!superKey || superKey !== process.env.SUPERKEY) {
        console.log('Invalid superkey for admin');
        return res.status(400).json({ message: 'Invalid superkey for admin login' });
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // console.log('Login successful for:', email);
    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

   // forgot password controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // OTP
    user.resetToken = otp;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}`);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: '404 Server error', error });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
      // console.log('Email:', email, 'OTP:', otp);  
    const user = await User.findOne({ email, resetToken: otp, tokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email, resetToken: otp, tokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


 // logout controller
const tokenBlacklist = new Set();

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    // Send a success response
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error });
  }
};

// Middleware to check token blacklist
export const isTokenBlacklisted = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
  }

  next();
};


// Backend: src/controllers/authController.js
export const verifyAuth = async (req, res) => {
  try {
    // No need to verify token here since middleware already did it
    // We can use the user object attached by the middleware
    res.status(200).json({
      isAuthenticated: true,
      isAdmin: req.user.role === 'admin'
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};