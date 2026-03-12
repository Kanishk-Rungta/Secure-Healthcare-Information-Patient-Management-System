/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app as a serverless function handler
 */

require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('express-async-errors');

const { connectDB } = require('../backend/src/config/database');
const { helmetConfig, corsConfig, requestId, securityHeaders, requestLogger, mongoSanitize } = require('../backend/src/middleware/security');

// Import routes
const authRoutes = require('../backend/src/routes/auth');
const patientRoutes = require('../backend/src/routes/patients');
const consentRoutes = require('../backend/src/routes/consent');
const assignmentRoutes = require('../backend/src/routes/assignments');
const receptionistRoutes = require('../backend/src/routes/receptionist');
const adminRoutes = require('../backend/src/routes/admin');

const app = express();

// Ensure JWT secrets are configured
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

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    const seed = crypto.randomBytes(8).toString('hex');
    process.env.JWT_SECRET = process.env.JWT_SECRET || `dev_jwt_${seed}`;
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `dev_refresh_${seed}`;
  }
};

ensureJwtSecrets();

// Setup middleware
app.use(requestId);
app.use(morgan('combined'));
app.use(compression());
app.use(cors(corsConfig));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security middleware
app.use(mongoSanitize());
app.use(securityHeaders);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Healthcare Management System API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      consent: '/api/consent',
      assignments: '/api/assignments',
      receptionist: '/api/receptionist',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', {
    message: error.message,
    status: error.status || 500,
    timestamp: new Date().toISOString()
  });

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

// Initialize database connection (with timeout to prevent serverless function timeout)
let dbConnected = false;

const initializeDb = async () => {
  if (dbConnected) return;
  try {
    await connectDB();
    dbConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    dbConnected = false;
  }
};

// Initialize database before first request
let initialized = false;

app.use(async (req, res, next) => {
  if (!initialized) {
    await initializeDb();
    initialized = true;
  }
  next();
});

// Export for Vercel
module.exports = app;
