const Consent = require('../models/Consent');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Consent Controller - Patient-driven consent management
 * Implements granular consent creation, management, and revocation
 */

class ConsentController {
  // Create new consent
  static async createConsent(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      const consentData = req.body;

      // Verify patient ownership or admin access
      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (!patient || patient._id.toString() !== patientId) {
          return res.status(403).json({
            success: false,
            message: 'Only patients can manage their own consent',
            code: 'PATIENT_CONSENT_ONLY'
          });
        }
      } else if (userRole !== 'administrator') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create consent',
          code: 'CONSENT_CREATE_PERMISSION_DENIED'
        });
      }

      // Verify recipient exists
      const recipient = await User.findById(consentData.recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found',
          code: 'RECIPIENT_NOT_FOUND'
        });
      }

      // Create consent
      const consent = new Consent({
        patientId,
        grantedBy: userId,
        recipientRole: recipient.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        ...consentData
      });

      await consent.save();

      // Log consent creation
      await AuditLog.createLog({
        eventType: 'CONSENT_GRANTED',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'consent',
        resourceId: consent._id,
        action: 'CREATE_CONSENT',
        description: `Granted ${consent.dataType} access to ${recipient.profile.firstName} ${recipient.profile.lastName} (${recipient.role}) for ${consent.purpose}`,
        dataChanges: {
          after: {
            recipientId: consent.recipientId,
            dataType: consent.dataType,
            purpose: consent.purpose,
            validUntil: consent.validUntil
          }
        },
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

      // Populate recipient information for response
      await consent.populate('recipientId', 'profile.firstName profile.lastName email role');

      res.status(201).json({
        success: true,
        message: 'Consent created successfully',
        data: {
          consent
        }
      });
    } catch (error) {
      console.error('Create consent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create consent',
        code: 'CONSENT_CREATE_ERROR'
      });
    }
  }

  // Get patient consents
  static async getPatientConsents(req, res) {
    try {
      const { patientId } = req.params;
      const { status = 'active' } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Verify access permissions
      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (!patient || patient._id.toString() !== patientId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to patient consents',
            code: 'PATIENT_CONSENT_ACCESS_DENIED'
          });
        }
      }

      // Get consents
      const consents = await Consent.findPatientConsents(patientId, status);

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'consent',
        resourceId: patientId,
        action: 'VIEW_PATIENT_CONSENTS',
        description: `Accessed ${consents.length} consent records for patient`,
        dataAccessed: {
          recordCount: consents.length,
          dataType: 'consent_records'
        },
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
        data: {
          consents
        }
      });
    } catch (error) {
      console.error('Get patient consents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get patient consents',
        code: 'PATIENT_CONSENTS_ERROR'
      });
    }
  }

  // Get recipient consents
  static async getRecipientConsents(req, res) {
    try {
      const { status = 'active' } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Get consents where user is recipient
      const consents = await Consent.findRecipientConsents(userId, status);

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'consent',
        resourceId: userId,
        action: 'VIEW_RECIPIENT_CONSENTS',
        description: `Accessed ${consents.length} consent records as recipient`,
        dataAccessed: {
          recordCount: consents.length,
          dataType: 'consent_records'
        },
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
        data: {
          consents
        }
      });
    } catch (error) {
      console.error('Get recipient consents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get recipient consents',
        code: 'RECIPIENT_CONSENTS_ERROR'
      });
    }
  }

  // Revoke consent
  static async revokeConsent(req, res) {
    try {
      const { consentId } = req.params;
      const { reason } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Find consent
      const consent = await Consent.findById(consentId);
      if (!consent) {
        return res.status(404).json({
          success: false,
          message: 'Consent not found',
          code: 'CONSENT_NOT_FOUND'
        });
      }

      // Verify permissions
      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (!patient || patient.patientId.toString() !== consent.patientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Only patients can revoke their own consent',
            code: 'PATIENT_CONSENT_REVOKE_ONLY'
          });
        }
      } else if (userRole !== 'administrator') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to revoke consent',
          code: 'CONSENT_REVOKE_PERMISSION_DENIED'
        });
      }

      // Revoke consent
      await consent.revokeAccess(reason, userId);

      // Log revocation
      await AuditLog.createLog({
        eventType: 'CONSENT_REVOKED',
        userId,
        userRole,
        targetPatientId: consent.patientId,
        resourceType: 'consent',
        resourceId: consent._id,
        action: 'REVOKE_CONSENT',
        description: `Revoked ${consent.dataType} access consent. Reason: ${reason}`,
        dataChanges: {
          before: { status: 'active' },
          after: { status: 'revoked', revocationReason: reason }
        },
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
        message: 'Consent revoked successfully',
        data: {
          consent
        }
      });
    } catch (error) {
      console.error('Revoke consent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to revoke consent',
        code: 'CONSENT_REVOKE_ERROR'
      });
    }
  }

  // Update consent
  static async updateConsent(req, res) {
    try {
      const { consentId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      const updates = req.body;

      // Find consent
      const consent = await Consent.findById(consentId);
      if (!consent) {
        return res.status(404).json({
          success: false,
          message: 'Consent not found',
          code: 'CONSENT_NOT_FOUND'
        });
      }

      // Verify permissions
      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (!patient || patient.patientId.toString() !== consent.patientId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Only patients can update their own consent',
            code: 'PATIENT_CONSENT_UPDATE_ONLY'
          });
        }
      } else if (userRole !== 'administrator') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update consent',
          code: 'CONSENT_UPDATE_PERMISSION_DENIED'
        });
      }

      // Store previous state for audit
      const previousConsent = { ...consent.toObject() };

      // Update consent
      Object.assign(consent, updates);
      consent.version += 1;
      await consent.save();

      // Log update
      await AuditLog.createLog({
        eventType: 'UPDATE',
        userId,
        userRole,
        targetPatientId: consent.patientId,
        resourceType: 'consent',
        resourceId: consent._id,
        action: 'UPDATE_CONSENT',
        description: `Updated consent (version ${consent.version})`,
        dataChanges: {
          before: previousConsent,
          after: consent.toObject(),
          changes: Object.keys(updates)
        },
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
        message: 'Consent updated successfully',
        data: {
          consent
        }
      });
    } catch (error) {
      console.error('Update consent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update consent',
        code: 'CONSENT_UPDATE_ERROR'
      });
    }
  }

  // Check consent status
  static async checkConsent(req, res) {
    try {
      const { patientId, recipientId, dataType, purpose } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      if (!patientId || !recipientId || !dataType) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID, recipient ID, and data type required',
          code: 'MISSING_CONSENT_CHECK_PARAMETERS'
        });
      }

      // Check consent
      const hasConsent = await Consent.checkConsent(
        patientId,
        recipientId,
        dataType,
        purpose || 'treatment'
      );

      // Get consent details if exists
      let consentDetails = null;
      if (hasConsent) {
        consentDetails = await Consent.findValidConsent(
          patientId,
          recipientId,
          dataType
        );
      }

      // Log consent check
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'consent',
        resourceId: null, // Use null for consent check events
        action: 'CHECK_CONSENT',
        description: `Checked consent for ${dataType} access`,
        dataAccessed: {
          dataType,
          purpose: purpose || 'treatment',
          consentGranted: hasConsent
        },
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
        data: {
          hasConsent,
          consentDetails
        }
      });
    } catch (error) {
      console.error('Check consent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check consent',
        code: 'CONSENT_CHECK_ERROR'
      });
    }
  }

  // Get consent statistics
  static async getConsentStats(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Verify permissions
      if (userRole === 'patient') {
        const patient = await Patient.findOne({ userId });
        if (!patient || patient._id.toString() !== patientId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied to patient consent statistics',
            code: 'PATIENT_CONSENT_STATS_ACCESS_DENIED'
          });
        }
      }

      // Get consent statistics
      const stats = await Consent.aggregate([
        { $match: { patientId: mongoose.Types.ObjectId(patientId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            statuses: {
              $push: {
                status: '$_id',
                count: '$count'
              }
            }
          }
        }
      ]);

      // Get data type breakdown
      const dataTypeStats = await Consent.aggregate([
        { $match: { patientId: mongoose.Types.ObjectId(patientId) } },
        {
          $group: {
            _id: '$dataType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'consent',
        resourceId: null, // Use null for consent stats events
        action: 'VIEW_CONSENT_STATISTICS',
        description: 'Accessed consent statistics for patient',
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
        data: {
          total: stats[0]?.total || 0,
          statusBreakdown: stats[0]?.statuses || [],
          dataTypeBreakdown: dataTypeStats
        }
      });
    } catch (error) {
      console.error('Get consent stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get consent statistics',
        code: 'CONSENT_STATS_ERROR'
      });
    }
  }
}

module.exports = ConsentController;
