const mongoose = require('mongoose');

/**
 * Patient Model - Core patient medical data
 * Implements data minimization and separation of concerns
 * Sensitive fields are isolated and encrypted
 */

const patientSchema = new mongoose.Schema({
  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic demographic information (minimal collection)
  demographics: {
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: false
    },
    allergies: [{
      type: String,
      trim: true
    }],
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      }
    }
  },
  
  // Medical history (separate from basic demographics)
  medicalHistory: {
    conditions: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      diagnosedDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['active', 'resolved', 'chronic'],
        default: 'active'
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 500
      },
      diagnosedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    surgeries: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: true
      },
      surgeon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      hospital: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 500
      }
    }],
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true,
        trim: true
      },
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date
      },
      prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      active: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Visit records (separate collection for better organization)
  visits: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup'],
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: 500
    },
    treatment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    vitals: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  }],
  
  // Privacy and consent settings
  privacy: {
    dataSharingPreferences: {
      research: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      },
      thirdParty: {
        type: Boolean,
        default: false
      }
    },
    emergencyAccess: {
      enabled: {
        type: Boolean,
        default: true
      },
      contacts: [{
        name: String,
        phone: String,
        relationship: String
      }]
    }
  },
  
  // Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active'
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
      // Remove sensitive fields from JSON output
      delete ret.__v;
      return ret;
    }
  },
  encryption: {
    fields: ['demographics.emergencyContact.phone', 'privacy.emergencyAccess.contacts.phone']
  }
});

// Indexes for performance and security
patientSchema.index({ userId: 1 }, { unique: true });
patientSchema.index({ 'demographics.dateOfBirth': 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ 'visits.date': -1 });
patientSchema.index({ 'medicalHistory.conditions.diagnosedBy': 1 });

// Virtual for age
patientSchema.virtual('demographics.age').get(function() {
  const today = new Date();
  const birthDate = this.demographics.dateOfBirth;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for active medications
patientSchema.virtual('activeMedications').get(function() {
  return this.medicalHistory.medications.filter(med => med.active);
});

// Instance methods
patientSchema.methods.addVisit = function(visitData) {
  this.visits.push(visitData);
  return this.save();
};

patientSchema.methods.addMedicalCondition = function(conditionData) {
  this.medicalHistory.conditions.push(conditionData);
  return this.save();
};

patientSchema.methods.addMedication = function(medicationData) {
  this.medicalHistory.medications.push(medicationData);
  return this.save();
};

patientSchema.methods.getRecentVisits = function(limit = 10) {
  return this.visits
    .sort({ date: -1 })
    .slice(0, limit);
};

patientSchema.methods.getActiveConditions = function() {
  return this.medicalHistory.conditions.filter(condition => condition.status === 'active');
};

// GDPR compliance methods
patientSchema.methods.anonymize = function() {
  // Anonymize sensitive data while preserving medical history for research
  this.demographics.emergencyContact = {
    name: 'Anonymized',
    relationship: 'Unknown',
    phone: '000-000-0000'
  };
  this.privacy.emergencyAccess.contacts = [];
  this.deletedAt = new Date();
  return this.save();
};

// Static methods
patientSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId, deletedAt: { $exists: false } });
};

patientSchema.statics.findActivePatients = function() {
  return this.find({ status: 'active', deletedAt: { $exists: false } });
};

patientSchema.statics.searchPatients = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $and: [
      { deletedAt: { $exists: false } },
      {
        $or: [
          { 'demographics.emergencyContact.name': regex },
          { 'medicalHistory.conditions.name': regex },
          { 'medicalHistory.medications.name': regex }
        ]
      }
    ]
  });
};

// Middleware for audit logging
patientSchema.pre('save', function(next) {
  if (this.isNew) {
    this.$locals.operation = 'CREATE';
  } else {
    this.$locals.operation = 'UPDATE';
  }
  next();
});

patientSchema.pre(['remove', 'deleteOne'], function(next) {
  this.$locals.operation = 'DELETE';
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
