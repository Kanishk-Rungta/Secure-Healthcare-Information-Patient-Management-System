const mongoose = require('mongoose');

/**
 * Assignment Model - Track doctor-patient assignments
 * Used by receptionists to assign doctors to patients
 */

const assignmentSchema = new mongoose.Schema({
  // Doctor assigned to patient
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
    validate: {
      async: true,
      validator: async function(v) {
        const User = this.constructor.model('User');
        const doctor = await User.findById(v);
        return doctor && doctor.role === 'doctor' && !doctor.deletedAt;
      },
      message: 'Invalid doctor ID'
    }
  },

  // Patient being assigned
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    validate: {
      async: true,
      validator: async function(v) {
        const User = this.constructor.model('User');
        const patient = await User.findById(v);
        return patient && patient.role === 'patient' && !patient.deletedAt;
      },
      message: 'Invalid patient ID'
    }
  },

  // Receptionist who created the assignment
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by user ID is required']
  },

  // Assignment status
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred', 'ended'],
    default: 'active'
  },

  // Assignment reason/notes
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },

  // When the assignment ends
  endDate: {
    type: Date
  },

  // Soft delete
  deletedAt: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate active assignments
assignmentSchema.index({ doctorId: 1, patientId: 1, status: 1, deletedAt: 1 });

// Index for finding assignments by doctor
assignmentSchema.index({ doctorId: 1, status: 1, deletedAt: 1 });

// Index for finding assignments by patient
assignmentSchema.index({ patientId: 1, status: 1, deletedAt: 1 });

// Prevent duplicate active assignments
assignmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    const existing = await this.constructor.findOne({
      doctorId: this.doctorId,
      patientId: this.patientId,
      status: 'active',
      deletedAt: { $exists: false }
    });

    if (existing && existing._id.toString() !== this._id.toString()) {
      throw new Error('This doctor is already assigned to this patient');
    }
  }
  next();
});

// Virtual for populated doctor info
assignmentSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated patient info
assignmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Statics for common queries
assignmentSchema.statics.getActiveAssignment = function(doctorId, patientId) {
  return this.findOne({
    doctorId,
    patientId,
    status: 'active',
    deletedAt: { $exists: false }
  }).populate('doctorId patientId assignedBy');
};

assignmentSchema.statics.getPatientDoctors = function(patientId) {
  return this.find({
    patientId,
    status: 'active',
    deletedAt: { $exists: false }
  }).populate('doctorId');
};

assignmentSchema.statics.getDoctorPatients = function(doctorId) {
  return this.find({
    doctorId,
    status: 'active',
    deletedAt: { $exists: false }
  }).populate('patientId');
};

module.exports = mongoose.model('Assignment', assignmentSchema);
