const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Authentication Controller - Secure user authentication
 * Implements login, registration, token management with security best practices
 */

class AuthController {
  // User registration with validation and security checks
  static async register(req, res) {
    try {
      const {
        email,
        password,
        role,
        profile,
        privacy
      } = req.body;

      // Validate required fields
      if (!email || !password || !role || !profile) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          code: 'USER_EXISTS'
        });
      }

      // Validate password strength
      if (!AuthController.validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          code: 'WEAK_PASSWORD',
          requirements: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        });
      }

      // Create new user
      try {
        const user = new User({
          email: email.toLowerCase(),
          password,
          role: role.toLowerCase(), // Convert role to lowercase to match enum
          profile,
          privacy: {
            ...privacy,
            dataProcessingConsent: privacy?.dataProcessingConsent || false,
            consentDate: new Date()
          }
        });

        await user.save();

        // Generate tokens
        const accessToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Update last login
        user.security.lastLogin = new Date();
        await user.save();

        // Log registration event
        try {
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
        } catch (logError) {
          console.warn('Audit log failed during registration:', logError.message);
        }

        // Return user data without sensitive information
        const userResponse = user.toJSON();

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: userResponse,
            tokens: {
              accessToken,
              refreshToken
            }
          }
        });
      } catch (validationError) {
        // Handle Mongoose validation errors
        console.error('User validation error:', validationError.message);
        if (validationError.name === 'ValidationError') {
          const errors = Object.values(validationError.errors).map(err => {
            console.error(`Validation error on ${err.path}: ${err.message}`);
            return err.message;
          });
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors,
            code: 'VALIDATION_ERROR'
          });
        }
        throw validationError; // Re-throw non-validation errors
      }
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  // User login with security checks
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

      // Find user with password field
      const user = await User.findByEmail(email.toLowerCase());

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check account lockout
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.security.lockUntil
        });
      }

      // Check account status
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();

        // Log failed login
        try {
          await AuditLog.createLog({
            eventType: 'LOGIN',
            userId: user._id,
            userRole: user.role,
            resourceType: 'user',
            resourceId: user._id,
            action: 'LOGIN_FAILED',
            description: `Failed login attempt for ${user.email}`,
            requestDetails: {
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              endpoint: req.originalUrl,
              method: req.method,
              requestId: req.requestId || uuidv4()
            },
            securityEvent: {
              isSecurityEvent: true,
              threatLevel: 'medium',
              anomalyDetected: true,
              anomalyDetails: 'Invalid password attempt'
            }
          });
        } catch (logError) {
          console.warn('Audit log failed during failed login:', logError.message);
        }

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Reset login attempts on successful login
      if (user.security.loginAttempts > 0) {
        user.security.loginAttempts = 0;
        user.security.lockUntil = undefined;
      }

      // Update last login
      user.security.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Log successful login
      try {
        await AuditLog.createLog({
          eventType: 'LOGIN',
          userId: user._id,
          userRole: user.role,
          resourceType: 'user',
          resourceId: user._id,
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
      } catch (logError) {
        console.warn('Audit log failed during login success:', logError.message);
      }

      // Return user data without sensitive information
      const userResponse = user.toJSON();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '15m'
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }

  // Token refresh
  static async refreshToken(req, res) {
    try {
      const user = req.user;

      // Generate new tokens
      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Log token refresh
      await AuditLog.createLog({
        eventType: 'LOGIN',
        userId: user._id,
        userRole: user.role,
        resourceType: 'system',
        resourceId: null, // Use null for token refresh events
        action: 'TOKEN_REFRESH',
        description: `Token refreshed for user: ${user.email}`,
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
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '15m'
          }
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const user = req.user;

      // Log logout
      await AuditLog.createLog({
        eventType: 'LOGOUT',
        userId: user._id,
        userRole: user.role,
        resourceType: 'user',
        resourceId: user._id,
        action: 'USER_LOGOUT',
        description: `User logged out: ${user.email}`,
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
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  // Password change
  static async changePassword(req, res) {
    try {
      const user = req.user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current and new passwords required',
          code: 'MISSING_PASSWORDS'
        });
      }

      // Verify current password
      const userWithPassword = await User.findById(user._id).select('+password');
      const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Validate new password
      if (!AuthController.validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: 'New password does not meet security requirements',
          code: 'WEAK_NEW_PASSWORD'
        });
      }

      // Update password
      userWithPassword.password = newPassword;
      await userWithPassword.save();

      // Log password change
      await AuditLog.createLog({
        eventType: 'PASSWORD_CHANGE',
        userId: user._id,
        userRole: user.role,
        resourceType: 'user',
        resourceId: user._id,
        action: 'PASSWORD_CHANGED',
        description: `Password changed for user: ${user.email}`,
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

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      return res.status(500).json({
        success: false,
        message: 'Password change failed',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        code: 'PROFILE_ERROR'
      });
    }
  }

  // Password validation helper
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