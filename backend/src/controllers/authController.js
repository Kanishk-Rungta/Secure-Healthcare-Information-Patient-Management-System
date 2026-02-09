/**
 * AuthController
 * --------------------------------------------------
 * Handles authentication and authorization workflows:
 * - User registration
 * - Login / Logout
 * - Token refresh
 * - Password change
 * - Profile retrieval
 *
 * Security features:
 * - Password strength validation
 * - Account lockout handling
 * - Audit logging for compliance (GDPR / HIPAA)
 * - JWT token-based authentication
 */

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthController {

  /**
   * Register a new user
   * Performs:
   * - Input validation
   * - Duplicate user check
   * - Password strength validation
   * - Token generation
   * - Audit logging
   */
  static async register(req, res) {
    try {
      const { email, password, role, profile, privacy } = req.body;

      // Validate required fields
      if (!email || !password || !role || !profile) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        });
      }

      // Check existing user
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          code: 'USER_EXISTS'
        });
      }

      // Validate password security rules
      if (!AuthController.validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          code: 'WEAK_PASSWORD'
        });
      }

      // Create new user record
      const user = new User({
        email: email.toLowerCase(),
        password,
        role: role.toLowerCase(),
        profile,
        privacy: {
          ...privacy,
          dataProcessingConsent: privacy?.dataProcessingConsent || false,
          consentDate: new Date()
        }
      });

      await user.save();

      // Generate authentication tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Update last login timestamp
      user.security.lastLogin = new Date();
      await user.save();

      // Create compliance audit log
      await AuditLog.createLog({
        eventType: 'CREATE',
        userId: user._id,
        userRole: user.role,
        resourceType: 'user',
        resourceId: user._id,
        action: 'USER_REGISTRATION',
        description: `New user registered: ${user.email}`,
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        compliance: {
          gdprRelevant: true,
          hipaaRelevant: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          tokens: { accessToken, refreshToken }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  /**
   * User login
   * Performs:
   * - Credential validation
   * - Account lock verification
   * - Password verification
   * - Token generation
   * - Login audit logging
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const user = await User.findByEmail(email.toLowerCase());

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();

        // Log failed login attempt
        await AuditLog.createLog({
          eventType: 'LOGIN',
          userId: user._id,
          action: 'LOGIN_FAILED',
          description: `Failed login attempt for ${user.email}`,
          requestDetails: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            requestId: req.requestId || uuidv4()
          }
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts after successful login
      user.security.loginAttempts = 0;
      user.security.lockUntil = undefined;
      user.security.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Log successful login
      await AuditLog.createLog({
        eventType: 'LOGIN',
        userId: user._id,
        action: 'LOGIN_SUCCESS',
        description: `User logged in: ${user.email}`,
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        }
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  /**
   * Validate password strength
   * Rules:
   * - Minimum 8 characters
   * - Uppercase letter
   * - Lowercase letter
   * - Number
   * - Special character
   */
  static validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength &&
           hasUppercase &&
           hasLowercase &&
           hasNumbers &&
           hasSpecialChars;
  }
}

module.exports = AuthController;