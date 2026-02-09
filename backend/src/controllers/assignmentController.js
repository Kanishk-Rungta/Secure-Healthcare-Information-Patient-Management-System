const Assignment = require('../models/Assignment');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

class AssignmentController {
  /**
   * Get all assignments (receptionist view)
   * GET /api/assignments
   */
  static async getAllAssignments(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      // Only receptionist and administrator can view all assignments
      if (!['receptionist', 'administrator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Get all assignments
      const assignments = await Assignment.find({
        deletedAt: { $exists: false }
      })
        .populate({
          path: 'doctorId',
          select: '_id email profile.firstName profile.lastName profile.professionalInfo.specialization'
        })
        .populate({
          path: 'patientId',
          select: '_id email profile.firstName profile.lastName profile.dateOfBirth'
        })
        .populate({
          path: 'assignedBy',
          select: '_id profile.firstName profile.lastName'
        })
        .sort({ createdAt: -1 })
        .lean();

      // Log audit
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'assignment',
        action: 'GET_ALL_ASSIGNMENTS',
        description: `Viewed all doctor-patient assignments`,
        dataAccessed: {
          assignmentCount: assignments.length
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching assignments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all users by role (for receptionist dropdown)
   * GET /api/assignments/users/:role?search=term&limit=20&page=1
   */
  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const { search = '', limit = 20, page = 1 } = req.query;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate role parameter
      const validRoles = ['patient', 'doctor', 'receptionist', 'lab_technician', 'pharmacist', 'administrator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role parameter'
        });
      }

      // Only receptionist and administrators can fetch users by role
      if (!['receptionist', 'administrator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Build search filter
      let filter = {
        role,
        status: 'active',
        deletedAt: { $exists: false }
      };

      if (search && search.length >= 2) {
        filter.$or = [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Paginate
      const skip = (page - 1) * limit;
      const users = await User.find(filter)
        .select('_id email profile.firstName profile.lastName profile.professionalInfo')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await User.countDocuments(filter);

      // Log audit
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'user',
        action: 'FETCH_USERS_BY_ROLE',
        description: `Fetched ${role}s${search ? ` matching: ${search}` : ''}`,
        dataAccessed: {
          role,
          recordCount: users.length
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Assign doctor to patient
   * POST /api/assignments
   */
  static async assignDoctor(req, res) {
    try {
      const { doctorId, patientId, reason } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Validate input
      if (!doctorId || !patientId) {
        return res.status(400).json({
          success: false,
          message: 'Doctor ID and Patient ID are required'
        });
      }

      // Only receptionist can create assignments
      if (userRole !== 'receptionist') {
        return res.status(403).json({
          success: false,
          message: 'Only receptionists can create assignments'
        });
      }

      // Verify doctor exists and is a doctor
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(400).json({
          success: false,
          message: 'Invalid doctor ID'
        });
      }

      // Verify patient exists and is a patient
      const patient = await User.findById(patientId);
      if (!patient || patient.role !== 'patient') {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID'
        });
      }

      // Check if assignment already exists and is active
      const existingAssignment = await Assignment.findOne({
        doctorId,
        patientId,
        status: 'active',
        deletedAt: { $exists: false }
      });

      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          message: 'This doctor is already assigned to this patient'
        });
      }

      // Create assignment
      const assignment = new Assignment({
        doctorId,
        patientId,
        assignedBy: userId,
        reason: reason || `Assigned by ${req.user.profile.firstName} ${req.user.profile.lastName}`
      });

      await assignment.save();

      // Populate assignment details
      await assignment.populate('doctorId patientId assignedBy');

      // Log audit
      await AuditLog.createLog({
        eventType: 'CREATE',
        userId,
        userRole,
        resourceType: 'assignment',
        resourceId: assignment._id,
        action: 'ASSIGN_DOCTOR',
        description: `Assigned doctor ${doctor.profile.firstName} ${doctor.profile.lastName} to patient ${patient.profile.firstName} ${patient.profile.lastName}`,
        dataAccessed: {
          doctorId,
          patientId
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.status(201).json({
        success: true,
        message: 'Doctor assigned successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Error assigning doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Error assigning doctor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get assigned doctors for a patient
   * GET /api/assignments/patient/:patientId/doctors
   */
  static async getPatientDoctors(req, res) {
    try {
      const { patientId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Verify patient exists
      const patient = await User.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Patient can only view their own assignments, doctors can view all
      if (userId.toString() !== patientId && userRole !== 'doctor' && userRole !== 'administrator') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Get assignments
      const assignments = await Assignment.find({
        patientId,
        status: 'active',
        deletedAt: { $exists: false }
      })
        .populate({
          path: 'doctorId',
          select: '_id email profile.firstName profile.lastName profile.professionalInfo.specialization'
        })
        .lean();

      // Log audit
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'assignment',
        resourceId: patientId,
        action: 'GET_PATIENT_DOCTORS',
        description: `Viewed assigned doctors for patient`,
        dataAccessed: {
          patientId,
          doctorCount: assignments.length
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error getting patient doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get assigned patients for a doctor
   * GET /api/assignments/doctor/:doctorId/patients
   */
  static async getDoctorPatients(req, res) {
    try {
      const { doctorId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Verify doctor exists
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      // Doctor can only view their own assignments, receptionist/admin can view all
      if (userId.toString() !== doctorId && !['receptionist', 'administrator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Get assignments
      const assignments = await Assignment.find({
        doctorId,
        status: 'active',
        deletedAt: { $exists: false }
      })
        .populate({
          path: 'patientId',
          select: '_id email profile.firstName profile.lastName profile.dateOfBirth'
        })
        .lean();

      // Log audit
      await AuditLog.createLog({
        eventType: 'READ',
        userId,
        userRole,
        resourceType: 'assignment',
        resourceId: doctorId,
        action: 'GET_DOCTOR_PATIENTS',
        description: `Viewed assigned patients`,
        dataAccessed: {
          doctorId,
          patientCount: assignments.length
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error getting doctor patients:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * End assignment
   * PUT /api/assignments/:assignmentId/end
   */
  static async endAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Only receptionist and administrator can end assignments
      if (!['receptionist', 'administrator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Only receptionist can end assignments'
        });
      }

      // Find assignment
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      // Update assignment
      assignment.status = 'ended';
      assignment.endDate = new Date();
      await assignment.save();

      // Log audit
      await AuditLog.createLog({
        eventType: 'UPDATE',
        userId,
        userRole,
        resourceType: 'assignment',
        resourceId: assignmentId,
        action: 'END_ASSIGNMENT',
        description: `Ended doctor-patient assignment`,
        dataAccessed: {
          assignmentId,
          doctorId: assignment.doctorId,
          patientId: assignment.patientId
        },
        requestDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method,
          requestId: req.requestId || uuidv4()
        },
        status: 'success'
      });

      res.json({
        success: true,
        message: 'Assignment ended',
        data: assignment
      });
    } catch (error) {
      console.error('Error ending assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Error ending assignment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AssignmentController;
