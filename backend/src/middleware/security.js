const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Security Middleware - Comprehensive security controls
 * Implements protection against common web vulnerabilities
 */

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
      // Log rate limit violation (non-fatal)
      try {
        await AuditLog.createLog({
          eventType: 'SYSTEM_ERROR',
          userId: req.user?._id,
          userRole: req.user?.role || 'anonymous',
          resourceType: 'system',
          resourceId: null, // Use null for rate limit events
          action: 'RATE_LIMIT_VIOLATION',
          description: `Rate limit exceeded for ${req.ip} on ${req.path}`,
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
            anomalyDetails: 'Rate limit threshold exceeded'
          }
        });
      } catch (logError) {
        console.warn('Failed to log rate limit event:', logError.message);
      }

      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests, please try again later'
  ),

  // Authentication endpoints (stricter)
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts, please try again later'
  ),

  // Password reset (very strict)
  passwordReset: createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 attempts per hour
    'Too many password reset attempts, please try again later'
  ),

  // Data export (limited)
  dataExport: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 exports per hour
    'Too many data export requests, please try again later'
  ),

  // Emergency access (very limited)
  emergencyAccess: createRateLimit(
    24 * 60 * 60 * 1000, // 24 hours
    5, // 5 emergency accesses per day
    'Emergency access limit reached, please contact administrator'
  )
};

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanify URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      code: 'INVALID_INPUT'
    });
  }
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove potentially dangerous keys
    if (isSafeKey(key)) {
      sanitized[key] = sanitizeValue(value);
    }
  }

  return sanitized;
};

// Check if key is safe
const isSafeKey = (key) => {
  const dangerousPatterns = [
    /\$/,
    /\./,
    /__proto__/,
    /constructor/,
    /prototype/
  ];

  return !dangerousPatterns.some(pattern => pattern.test(key));
};

// Sanitize individual values
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove potential XSS patterns
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value);
  }

  return value;
};

// Request size limiting
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');

    if (contentLength && parseInt(contentLength) > parseSize(maxSize)) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE'
      });
    }

    next();
  };
};

// Parse size string to bytes
const parseSize = (sizeStr) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = sizeStr.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);

  if (!match) {
    return 10 * 1024 * 1024; // Default 10MB
  }

  const [, size, unit] = match;
  return parseInt(size) * units[unit];
};

// IP whitelist/blacklist middleware
const ipFilter = (options = {}) => {
  const { whitelist = [], blacklist = [] } = options;

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check blacklist first
    if (blacklist.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address',
        code: 'IP_BLOCKED'
      });
    }

    // Check whitelist if configured
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access not allowed from this IP address',
        code: 'IP_NOT_ALLOWED'
      });
    }

    next();
  };
};

// CORS configuration
const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean)
      : ['http://localhost:3000'];

    const isLocalDevOrigin = /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalDevOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-Silent-Errors'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID']
};

// Request ID middleware
const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove server information
  res.removeHeader('Server');

  next();
};

// Request logging middleware
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  console.log(`${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Log response
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`);

    // Log security events
    if (res.statusCode >= 400) {
      AuditLog.createLog({
        eventType: 'SYSTEM_ERROR',
        userId: req.user?._id || null,
        userRole: req.user?.role || 'anonymous',
        resourceType: 'system',
        resourceId: null, // Use null instead of string for system events
        action: 'HTTP_ERROR',
        description: `HTTP ${res.statusCode} on ${req.method} ${req.originalUrl}`,
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        systemDetails: {
          responseTime
        },
        securityEvent: {
          isSecurityEvent: res.statusCode >= 500,
          threatLevel: res.statusCode >= 500 ? 'medium' : 'low'
        }
      }).catch((logError) => {
        console.warn('Failed to log HTTP error event:', logError.message);
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Validate JSON payload
const validateJSON = (req, res, next) => {
  if (req.is('application/json')) {
    try {
      JSON.parse(JSON.stringify(req.body));
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON payload',
        code: 'INVALID_JSON'
      });
    }
  } else {
    next();
  }
};

module.exports = {
  rateLimits,
  helmetConfig,
  sanitizeInput,
  requestSizeLimit,
  ipFilter,
  corsConfig,
  requestId,
  securityHeaders,
  requestLogger,
  validateJSON,
  mongoSanitize
};
