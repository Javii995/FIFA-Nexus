import express from 'express';
import { register, login, forgotPassword, resetPassword, getCurrentUser, logout } from '../controllers/authController';
import { authenticateApi } from '../middlewares/authMiddleware';

const router = express.Router();

// Publieke routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Beveiligde routes
router.get('/me', authenticateApi, getCurrentUser);

export default router;