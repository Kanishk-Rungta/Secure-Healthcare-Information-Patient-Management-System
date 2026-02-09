const mongoose = require('mongoose');

/**
 * MedicalRecord Model - Clinical data management
 * Implements versioning and immutability for medical data
 * Separates different types of medical records for better organization
 */

const medicalRecordSchema = new mongoose.Schema({
  // Patient reference
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Record classification
  recordType: {
    type: String,
    enum: [
      'diagnosis',
      'prescription',
      'lab_result',
      'vital_signs',
      'procedure',
      'imaging',
      'clinical_note',
      'allergy',
      'immunization'
    ],
    required: true
  },
  
  // Provider information
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  providerRole: {
    type: String,
    enum: ['doctor', 'receptionist', 'lab_technician', 'pharmacist'],
    required: true
  },
  
  // Record content (structured based on type)
  content: {
    // Common fields
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    
    // Type-specific content
    diagnosis: {
      icd10Code: String,
      diagnosisName: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      acute: Boolean,
      chronic: Boolean
    },
    
    prescription: {
      medicationName: {
        type: String,
        required: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      },
      route: {
        type: String,
        enum: ['oral', 'intravenous', 'intramuscular', 'topical', 'inhalation']
      },
      duration: String,
      quantity: Number,
      refills: Number,
      instructions: String,
      pharmacy: String
    },
    
    labResult: {
      testType: {
        type: String,
        required: true
      },
      specimenType: String,
      collectionDate: Date,
      resultDate: Date,
      results: [{
        testName: String,
        value: String,
        unit: String,
        referenceRange: String,
        status: {
          type: String,
          enum: ['normal', 'abnormal', 'critical', 'pending']
        },
        notes: String
      }],
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    
    vitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      respiratoryRate: Number,
      temperature: Number,
      oxygenSaturation: Number,
      height: Number,
      weight: Number,
      bmi: Number
    },
    
    procedure: {
      procedureCode: String,
      procedureName: String,
      startDate: Date,
      endDate: Date,
      location: String,
      anesthesia: String,
      complications: String,
      outcome: String
    }
  },
  
  // Record metadata
  recordDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Version control for immutability
  version: {
    type: Number,
    default: 1
  },
  
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  
  // Status and workflow
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'amended', 'archived'],
    default: 'approved'
  },
  
  // Attachments and documents
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Clinical context
  encounterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encounter'
  },
  
  department: String,
  
  // Flags and alerts
  flags: {
    critical: {
      type: Boolean,
      default: false
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    allergyAlert: {
      type: Boolean,
      default: false
    },
    drugInteraction: {
      type: Boolean,
      default: false
    }
  },
  
  // Privacy and access control
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential', 'secret'],
    default: 'restricted'
  },
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Soft delete for GDPR compliance
  deletedAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  encryption: {
    fields: ['content.prescription.instructions', 'content.labResult.results.notes']
  }
});

// Indexes for performance and security
medicalRecordSchema.index({ patientId: 1, recordDate: -1 });
medicalRecordSchema.index({ providerId: 1, recordDate: -1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ 'flags.critical': 1 });
medicalRecordSchema.index({ version: 1, previousVersion: 1 });
medicalRecordSchema.index({ isLatestVersion: 1 });

// Virtual for record age
medicalRecordSchema.virtual('age').get(function() {
  return Date.now() - this.recordDate.getTime();
});

// Virtual for formatted record date
medicalRecordSchema.virtual('formattedRecordDate').get(function() {
  return this.recordDate.toISOString().split('T')[0];
});

// Instance methods
medicalRecordSchema.methods.createNewVersion = function(updates, modifiedBy) {
  // Create new version with updates
  const newRecord = new this.constructor({
    ...this.toObject(),
    ...updates,
    _id: undefined,
    version: this.version + 1,
    previousVersion: this._id,
    isLatestVersion: true,
    lastModifiedBy: modifiedBy,
    status: 'amended'
  });
  
  // Mark current version as not latest
  this.isLatestVersion = false;
  this.save();
  
  return newRecord.save();
};

medicalRecordSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

medicalRecordSchema.methods.setCriticalFlag = function(reason) {
  this.flags.critical = true;
  this.flags.followUpRequired = true;
  return this.save();
};

medicalRecordSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Static methods
medicalRecordSchema.statics.findByPatient = function(patientId, options = {}) {
  const query = { 
    patientId,
    isLatestVersion: true,
    deletedAt: { $exists: false }
  };
  
  if (options.recordType) {
    query.recordType = options.recordType;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ recordDate: -1 })
    .populate('providerId', 'profile.firstName profile.lastName')
    .limit(options.limit || 100);
};

medicalRecordSchema.statics.findByProvider = function(providerId, options = {}) {
  const query = { 
    providerId,
    isLatestVersion: true,
    deletedAt: { $exists: false }
  };
  
  if (options.dateRange) {
    query.recordDate = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .sort({ recordDate: -1 })
    .populate('patientId', 'demographics')
    .limit(options.limit || 100);
};

medicalRecordSchema.statics.findCriticalRecords = function(limit = 50) {
  return this.find({ 
    'flags.critical': true,
    isLatestVersion: true,
    deletedAt: { $exists: false }
  })
  .sort({ recordDate: -1 })
  .populate('patientId', 'demographics')
  .populate('providerId', 'profile.firstName profile.lastName')
  .limit(limit);
};

medicalRecordSchema.statics.findPrescriptionsByPatient = function(patientId, activeOnly = true) {
  const query = {
    patientId,
    recordType: 'prescription',
    isLatestVersion: true,
    deletedAt: { $exists: false }
  };
  
  if (activeOnly) {
    query['content.prescription.refills'] = { $gt: 0 };
  }
  
  return this.find(query)
    .sort({ recordDate: -1 })
    .populate('providerId', 'profile.firstName profile.lastName');
};

medicalRecordSchema.statics.findLabResultsByPatient = function(patientId, testType = null) {
  const query = {
    patientId,
    recordType: 'lab_result',
    isLatestVersion: true,
    deletedAt: { $exists: false }
  };
  
  if (testType) {
    query['content.labResult.testType'] = testType;
  }
  
  return this.find(query)
    .sort({ 'content.labResult.resultDate': -1 })
    .populate('providerId', 'profile.firstName profile.lastName');
};

medicalRecordSchema.statics.getVersionHistory = function(recordId) {
  return this.find({
    $or: [
      { _id: recordId },
      { previousVersion: recordId }
    ]
  })
  .sort({ version: 1 })
  .populate('providerId', 'profile.firstName profile.lastName')
  .populate('lastModifiedBy', 'profile.firstName profile.lastName');
};

// Middleware for audit logging
medicalRecordSchema.pre('save', function(next) {
  if (this.isNew) {
    this.$locals.operation = 'CREATE';
  } else {
    this.$locals.operation = 'UPDATE';
  }
  next();
});

medicalRecordSchema.pre(['remove', 'deleteOne'], function(next) {
  this.$locals.operation = 'DELETE';
  next();
});

// Middleware for automatic BMI calculation
medicalRecordSchema.pre('save', function(next) {
  if (this.recordType === 'vital_signs' && 
      this.content.vitalSigns.height && 
      this.content.vitalSigns.weight) {
    
    const heightInMeters = this.content.vitalSigns.height / 100;
    this.content.vitalSigns.bmi = Math.round(
      this.content.vitalSigns.weight / (heightInMeters * heightInMeters) * 10
    ) / 10;
  }
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
