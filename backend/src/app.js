// Load environment variables first
require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('express-async-errors');

const { connectDB } = require('./config/database');
const { helmetConfig, corsConfig, requestId, securityHeaders, requestLogger, mongoSanitize } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const consentRoutes = require('./routes/consent');
const assignmentRoutes = require('./routes/assignments');

/**
 * Main Application - Secure healthcare system entry point
 * Implements comprehensive security middleware and error handling
 */

const app = express();

// Ensure JWT secrets are configured (dev fallback to avoid auth failures)
const ensureJwtSecrets = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      throw new Error('JWT_SECRET is not configured');
    }
    process.env.JWT_SECRET = 'dev_jwt_secret_change_me';
    console.warn('⚠️  JWT_SECRET missing. Using development fallback secret.');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    if (isProduction) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    process.env.JWT_REFRESH_SECRET = 'dev_jwt_refresh_secret_change_me';
    console.warn('⚠️  JWT_REFRESH_SECRET missing. Using development fallback secret.');
  }

  // Optional: derive a stable fallback if either secret is still missing
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    const seed = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = process.env.JWT_SECRET || `dev_jwt_${seed}`;
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `dev_refresh_${seed}`;
  }
};

ensureJwtSecrets();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsConfig));
app.use(securityHeaders);
app.use(requestId);

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize());
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/assignments', assignmentRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Healthcare Information System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh-token': 'Refresh access token',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/change-password': 'Change password',
        'GET /api/auth/profile': 'Get user profile'
      },
      patients: {
        'GET /api/patients/search': 'Search patients (medical staff)',
        'GET /api/patients/:patientId/profile': 'Get patient profile',
        'PUT /api/patients/:patientId/demographics': 'Update demographics',
        'GET /api/patients/:patientId/medical-records': 'Get medical records',
        'POST /api/patients/:patientId/medical-records': 'Create medical record',
        'GET /api/patients/:patientId/visits': 'Get patient visits',
        'POST /api/patients/:patientId/visits': 'Add new visit',
        'GET /api/patients/:patientId/medications': 'Get patient medications',
        'POST /api/patients/:patientId/emergency-access': 'Emergency access override'
      },
      consent: {
        'POST /api/consent/patients/:patientId': 'Create consent',
        'GET /api/consent/patients/:patientId': 'Get patient consents',
        'GET /api/consent/my-consents': 'Get recipient consents',
        'PUT /api/consent/:consentId/revoke': 'Revoke consent',
        'PUT /api/consent/:consentId': 'Update consent',
        'GET /api/consent/check': 'Check consent status',
        'GET /api/consent/patients/:patientId/stats': 'Get consent statistics'
      }
    },
    security: {
      authentication: 'JWT Bearer Token',
      authorization: 'Role-based access control',
      consent: 'Patient-driven consent management',
      audit: 'Comprehensive audit logging',
      encryption: 'Field-level encryption for sensitive data'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Log error only if database is available
  try {
    const AuditLog = require('./models/AuditLog');
    AuditLog.createLog({
      eventType: 'SYSTEM_ERROR',
      userId: req.user?._id,
      userRole: req.user?.role || 'anonymous',
      resourceType: 'system',
      resourceId: null, // Use null for global error events
      action: 'UNHANDLED_ERROR',
      description: `Unhandled error: ${error.message}`,
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      },
      systemDetails: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      securityEvent: {
        isSecurityEvent: true,
        threatLevel: 'high'
      }
    }).catch(logError => {
      console.warn('Failed to log error to database:', logError.message);
    });
  } catch (logError) {
    console.warn('Audit logging not available:', logError.message);
  }

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status(error.status || 500).json({
    success: false,
    message,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    const dbConnection = await connectDB();

    if (dbConnection) {
      console.log('✅ Database connected successfully');
    } else {
      console.warn('⚠️  Database not connected - running in limited mode');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Healthcare API Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${dbConnection ? 'Connected' : 'Not Connected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
