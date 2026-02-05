const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Authentication Middleware - JWT-based authentication
 * Implements secure token validation and user session management
 */

// Extract JWT token from request
const extractToken = (req) => {
  let token = null;
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Check cookies as fallback
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  return token;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Main authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Find user and verify account status
    const user = await User.findById(decoded.id).select('+security.loginAttempts +security.lockUntil');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
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
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.security.lockUntil
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.token = token;
    req.requestId = req.headers['x-request-id'] || uuidv4();
    
    // Log authentication event
    await AuditLog.createLog({
      eventType: 'READ',
      userId: user._id,
      userRole: user.role,
      resourceType: 'system',
      resourceId: req.requestId,
      action: 'API_ACCESS',
      description: `User ${user.email} accessed ${req.method} ${req.originalUrl}`,
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      },
      systemDetails: {
        timestamp: new Date()
      }
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    let statusCode = 401;
    let message = 'Authentication failed';
    let code = 'AUTH_FAILED';
    
    if (error.message === 'Token expired') {
      statusCode = 401;
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    } else if (error.message === 'Invalid token') {
      statusCode = 401;
      message = 'Invalid token';
      code = 'INVALID_TOKEN';
    }
    
    return res.status(statusCode).json({
      success: false,
      message,
      code
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Permission-based authorization (more granular)
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }
      
      // Role-based permission mapping
      const rolePermissions = {
        patient: [
          'view_own_records',
          'manage_own_consent',
          'view_own_appointments',
          'update_own_profile'
        ],
        doctor: [
          'view_patient_records',
          'create_diagnosis',
          'create_prescription',
          'view_lab_results',
          'manage_appointments'
        ],
        nurse: [
          'view_patient_records',
          'update_vitals',
          'manage_medications',
          'view_appointments'
        ],
        lab_technician: [
          'view_patient_demographics',
          'create_lab_results',
          'update_lab_results'
        ],
        pharmacist: [
          'view_prescriptions',
          'manage_medications',
          'view_patient_allergies'
        ],
        administrator: [
          'manage_users',
          'view_audit_logs',
          'manage_system',
          'view_all_records'
        ]
      };
      
      const userPermissions = rolePermissions[req.user.role] || [];
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'PERMISSION_DENIED',
          required: permission,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        code: 'AUTH_ERROR'
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'active' && !user.isLocked) {
        req.user = user;
        req.token = token;
        req.requestId = req.headers['x-request-id'] || uuidv4();
      }
    }
    
    next();
  } catch (error) {
    // Silently continue for optional auth
    next();
  }
};

// Refresh token validation
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_INVALID'
    });
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + ':' + req.path;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old attempts
    if (attempts.has(key)) {
      attempts.set(key, attempts.get(key).filter(time => time > windowStart));
    }
    
    const userAttempts = attempts.get(key) || [];
    
    if (userAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userAttempts[0] + windowMs - now) / 1000)
      });
    }
    
    userAttempts.push(now);
    attempts.set(key, userAttempts);
    
    next();
  };
};

// Check if user can access patient data
const canAccessPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID required',
        code: 'PATIENT_ID_REQUIRED'
      });
    }
    
    // Patients can only access their own data
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ userId: req.user._id });
      
      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to patient records',
          code: 'PATIENT_ACCESS_DENIED'
        });
      }
    }
    
    req.patientId = patientId;
    next();
  } catch (error) {
    console.error('Patient access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Access check failed',
      code: 'ACCESS_CHECK_ERROR'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  hasPermission,
  optionalAuth,
  validateRefreshToken,
  authRateLimit,
  canAccessPatient,
  extractToken,
  verifyToken
};
