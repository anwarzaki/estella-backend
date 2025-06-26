import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  logout,
  verifyAuth,
} from '../controllers/authController.js';
import  {verifyToken}  from '../middlewares/authMiddleware.js';
// import { auth, authAdmin, checkUserAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/verify', verifyToken, verifyAuth);

// // Protected routes (authentication required)
// router.post('/logout', auth, logout);
// router.get('/user/:userId', auth, checkUserAccess, getUserById);

// // Admin only routes
// router.get('/users', authAdmin, getAllUsers);
// router.delete('/user/:userId', authAdmin, deleteUser);

export default router;