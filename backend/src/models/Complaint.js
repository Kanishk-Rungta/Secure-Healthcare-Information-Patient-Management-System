const mongoose = require('mongoose');

/**
 * Complaint Model - Patient complaint management
 * Tracks complaints registered by receptionists for patients
 */

const complaintSchema = new mongoose.Schema({
  // Patient reference
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  // Assigned doctor reference
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Receptionist who registered the complaint
  receptionistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Complaint details
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },

  // Resolution details
  resolution: {
    type: String,
    trim: true
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  resolvedAt: {
    type: Date
  }
});

// Update the updatedAt timestamp before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for querying
complaintSchema.index({ patientId: 1, createdAt: -1 });
complaintSchema.index({ assignedDoctorId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
