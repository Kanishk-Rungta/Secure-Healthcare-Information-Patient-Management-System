const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Model - Core authentication and authorization
 * Implements GDPR/HIPAA compliance for user data
 */

const userSchema = new mongoose.Schema({
  // Basic identification (minimal data collection principle)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Secure password storage
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password in queries by default
  },
  
  // User role for RBAC
  role: {
    type: String,
    enum: ['patient', 'doctor', 'receptionist', 'lab_technician', 'pharmacist', 'administrator'],
    required: [true, 'Role is required']
  },
  
  // Profile information (minimal required fields)
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
      type: Date,
      required: function() { return this.role === 'patient'; }
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    // Professional information for medical staff
    professionalInfo: {
      licenseNumber: {
        type: String,
        required: function() { 
          return ['doctor', 'receptionist', 'lab_technician', 'pharmacist'].includes(this.role);
        },
        select: false // Sensitive information
      },
      specialization: {
        type: String,
        required: function() { return this.role === 'doctor'; }
      },
      department: {
        type: String,
        required: function() { 
          return ['doctor', 'receptionist', 'lab_technician', 'pharmacist'].includes(this.role);
        }
      }
    }
  },
  
  // Security settings
  security: {
    lastLogin: {
      type: Date,
      default: Date.now
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    }
  },
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  
  // GDPR compliance fields
  privacy: {
    dataProcessingConsent: {
      type: Boolean,
      required: true,
      default: false
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    consentDate: {
      type: Date,
      default: Date.now
    },
    dataRetentionPeriod: {
      type: Number, // in years
      default: 7 // HIPAA standard
    }
  },
  
  // Soft delete for GDPR right to erasure
  deletedAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  encryption: {
    fields: ['profile.professionalInfo.licenseNumber', 'security.twoFactorSecret']
  }
});

// Indexes for performance and security
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'security.lastLogin': 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost factor 12 for security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update password change timestamp
    this.security.passwordChangedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Account lockout mechanism
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// GDPR compliance methods
userSchema.methods.anonymize = function() {
  // Anonymize personal data for right to erasure
  this.email = `deleted_${this._id}@deleted.com`;
  this.profile.firstName = 'Deleted';
  this.profile.lastName = 'User';
  this.profile.dateOfBirth = undefined;
  this.profile.phone = undefined;
  this.status = 'deleted';
  this.deletedAt = new Date();
  return this.save();
};

userSchema.methods.hasConsent = function(consentType) {
  return this.privacy[consentType] === true;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findActiveUsers = function(role) {
  const query = { status: 'active' };
  if (role) query.role = role;
  return this.find(query);
};

module.exports = mongoose.model('User', userSchema);
