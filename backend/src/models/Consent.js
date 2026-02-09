const mongoose = require('mongoose');

/**
 * Consent Model - Patient-driven consent management
 * Implements granular, time-bound, purpose-limited consent
 * Critical for GDPR/HIPAA compliance
 */

const consentSchema = new mongoose.Schema({
  // Patient who grants consent
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Recipient of consent (who can access data)
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Recipient role for permission checking
  recipientRole: {
    type: String,
    enum: ['doctor', 'receptionist', 'lab_technician', 'pharmacist', 'administrator'],
    required: true
  },
  
  // Type of data access granted
  dataType: {
    type: String,
    enum: [
      'demographics',
      'medical_history',
      'visits',
      'medications',
      'lab_results',
      'prescriptions',
      'all_records'
    ],
    required: true
  },
  
  // Purpose of access (purpose limitation principle)
  purpose: {
    type: String,
    enum: [
      'treatment',
      'diagnosis',
      'emergency_care',
      'follow_up',
      'research',
      'quality_assurance',
      'billing',
      'legal_compliance'
    ],
    required: true
  },
  
  // Consent status
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'suspended'],
    default: 'active'
  },
  
  // Time-bound consent
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  // Access limitations
  limitations: {
    maxAccessCount: {
      type: Number,
      default: null // unlimited if null
    },
    accessCount: {
      type: Number,
      default: 0
    },
    ipAddress: {
      type: String,
      default: null // restrict to specific IP if provided
    },
    deviceFingerprint: {
      type: String,
      default: null
    }
  },
  
  // Consent metadata
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Patient user ID
  },
  
  grantedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Revocation information
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  revokedAt: {
    type: Date
  },
  
  revocationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Emergency access override
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
  
  // Consent version for audit trail
  version: {
    type: Number,
    default: 1
  },
  
  // Digital signature verification
  signature: {
    hash: String,
    algorithm: {
      type: String,
      default: 'SHA256'
    },
    timestamp: Date
  },
  
  // Metadata
  ipAddress: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.signature.hash; // Don't expose signature hash
      return ret;
    }
  }
});

// Indexes for performance and security
consentSchema.index({ patientId: 1, recipientId: 1 });
consentSchema.index({ patientId: 1, status: 1 });
consentSchema.index({ recipientId: 1, status: 1 });
consentSchema.index({ validUntil: 1 });
consentSchema.index({ status: 1, validUntil: 1 });
consentSchema.index({ grantedAt: -1 });

// Virtual for checking if consent is currently valid
consentSchema.virtual('isValid').get(function() {
  const now = new Date();
  
  // Check basic validity
  if (this.status !== 'active') return false;
  if (now < this.validFrom || now > this.validUntil) return false;
  
  // Check access count limitations
  if (this.limitations.maxAccessCount && 
      this.limitations.accessCount >= this.limitations.maxAccessCount) {
    return false;
  }
  
  return true;
});

// Virtual for remaining time
consentSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now >= this.validUntil) return 0;
  
  return Math.floor((this.validUntil - now) / (1000 * 60 * 60 * 24)); // days
});

// Instance methods
consentSchema.methods.grantAccess = function() {
  this.status = 'active';
  this.grantedAt = new Date();
  this.version += 1;
  return this.save();
};

consentSchema.methods.revokeAccess = function(reason, revokedBy) {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revocationReason = reason;
  this.revokedBy = revokedBy;
  return this.save();
};

consentSchema.methods.incrementAccess = function() {
  if (this.limitations.maxAccessCount) {
    this.limitations.accessCount += 1;
    
    // Auto-revoke if max access reached
    if (this.limitations.accessCount >= this.limitations.maxAccessCount) {
      this.status = 'expired';
    }
  }
  return this.save();
};

consentSchema.methods.enableEmergencyAccess = function(reason, justification, approvedBy) {
  this.emergencyAccess = {
    isEmergency: true,
    emergencyReason: reason,
    emergencyJustification: justification,
    approvedBy: approvedBy
  };
  return this.save();
};

// Static methods
consentSchema.statics.findValidConsent = function(patientId, recipientId, dataType) {
  return this.findOne({
    patientId,
    recipientId,
    dataType,
    status: 'active',
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });
};

consentSchema.statics.findPatientConsents = function(patientId, status = 'active') {
  return this.find({ 
    patientId, 
    status,
    validUntil: { $gte: new Date() }
  }).populate('recipientId', 'profile.firstName profile.lastName email role');
};

consentSchema.statics.findRecipientConsents = function(recipientId, status = 'active') {
  return this.find({ 
    recipientId, 
    status,
    validUntil: { $gte: new Date() }
  }).populate('patientId', 'demographics');
};

consentSchema.statics.findExpiredConsents = function() {
  return this.find({
    status: 'active',
    validUntil: { $lt: new Date() }
  });
};

consentSchema.statics.checkConsent = async function(patientId, recipientId, dataType, purpose) {
  const consent = await this.findOne({
    patientId,
    recipientId,
    $or: [
      { dataType },
      { dataType: 'all_records' }
    ],
    status: 'active',
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });
  
  if (!consent) return false;
  
  // Check purpose limitation
  if (consent.purpose !== purpose && consent.purpose !== 'treatment') {
    return false;
  }
  
  // Check access limitations
  if (consent.limitations.maxAccessCount && 
      consent.limitations.accessCount >= consent.limitations.maxAccessCount) {
    return false;
  }
  
  return true;
};

// Middleware for automatic expiration
consentSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-expire if past validUntil date
  if (this.status === 'active' && now > this.validUntil) {
    this.status = 'expired';
  }
  
  next();
});

// Middleware for audit logging
consentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.$locals.operation = 'CREATE';
  } else {
    this.$locals.operation = 'UPDATE';
  }
  next();
});

consentSchema.pre(['remove', 'deleteOne'], function(next) {
  this.$locals.operation = 'DELETE';
  next();
});

module.exports = mongoose.model('Consent', consentSchema);
