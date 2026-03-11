const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and administrator role
router.use(authenticate);
router.use(authorize('administrator'));

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin)
 */
router.get('/stats', AdminController.getSystemStats);

/**
 * @route   GET /api/admin/logs
 * @desc    Get system audit logs
 * @access  Private (Admin)
 */
router.get('/logs', AdminController.getAuditLogs);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Update user status (activate/suspend)
 * @access  Private (Admin)
 */
router.put('/users/:userId/status', AdminController.updateUserStatus);

module.exports = router;
