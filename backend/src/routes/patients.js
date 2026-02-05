const express = require('express');
const PatientController = require('../controllers/patientController');
const { authenticate, authorize, canAccessPatient } = require('../middleware/auth');
const { checkConsent, emergencyAccess } = require('../middleware/consent');
const { rateLimits, sanitizeInput, validateJSON } = require('../middleware/security');

const router = express.Router();

/**
 * Patient Routes - Secure patient data management endpoints
 * Implements role-based access, consent validation, and audit logging
 */

// All patient routes require authentication
router.use(authenticate);

// Search patients (medical staff only)
router.get('/search',
  authorize('doctor', 'nurse', 'administrator'),
  sanitizeInput,
  PatientController.searchPatients
);

// Patient-specific routes
router.use('/:patientId', canAccessPatient);

// Get patient profile (with consent validation)
router.get('/:patientId/profile',
  checkConsent,
  PatientController.getPatientProfile
);

// Update patient demographics
router.put('/:patientId/demographics',
  authorize('patient', 'doctor', 'nurse', 'administrator'),
  sanitizeInput,
  validateJSON,
  checkConsent,
  PatientController.updateDemographics
);

// Get medical records (with consent validation)
router.get('/:patientId/medical-records',
  checkConsent,
  PatientController.getMedicalRecords
);

// Create medical record (medical staff only)
router.post('/:patientId/medical-records',
  authorize('doctor', 'nurse', 'lab_technician', 'pharmacist'),
  sanitizeInput,
  validateJSON,
  checkConsent,
  PatientController.createMedicalRecord
);

// Get patient visits (with consent validation)
router.get('/:patientId/visits',
  checkConsent,
  PatientController.getVisits
);

// Add new visit (medical staff only)
router.post('/:patientId/visits',
  authorize('doctor', 'nurse'),
  sanitizeInput,
  validateJSON,
  checkConsent,
  PatientController.addVisit
);

// Get patient medications (with consent validation)
router.get('/:patientId/medications',
  checkConsent,
  PatientController.getMedications
);

// Emergency access override
router.post('/:patientId/emergency-access',
  authorize('doctor', 'nurse', 'administrator'),
  rateLimits.emergencyAccess,
  sanitizeInput,
  validateJSON,
  emergencyAccess,
  (req, res) => {
    res.json({
      success: true,
      message: 'Emergency access granted',
      data: {
        emergencyAccess: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  }
);

module.exports = router;
