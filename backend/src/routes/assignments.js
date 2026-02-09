const express = require('express');
const AssignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All assignment routes require authentication
router.use(authenticate);

/**
 * Get all assignments (receptionist view)
 * GET /api/assignments
 */
router.get('/',
  authorize('receptionist', 'administrator'),
  AssignmentController.getAllAssignments
);

/**
 * Get all users by role (for dropdowns)
 * GET /api/assignments/users/:role?search=term&limit=20
 */
router.get('/users/:role',
  authorize('receptionist', 'administrator'),
  AssignmentController.getUsersByRole
);

/**
 * Assign doctor to patient
 * POST /api/assignments
 */
router.post('/',
  authorize('receptionist', 'administrator'),
  AssignmentController.assignDoctor
);

/**
 * Get doctors assigned to a patient
 * GET /api/assignments/patient/:patientId/doctors
 */
router.get('/patient/:patientId/doctors',
  AssignmentController.getPatientDoctors
);

/**
 * Get patients assigned to a doctor
 * GET /api/assignments/doctor/:doctorId/patients
 */
router.get('/doctor/:doctorId/patients',
  AssignmentController.getDoctorPatients
);

/**
 * End assignment
 * PUT /api/assignments/:assignmentId/end
 */
router.put('/:assignmentId/end',
  authorize('receptionist', 'administrator'),
  AssignmentController.endAssignment
);

module.exports = router;
