const express = require('express');
const ConsentController = require('../controllers/consentController');
const { authenticate, authorize } = require('../middleware/auth');
const { patientConsentCheck, validateConsentData } = require('../middleware/consent');
const { sanitizeInput, validateJSON } = require('../middleware/security');

const router = express.Router();

/**
 * Consent Routes - Patient-driven consent management endpoints
 * Implements granular consent creation, management, and revocation
 */

// All consent routes require authentication
router.use(authenticate);

// Create new consent
router.post('/patients/:patientId',
  patientConsentCheck,
  validateConsentData,
  sanitizeInput,
  validateJSON,
  ConsentController.createConsent
);

// Get patient consents
router.get('/patients/:patientId',
  sanitizeInput,
  ConsentController.getPatientConsents
);

// Get recipient consents (user's own consents as recipient)
router.get('/my-consents',
  sanitizeInput,
  ConsentController.getRecipientConsents
);

// Revoke consent
router.put('/:consentId/revoke',
  sanitizeInput,
  validateJSON,
  ConsentController.revokeConsent
);

// Update consent
router.put('/:consentId',
  validateConsentData,
  sanitizeInput,
  validateJSON,
  ConsentController.updateConsent
);

// Check consent status
router.get('/check',
  sanitizeInput,
  ConsentController.checkConsent
);

// Get consent statistics
router.get('/patients/:patientId/stats',
  sanitizeInput,
  ConsentController.getConsentStats
);

module.exports = router;
