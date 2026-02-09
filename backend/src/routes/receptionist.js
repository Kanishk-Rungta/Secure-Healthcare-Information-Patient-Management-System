const express = require('express');
const ReceptionistController = require('../controllers/receptionistController');
const { authenticate, authorize } = require('../middleware/auth');
const { sanitizeInput, validateJSON } = require('../middleware/security');

const router = express.Router();

/**
 * Receptionist Routes - Patient complaint management endpoints
 * Implements role-based access and audit logging
 */

// All receptionist routes require authentication
router.use(authenticate);

// Register a new complaint
router.post('/register-complaint',
  authorize('receptionist', 'administrator'),
  sanitizeInput,
  validateJSON,
  ReceptionistController.registerComplaint
);

// Get all complaints
router.get('/complaints',
  sanitizeInput,
  ReceptionistController.getComplaints
);

// Get a specific complaint
router.get('/complaints/:complaintId',
  sanitizeInput,
  ReceptionistController.getComplaintById
);

// Update complaint status
router.put('/complaints/:complaintId/status',
  authorize('doctor', 'administrator'),
  sanitizeInput,
  validateJSON,
  ReceptionistController.updateComplaintStatus
);

module.exports = router;
