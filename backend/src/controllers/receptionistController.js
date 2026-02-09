const Complaint = require('../models/Complaint');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

/**
 * Receptionist Controller - Patient complaint management
 * Implements complaint registration and tracking with audit logging
 */

class ReceptionistController {
  // Register a new complaint
  static async registerComplaint(req, res) {
    try {
      const { patientId, assignedDoctorId, description, priority, receptionistId } = req.body;

      // Validate required fields
      if (!patientId || !assignedDoctorId || !description) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: patientId, assignedDoctorId, description',
          code: 'MISSING_FIELDS'
        });
      }

      // Verify patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }

      // Verify doctor exists and is a doctor
      const doctor = await User.findById(assignedDoctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found or invalid role',
          code: 'DOCTOR_NOT_FOUND'
        });
      }

      // Get receptionist from authenticated user if not provided
      const actualReceptionistId = receptionistId || req.user._id;

      // Create new complaint
      const complaint = new Complaint({
        patientId,
        assignedDoctorId,
        receptionistId: actualReceptionistId,
        description,
        priority: priority || 'medium',
        status: 'open'
      });

      await complaint.save();

      // Populate references
      await complaint.populate('patientId', 'userId');
      await complaint.populate('assignedDoctorId', 'profile.firstName profile.lastName email');
      await complaint.populate('receptionistId', 'profile.firstName profile.lastName email');

      // Log complaint registration
      try {
        await AuditLog.createLog({
          eventType: 'CREATE',
          userId: actualReceptionistId,
          userRole: 'receptionist',
          targetPatientId: patientId,
          resourceType: 'complaint',
          resourceId: complaint._id,
          action: 'REGISTER_COMPLAINT',
          description: `Complaint registered for patient: ${description.substring(0, 100)}...`,
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
      } catch (logError) {
        console.warn('Audit log failed during complaint registration:', logError.message);
      }

      res.status(201).json({
        success: true,
        message: 'Complaint registered successfully',
        data: {
          complaint
        }
      });
    } catch (error) {
      console.error('Register complaint error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to register complaint',
        code: 'COMPLAINT_REGISTRATION_ERROR'
      });
    }
  }

  // Get all complaints (with filtering options)
  static async getComplaints(req, res) {
    try {
      const { patientId, status, priority, doctorId } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Build filter query
      const filter = {};

      if (patientId) filter.patientId = patientId;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (doctorId) filter.assignedDoctorId = doctorId;

      // Role-based access control
      if (userRole === 'receptionist') {
        // Receptionists can view only their own complaints
        filter.receptionistId = userId;
      } else if (userRole === 'doctor') {
        // Doctors can view complaints assigned to them
        filter.assignedDoctorId = userId;
      } else if (userRole === 'patient') {
        // Patients can view complaints about them
        filter.patientId = userId;
      }
      // Administrators can view all complaints

      const complaints = await Complaint.find(filter)
        .populate('patientId', 'userId')
        .populate('assignedDoctorId', 'profile.firstName profile.lastName email')
        .populate('receptionistId', 'profile.firstName profile.lastName email')
        .populate('resolvedBy', 'profile.firstName profile.lastName email')
        .sort({ createdAt: -1 });

      // Log access
      try {
        await AuditLog.createLog({
          eventType: 'READ',
          userId,
          userRole,
          resourceType: 'complaint',
          action: 'VIEW_COMPLAINTS',
          description: `User viewed ${complaints.length} complaints`,
          requestDetails: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            requestId: req.requestId || uuidv4()
          }
        });
      } catch (logError) {
        console.warn('Audit log failed during complaints view:', logError.message);
      }

      res.json({
        success: true,
        message: 'Complaints retrieved successfully',
        data: complaints
      });
    } catch (error) {
      console.error('Get complaints error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve complaints',
        code: 'GET_COMPLAINTS_ERROR'
      });
    }
  }

  // Get a specific complaint by ID
  static async getComplaintById(req, res) {
    try {
      const { complaintId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const complaint = await Complaint.findById(complaintId)
        .populate('patientId', 'userId')
        .populate('assignedDoctorId', 'profile.firstName profile.lastName email')
        .populate('receptionistId', 'profile.firstName profile.lastName email')
        .populate('resolvedBy', 'profile.firstName profile.lastName email');

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
          code: 'COMPLAINT_NOT_FOUND'
        });
      }

      // Check access rights
      if (
        userRole === 'receptionist' && complaint.receptionistId._id.toString() !== userId.toString() &&
        userRole === 'doctor' && complaint.assignedDoctorId._id.toString() !== userId.toString() &&
        userRole === 'patient' && complaint.patientId._id.toString() !== userId.toString() &&
        userRole !== 'administrator'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'COMPLAINT_ACCESS_DENIED'
        });
      }

      res.json({
        success: true,
        data: {
          complaint
        }
      });
    } catch (error) {
      console.error('Get complaint by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve complaint',
        code: 'GET_COMPLAINT_ERROR'
      });
    }
  }

  // Update complaint status
  static async updateComplaintStatus(req, res) {
    try {
      const { complaintId } = req.params;
      const { status, resolution } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate status
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: open, in_progress, resolved, closed',
          code: 'INVALID_STATUS'
        });
      }

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
          code: 'COMPLAINT_NOT_FOUND'
        });
      }

      // Only doctor or administrator can update complaint status
      if (userRole !== 'doctor' && userRole !== 'administrator') {
        return res.status(403).json({
          success: false,
          message: 'Only doctors or administrators can update complaint status',
          code: 'PERMISSION_DENIED'
        });
      }

      // Update complaint
      complaint.status = status;
      if (resolution) complaint.resolution = resolution;
      if (status === 'resolved' || status === 'closed') {
        complaint.resolvedAt = new Date();
        complaint.resolvedBy = userId;
      }

      await complaint.save();

      // Log update
      try {
        await AuditLog.createLog({
          eventType: 'UPDATE',
          userId,
          userRole,
          targetPatientId: complaint.patientId,
          resourceType: 'complaint',
          resourceId: complaint._id,
          action: 'UPDATE_COMPLAINT_STATUS',
          description: `Complaint status updated to: ${status}`,
          requestDetails: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            requestId: req.requestId || uuidv4()
          }
        });
      } catch (logError) {
        console.warn('Audit log failed during complaint status update:', logError.message);
      }

      await complaint.populate('patientId', 'userId');
      await complaint.populate('assignedDoctorId', 'profile.firstName profile.lastName email');
      await complaint.populate('receptionistId', 'profile.firstName profile.lastName email');
      await complaint.populate('resolvedBy', 'profile.firstName profile.lastName email');

      res.json({
        success: true,
        message: 'Complaint updated successfully',
        data: {
          complaint
        }
      });
    } catch (error) {
      console.error('Update complaint status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update complaint',
        code: 'UPDATE_COMPLAINT_ERROR'
      });
    }
  }
}

module.exports = ReceptionistController;
