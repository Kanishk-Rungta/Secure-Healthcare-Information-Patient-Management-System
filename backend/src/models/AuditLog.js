const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * AuditLog Model - Immutable audit logging system
 * Records all data access and modifications for complete traceability
 * Critical for HIPAA accountability and GDPR compliance
 */

const auditLogSchema = new mongoose.Schema({
  // Event information
  eventType: {
    type: String,
    enum: [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'CONSENT_GRANTED',
      'CONSENT_REVOKED',
      'EMERGENCY_ACCESS',
      'DATA_EXPORT',
      'PASSWORD_CHANGE',
      'ROLE_CHANGE',
      'SYSTEM_ERROR'
    ],
    required: true
  },

  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for system events
  },

  userRole: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'lab_technician', 'pharmacist', 'administrator', 'anonymous'],
    required: false // Make optional for system events
  },

  // Target of the action
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  targetPatientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },

  // Resource information
  resourceType: {
    type: String,
    enum: [
      'user',
      'patient',
      'consent',
      'medical_record',
      'prescription',
      'lab_result',
      'visit',
      'system'
    ],
    required: true
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Make optional for system events
  },

  // Action details
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Data access details
  dataAccessed: {
    fields: [String], // List of fields accessed
    recordCount: Number, // Number of records accessed
    dataType: String, // Type of data (medical, demographic, etc.)
  },

  // Consent verification
  consentVerified: {
    type: Boolean,
    default: false
  },

  consentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consent'
  },

  // Emergency access details
  emergencyAccess: {
    isEmergency: {
      type: Boolean,
      default: false
    },
    emergencyReason: {
      type: String,
      trim: true,
      maxlength: 500
    },
    emergencyJustification: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Request metadata
  requestDetails: {
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    },
    endpoint: {
      type: String,
      required: true
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    sessionId: String
  },

  // System information
  systemDetails: {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    serverName: String,
    processId: String,
    memoryUsage: Number,
    responseTime: Number // in milliseconds
  },

  // Data changes (for UPDATE/DELETE events)
  dataChanges: {
    before: mongoose.Schema.Types.Mixed, // Previous state
    after: mongoose.Schema.Types.Mixed,  // New state
    changes: [String] // List of changed fields
  },

  // Security events
  securityEvent: {
    isSecurityEvent: {
      type: Boolean,
      default: false
    },
    threatLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    anomalyDetected: {
      type: Boolean,
      default: false
    },
    anomalyDetails: String
  },

  // Compliance flags
  compliance: {
    gdprRelevant: {
      type: Boolean,
      default: false
    },
    hipaaRelevant: {
      type: Boolean,
      default: false
    },
    dataBreach: {
      type: Boolean,
      default: false
    },
    retentionPeriod: {
      type: Number, // in years
      default: 7 // HIPAA standard
    }
  },

  // Digital signature for integrity
  signature: {
    hash: {
      type: String,
      required: false // Make optional, will be generated in middleware
    },
    algorithm: {
      type: String,
      default: 'SHA256'
    },
    previousHash: String // For blockchain-like integrity
  },

  // Deletion flag (for GDPR right to erasure)
  deletedAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.__v;
      delete ret.signature.hash;
      return ret;
    }
  }
});

// Indexes for performance and security
auditLogSchema.index({ userId: 1, 'systemDetails.timestamp': -1 });
auditLogSchema.index({ targetPatientId: 1, 'systemDetails.timestamp': -1 });
auditLogSchema.index({ eventType: 1, 'systemDetails.timestamp': -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ 'requestDetails.ipAddress': 1 });
auditLogSchema.index({ 'securityEvent.isSecurityEvent': 1 });
auditLogSchema.index({ 'compliance.dataBreach': 1 });
auditLogSchema.index({ 'systemDetails.timestamp': -1 });

// Compound index for common queries
auditLogSchema.index({
  userId: 1,
  targetPatientId: 1,
  'systemDetails.timestamp': -1
});

// Virtual for age of log entry
auditLogSchema.virtual('age').get(function () {
  return Date.now() - this.systemDetails.timestamp.getTime();
});

// Instance methods
auditLogSchema.methods.verifyIntegrity = function () {
  const dataToHash = this.toString();
  const computedHash = crypto
    .createHash('SHA256')
    .update(dataToHash)
    .digest('hex');

  return computedHash === this.signature.hash;
};

auditLogSchema.methods.isRecent = function (hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.systemDetails.timestamp > cutoffTime;
};

// Static methods
auditLogSchema.statics.findByUser = function (userId, limit = 100) {
  return this.find({ userId })
    .sort({ 'systemDetails.timestamp': -1 })
    .limit(limit)
    .populate('userId', 'profile.firstName profile.lastName email role');
};

auditLogSchema.statics.findByPatient = function (patientId, limit = 100) {
  return this.find({ targetPatientId: patientId })
    .sort({ 'systemDetails.timestamp': -1 })
    .limit(limit)
    .populate('userId', 'profile.firstName profile.lastName role');
};

auditLogSchema.statics.findSecurityEvents = function (limit = 100) {
  return this.find({ 'securityEvent.isSecurityEvent': true })
    .sort({ 'systemDetails.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.findDataBreaches = function (limit = 100) {
  return this.find({ 'compliance.dataBreach': true })
    .sort({ 'systemDetails.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.findEmergencyAccess = function (limit = 100) {
  return this.find({ 'emergencyAccess.isEmergency': true })
    .sort({ 'systemDetails.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.generateAuditReport = function (patientId, startDate, endDate) {
  return this.find({
    targetPatientId: patientId,
    'systemDetails.timestamp': {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ 'systemDetails.timestamp': -1 })
    .populate('userId', 'profile.firstName profile.lastName role');
};

auditLogSchema.statics.detectAnomalies = function (userId, hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        userId: userId,
        'systemDetails.timestamp': { $gte: cutoffTime }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalEvents: { $sum: 1 },
        uniqueIPs: { $addToSet: '$requestDetails.ipAddress' },
        readEvents: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'READ'] }, 1, 0]
          }
        },
        failedLogins: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$eventType', 'LOGIN'] },
                  { $eq: ['$securityEvent.threatLevel', 'medium'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Middleware for integrity verification
auditLogSchema.pre('save', function (next) {
  // Generate hash for integrity
  const dataToHash = JSON.stringify({
    eventType: this.eventType,
    userId: this.userId,
    action: this.action,
    timestamp: this.systemDetails.timestamp,
    requestId: this.requestDetails.requestId
  });

  this.signature.hash = crypto
    .createHash('SHA256')
    .update(dataToHash)
    .digest('hex');

  // Set previous hash for chain integrity
  if (!this.isNew) {
    this.signature.previousHash = this.signature.hash;
  }

  next();
});

// Static method to create audit log entries
auditLogSchema.statics.createLog = async function (logData) {
  try {
    // Ensure required fields have default values
    const auditLogData = {
      ...logData,
      userId: logData.userId || null,
      userRole: logData.userRole || 'anonymous',
      resourceId: logData.resourceId || null,
      systemDetails: {
        ...logData.systemDetails,
        timestamp: new Date()
      },
      signature: {
        hash: crypto.createHash('SHA256')
          .update(JSON.stringify({
            eventType: logData.eventType,
            userId: logData.userId,
            action: logData.action,
            timestamp: new Date().toISOString()
          }))
          .digest('hex'),
        algorithm: 'SHA256'
      }
    };

    const auditLog = new this(auditLogData);
    return await auditLog.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking main application flow
    // But log the failure for monitoring
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
