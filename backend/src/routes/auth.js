const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, validateRefreshToken, authRateLimit } = require('../middleware/auth');
const { rateLimits, sanitizeInput, validateJSON } = require('../middleware/security');

const router = express.Router();

/**
 * Authentication Routes - Secure user authentication endpoints
 * Implements rate limiting, input validation, and security controls
 */

// Public routes (no authentication required)
router.post('/register', 
  rateLimits.auth,
  sanitizeInput,
  validateJSON,
  AuthController.register
);

router.post('/login',
  rateLimits.auth,
  sanitizeInput,
  validateJSON,
  AuthController.login
);

router.post('/refresh-token',
  rateLimits.auth,
  sanitizeInput,
  validateJSON,
  validateRefreshToken,
  AuthController.refreshToken
);

// Protected routes (authentication required)
router.post('/logout',
  authenticate,
  AuthController.logout
);

router.post('/change-password',
  authenticate,
  sanitizeInput,
  validateJSON,
  AuthController.changePassword
);

router.get('/profile',
  authenticate,
  AuthController.getProfile
);

module.exports = router;
