const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const { v4: uuidv4 } = require('uuid');

/**
 * Admin Controller - System administration and monitoring
 * Implements audit log viewing and system-wide management
 */

class AdminController {
  // Get system statistics
  static async getSystemStats(req, res) {
    try {
      const userCount = await User.countDocuments({ deletedAt: { $exists: false } });
      const patientCount = await Patient.countDocuments({ deletedAt: { $exists: false } });
      const recordCount = await MedicalRecord.countDocuments({ deletedAt: { $exists: false } });
      
      const roleBreakdown = await User.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const recentLogs = await AuditLog.find()
        .sort({ 'systemDetails.timestamp': -1 })
        .limit(5)
        .populate('userId', 'profile.firstName profile.lastName role');

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers: userCount,
            totalPatients: patientCount,
            totalRecords: recordCount,
            roleBreakdown
          },
          recentLogs
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: true,
        message: 'Failed to get system statistics'
      });
    }
  }

  // Get audit logs with filtering
  static async getAuditLogs(req, res) {
    try {
      const { 
        eventType, 
        userRole, 
        userId, 
        resourceType, 
        startDate, 
        endDate,
        limit = 50,
        page = 1
      } = req.query;

      const query = {};

      if (eventType) query.eventType = eventType;
      if (userRole) query.userRole = userRole;
      if (userId) query.userId = userId;
      if (resourceType) query.resourceType = resourceType;
      
      if (startDate || endDate) {
        query['systemDetails.timestamp'] = {};
        if (startDate) query['systemDetails.timestamp'].$gte = new Date(startDate);
        if (endDate) query['systemDetails.timestamp'].$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find(query)
        .sort({ 'systemDetails.timestamp': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'profile.firstName profile.lastName email role')
        .populate('targetPatientId', 'demographics');

      const total = await AuditLog.countDocuments(query);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  }

  // Update user status
  static async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const oldStatus = user.status;
      user.status = status;
      await user.save();

      // Log status change
      await AuditLog.createLog({
        eventType: 'UPDATE',
        userId: req.user._id,
        userRole: req.user.role,
        targetUserId: userId,
        resourceType: 'user',
        resourceId: userId,
        action: 'UPDATE_USER_STATUS',
        description: `Updated user status from ${oldStatus} to ${status}`,
        dataChanges: {
          before: { status: oldStatus },
          after: { status: status }
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
        message: `User status updated to ${status}`,
        data: { user }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }
}

module.exports = AdminController;
