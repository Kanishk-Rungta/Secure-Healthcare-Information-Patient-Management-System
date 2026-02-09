const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Patient Controller - Patient data management with security
 * Implements CRUD operations with consent validation and audit logging
 */

class PatientController {
  // Get patient profile (with consent validation)
  static async getPatientProfile(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Find patient
      const patient = await Patient.findById(patientId)
        .populate('userId', 'email profile.firstName profile.lastName profile.dateOfBirth');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }

      // Check if user can access this patient's data
      if (userRole === 'patient' && patient.userId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'PATIENT_ACCESS_DENIED'
        });
      }

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'VIEW_PATIENT_PROFILE',
        description: `User accessed patient profile for ${patient.userId.profile.firstName} ${patient.userId.profile.lastName}`,
        consentVerified: req.consentVerified || false,
        consentId: req.consentId,
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
          patient
        }
      });
    } catch (error) {
      console.error('Get patient profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get patient profile',
        code: 'PATIENT_PROFILE_ERROR'
      });
    }
  }

  // Update patient demographics
  static async updateDemographics(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      const demographics = req.body;

      // Find patient
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }

      // Check permissions
      if (userRole === 'patient' && patient.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'PATIENT_ACCESS_DENIED'
        });
      }

      // Store previous state for audit
      const previousDemographics = { ...patient.demographics };

      // Update demographics
      patient.demographics = { ...patient.demographics, ...demographics };
      await patient.save();

      // Log update
      await AuditLog.createLog({
        eventType: 'UPDATE',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'UPDATE_DEMOGRAPHICS',
        description: `Updated demographics for patient`,
        dataChanges: {
          before: previousDemographics,
          after: patient.demographics,
          changes: Object.keys(demographics)
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
        message: 'Demographics updated successfully',
        data: {
          patient
        }
      });
    } catch (error) {
      console.error('Update demographics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update demographics',
        code: 'DEMOGRAPHICS_UPDATE_ERROR'
      });
    }
  }

  // Get patient medical records
  static async getMedicalRecords(req, res) {
    try {
      const { patientId } = req.params;
      const { recordType, limit = 50, page = 1 } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Build query
      const query = {
        patientId,
        isLatestVersion: true,
        deletedAt: { $exists: false }
      };

      if (recordType) {
        query.recordType = recordType;
      }

      // Get medical records with pagination
      const skip = (page - 1) * limit;
      const records = await MedicalRecord.find(query)
        .sort({ recordDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('providerId', 'profile.firstName profile.lastName role');

      const total = await MedicalRecord.countDocuments(query);

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'medical_record',
        resourceId: patientId,
        action: 'VIEW_MEDICAL_RECORDS',
        description: `Accessed ${records.length} medical records for patient`,
        dataAccessed: {
          recordCount: records.length,
          dataType: recordType || 'all_records'
        },
        consentVerified: req.consentVerified || false,
        consentId: req.consentId,
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
          records,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get medical records error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get medical records',
        code: 'MEDICAL_RECORDS_ERROR'
      });
    }
  }

  // Create new medical record
  static async createMedicalRecord(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      const recordData = req.body;

      // Validate provider role
      const allowedRoles = ['doctor', 'receptionist', 'lab_technician', 'pharmacist'];
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create medical records',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Create medical record
      const medicalRecord = new MedicalRecord({
        patientId,
        providerId: userId,
        providerRole: userRole,
        createdBy: userId,
        ...recordData
      });

      await medicalRecord.save();

      // Log creation
      await AuditLog.createLog({
        eventType: 'CREATE',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'medical_record',
        resourceId: medicalRecord._id,
        action: 'CREATE_MEDICAL_RECORD',
        description: `Created ${recordData.recordType} record for patient`,
        dataChanges: {
          after: medicalRecord
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

      res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: {
          record: medicalRecord
        }
      });
    } catch (error) {
      console.error('Create medical record error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create medical record',
        code: 'MEDICAL_RECORD_CREATE_ERROR'
      });
    }
  }

  // Get patient visits
  static async getVisits(req, res) {
    try {
      const { patientId } = req.params;
      const { limit = 20, page = 1 } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Find patient
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }

      // Get visits with pagination
      const skip = (page - 1) * limit;
      const visits = patient.visits
        .sort({ date: -1 })
        .slice(skip, skip + parseInt(limit));

      const total = patient.visits.length;

      // Populate provider information
      await Patient.populate(patient, {
        path: 'visits.provider',
        select: 'profile.firstName profile.lastName role'
      });

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'VIEW_PATIENT_VISITS',
        description: `Accessed ${visits.length} visit records for patient`,
        dataAccessed: {
          recordCount: visits.length,
          dataType: 'visits'
        },
        consentVerified: req.consentVerified || false,
        consentId: req.consentId,
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
          visits,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get visits error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get patient visits',
        code: 'VISITS_ERROR'
      });
    }
  }

  // Add new visit
  static async addVisit(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      const visitData = req.body;

      // Validate provider role
      const allowedRoles = ['doctor', 'receptionist'];
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to add visits',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Find patient
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }

      // Add visit
      const visit = {
        ...visitData,
        provider: userId
      };

      patient.visits.push(visit);
      await patient.save();

      // Log creation
      await AuditLog.createLog({
        eventType: 'CREATE',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'ADD_PATIENT_VISIT',
        description: `Added ${visitData.type} visit for patient`,
        dataChanges: {
          after: visit
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

      res.status(201).json({
        success: true,
        message: 'Visit added successfully',
        data: {
          visit: patient.visits[patient.visits.length - 1]
        }
      });
    } catch (error) {
      console.error('Add visit error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add visit',
        code: 'VISIT_ADD_ERROR'
      });
    }
  }

  // Get patient medications
  static async getMedications(req, res) {
    try {
      const { patientId } = req.params;
      const { activeOnly = true } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Get medical records with prescription type
      const query = {
        patientId,
        recordType: 'prescription',
        isLatestVersion: true,
        deletedAt: { $exists: false }
      };

      if (activeOnly === 'true') {
        query['content.prescription.refills'] = { $gt: 0 };
      }

      const medications = await MedicalRecord.find(query)
        .sort({ recordDate: -1 })
        .populate('providerId', 'profile.firstName profile.lastName role');

      // Log access
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        targetPatientId: patientId,
        resourceType: 'medical_record',
        resourceId: patientId,
        action: 'VIEW_PATIENT_MEDICATIONS',
        description: `Accessed ${medications.length} medication records for patient`,
        dataAccessed: {
          recordCount: medications.length,
          dataType: 'medications'
        },
        consentVerified: req.consentVerified || false,
        consentId: req.consentId,
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
          medications
        }
      });
    } catch (error) {
      console.error('Get medications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get medications',
        code: 'MEDICATIONS_ERROR'
      });
    }
  }

  // Search patients (for medical staff)
  static async searchPatients(req, res) {
    try {
      const { q, limit = 20, page = 1 } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate role
      const allowedRoles = ['doctor', 'receptionist', 'administrator'];
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to search patients',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters',
          code: 'INVALID_SEARCH_QUERY'
        });
      }

      // Search patients
      const skip = (page - 1) * limit;
      const patients = await Patient.searchPatients(q)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'profile.firstName profile.lastName email');

      // Log search
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'patient',
        resourceId: null, // Use null for search events
        action: 'SEARCH_PATIENTS',
        description: `Searched patients with query: ${q}`,
        dataAccessed: {
          recordCount: patients.length,
          dataType: 'search_results'
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
          patients,
          query: q,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: patients.length
          }
        }
      });
    } catch (error) {
      console.error('Search patients error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search patients',
        code: 'PATIENT_SEARCH_ERROR'
      });
    }
  }
}

module.exports = PatientController;
