const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const Patient = require('../models/Patient');
const { v4: uuidv4 } = require('uuid');

/**
 * Consent Middleware - Patient-driven consent management
 * Enforces consent validation before data access
 * Critical for GDPR/HIPAA compliance
 */

// Check if user has valid consent to access patient data
const checkConsent = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID required',
        code: 'PATIENT_ID_REQUIRED'
      });
    }

    // Skip consent check for administrators (with audit logging)
    if (userRole === 'administrator') {
      await logConsentBypass(req, 'administrator_access');
      return next();
    }

    // Skip consent check if user is accessing their own data
    if (userRole === 'patient') {
      const patient = await Patient.findOne({ userId });
      if (patient && patient._id.toString() === patientId) {
        return next();
      }
    }

    // Determine data type based on request
    const dataType = determineDataType(req);

    // Determine purpose based on endpoint
    const purpose = determinePurpose(req);

    console.log(`Checking consent for patient ${patientId}, user ${userId} (${userRole}), dataType: ${dataType}, purpose: ${purpose}`);

    // Check for valid consent
    const hasValidConsent = await Consent.checkConsent(
      patientId,
      userId,
      dataType,
      purpose
    );

    if (!hasValidConsent) {
      console.log(`Consent denied for ${dataType}/${purpose}`);
      // Log consent violation
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'CONSENT_VIOLATION',
        description: `User attempted to access ${dataType} without valid consent`,
        consentVerified: false,
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
          anomalyDetails: 'Unauthorized data access attempt'
        },
        compliance: {
          gdprRelevant: true,
          hipaaRelevant: true
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Patient consent required for this access',
        code: 'CONSENT_REQUIRED',
        dataType,
        purpose
      });
    }

    // Get the consent record for logging
    const consent = await Consent.findValidConsent(
      patientId,
      userId,
      dataType
    );

    if (consent) {
      // Increment access count
      await consent.incrementAccess();

      // Log successful consent-verified access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'CONSENT_VERIFIED_ACCESS',
        description: `User accessed ${dataType} with valid consent`,
        consentVerified: true,
        consentId: consent._id,
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        }
      });
    }

    req.consentVerified = true;
    req.consentId = consent?._id;

    next();
  } catch (error) {
    console.error('Consent check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Consent verification failed',
      code: 'CONSENT_CHECK_ERROR'
    });
  }
};

// Emergency access override with justification
const emergencyAccess = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const { emergencyReason, emergencyJustification } = req.body;

    if (!emergencyReason || !emergencyJustification) {
      return res.status(400).json({
        success: false,
        message: 'Emergency access requires reason and justification',
        code: 'EMERGENCY_ACCESS_DETAILS_REQUIRED'
      });
    }

    // Only certain roles can request emergency access
    const emergencyRoles = ['doctor', 'receptionist', 'administrator'];
    if (!emergencyRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Emergency access not permitted for this role',
        code: 'EMERGENCY_ACCESS_NOT_PERMITTED'
      });
    }

    // Create or update consent with emergency access
    const consent = await Consent.findOne({
      patientId,
      recipientId: userId,
      dataType: 'all_records',
      status: 'active'
    });

    if (consent) {
      await consent.enableEmergencyAccess(
        emergencyReason,
        emergencyJustification,
        userId
      );
    } else {
      // Create emergency consent
      const newConsent = new Consent({
        patientId,
        recipientId: userId,
        recipientRole: userRole,
        dataType: 'all_records',
        purpose: 'emergency_care',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        grantedBy: userId, // In emergency, provider grants access
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        emergencyAccess: {
          isEmergency: true,
          emergencyReason,
          emergencyJustification,
          approvedBy: userId
        }
      });

      await newConsent.save();
    }

    // Log emergency access
    await AuditLog.createLog({
      eventType: 'EMERGENCY_ACCESS',
      userId,
      userRole,
      targetPatientId: patientId,
      resourceType: 'patient',
      resourceId: patientId,
      action: 'EMERGENCY_ACCESS_GRANTED',
      description: `Emergency access granted: ${emergencyReason}`,
      emergencyAccess: {
        isEmergency: true,
        emergencyReason,
        emergencyJustification,
        approvedBy: userId
      },
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        requestId: req.requestId || uuidv4()
      },
      securityEvent: {
        isSecurityEvent: true,
        threatLevel: 'high'
      },
      compliance: {
        gdprRelevant: true,
        hipaaRelevant: true
      }
    });

    req.emergencyAccess = true;
    next();
  } catch (error) {
    console.error('Emergency access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Emergency access failed',
      code: 'EMERGENCY_ACCESS_ERROR'
    });
  }
};

// Helper function to determine data type from request
const determineDataType = (req) => {
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();

  // Map endpoints to data types
  const endpointMapping = {
    '/demographics': 'demographics',
    '/medical-history': 'medical_history',
    '/visits': 'visits',
    '/medications': 'medications',
    '/lab-results': 'lab_results',
    '/lab-reports': 'lab_results',
    '/prescriptions': 'prescriptions',
    '/vitals': 'vital_signs',
    '/billing': 'billing'
  };

  for (const [endpoint, dataType] of Object.entries(endpointMapping)) {
    if (path.includes(endpoint)) {
      return dataType;
    }
  }

  // Handle /medical-records endpoint specifically
  if (path.includes('/medical-records')) {
    // Try to get recordType from query (GET) or body (POST)
    const recordType = req.query.recordType || req.body.recordType;

    if (recordType === 'prescription') return 'prescriptions';
    if (recordType === 'lab_result') return 'lab_results';
    if (recordType === 'diagnosis') return 'medical_history';
    if (recordType === 'billing') return 'billing';

    // Default for /medical-records is all_records
    return 'all_records';
  }

  // Default to all_records for general patient access
  return 'all_records';
};

// Helper function to determine purpose from request
const determinePurpose = (req) => {
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();
  const recordType = req.query.recordType || req.body.recordType;
  // Emergency endpoints
  if (path.includes('/emergency')) {
    return 'emergency_care';
  }

  // Treatment-related
  if (path.includes('/treatment') || path.includes('/prescription') || recordType === 'prescription' || recordType === 'medication') {
    return 'treatment';
  }

  // Diagnosis-related
  if (path.includes('/diagnosis') || path.includes('/lab-result') || path.includes('/lab-reports') || recordType === 'lab_result' || recordType === 'diagnosis') {
    return 'diagnosis';
  }

  // Follow-up
  if (path.includes('/follow-up')) {
    return 'follow_up';
  }

  // Billing
  if (path.includes('/billing') || recordType === 'billing') {
    return 'billing';
  }

  // Default to treatment for medical access
  return 'treatment';
};

// Log consent bypass for administrators
const logConsentBypass = async (req, reason) => {
  try {
    await AuditLog.createLog({
      eventType: 'READ',
      userId: req.user._id,
      userRole: req.user.role,
      targetPatientId: req.patientId,
      resourceType: 'patient',
      resourceId: req.patientId,
      action: 'CONSENT_BYPASS',
      description: `Administrator bypassed consent check: ${reason}`,
      consentVerified: false,
      requestDetails: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        requestId: req.requestId || uuidv4()
      },
      securityEvent: {
        isSecurityEvent: true,
        threatLevel: 'medium'
      },
      compliance: {
        gdprRelevant: true,
        hipaaRelevant: true
      }
    });
  } catch (error) {
    console.error('Failed to log consent bypass:', error);
  }
};

// Middleware to check if patient has granted consent for specific data type
const patientConsentCheck = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { dataType, recipientId } = req.body;

    if (!patientId || !dataType || !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, data type, and recipient ID required',
        code: 'MISSING_CONSENT_PARAMETERS'
      });
    }

    // Verify user is the patient or administrator
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });

      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Only patients can manage their own consent',
          code: 'PATIENT_CONSENT_ONLY'
        });
      }
    } else if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to manage consent',
        code: 'CONSENT_MANAGE_PERMISSION_DENIED'
      });
    }

    next();
  } catch (error) {
    console.error('Patient consent check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Consent management check failed',
      code: 'CONSENT_MANAGE_ERROR'
    });
  }
};

// Validate consent parameters
const validateConsentData = (req, res, next) => {
  try {
    const {
      recipientId,
      dataType,
      purpose,
      validUntil,
      limitations
    } = req.body;

    const errors = [];

    // Validate recipient
    if (!recipientId) {
      errors.push('Recipient ID is required');
    }

    // Validate data type
    const validDataTypes = [
      'demographics',
      'medical_history',
      'visits',
      'medications',
      'lab_results',
      'prescriptions',
      'billing',
      'all_records'
    ];

    if (!validDataTypes.includes(dataType)) {
      errors.push('Invalid data type');
    }

    // Validate purpose
    const validPurposes = [
      'treatment',
      'diagnosis',
      'emergency_care',
      'follow_up',
      'research',
      'quality_assurance',
      'billing',
      'legal_compliance'
    ];

    if (!validPurposes.includes(purpose)) {
      errors.push('Invalid purpose');
    }

    // Validate validity period
    if (!validUntil || new Date(validUntil) <= new Date()) {
      errors.push('Valid until date must be in the future');
    }

    // Validate limitations
    if (limitations && limitations.maxAccessCount && limitations.maxAccessCount < 1) {
      errors.push('Max access count must be at least 1');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Consent validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Consent validation failed',
      code: 'CONSENT_VALIDATION_ERROR'
    });
  }
};

module.exports = {
  checkConsent,
  emergencyAccess,
  patientConsentCheck,
  validateConsentData,
  determineDataType,
  determinePurpose
};
