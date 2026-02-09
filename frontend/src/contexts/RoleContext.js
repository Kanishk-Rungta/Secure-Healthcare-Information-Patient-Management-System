import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Role Context - Role-based access control and permissions
 * Provides role checking and permission utilities
 */

// Role definitions with permissions
const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  ADMINISTRATOR: 'administrator',
};

// Permission mappings
const ROLE_PERMISSIONS = {
  [ROLES.PATIENT]: [
    'view_own_records',
    'manage_own_consent',
    'view_own_appointments',
    'update_own_profile',
    'view_own_medications',
  ],
  [ROLES.DOCTOR]: [
    'view_patient_records',
    'create_diagnosis',
    'create_prescription',
    'view_lab_results',
    'manage_appointments',
    'search_patients',
    'create_medical_records',
    'emergency_access',
  ],
  [ROLES.RECEPTIONIST]: [
    'view_patient_records',
    'update_vitals',
    'manage_medications',
    'view_appointments',
    'search_patients',
    'create_medical_records',
    'emergency_access',
  ],
  [ROLES.LAB_TECHNICIAN]: [
    'view_patient_demographics',
    'create_lab_results',
    'update_lab_results',
    'search_patients',
  ],
  [ROLES.PHARMACIST]: [
    'view_prescriptions',
    'manage_medications',
    'view_patient_allergies',
    'search_patients',
  ],
  [ROLES.ADMINISTRATOR]: [
    'manage_users',
    'view_audit_logs',
    'manage_system',
    'view_all_records',
    'manage_consents',
    'emergency_access',
    'view_system_stats',
  ],
};

// Role display names
const ROLE_DISPLAY_NAMES = {
  [ROLES.PATIENT]: 'Patient',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.LAB_TECHNICIAN]: 'Lab Technician',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.ADMINISTRATOR]: 'Administrator',
};

// Create context
const RoleContext = createContext();

// Provider component
export const RoleProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Get current user role
  const currentRole = useMemo(() => {
    return user?.role || null;
  }, [user]);

  // Get user permissions
  const permissions = useMemo(() => {
    return currentRole ? ROLE_PERMISSIONS[currentRole] || [] : [];
  }, [currentRole]);

  // Check if user has specific role
  const hasRole = (role) => {
    if (!isAuthenticated || !currentRole) return false;
    return currentRole === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!isAuthenticated || !currentRole) return false;
    return roles.includes(currentRole);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!isAuthenticated || !currentRole) return false;
    return permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionList) => {
    if (!isAuthenticated || !currentRole) return false;
    return permissionList.some(permission => permissions.includes(permission));
  };

  // Get role display name
  const getRoleDisplayName = (role = currentRole) => {
    return ROLE_DISPLAY_NAMES[role] || 'Unknown';
  };

  // Get dashboard route for current role
  const getDashboardRoute = () => {
    const roleRoutes = {
      [ROLES.PATIENT]: '/patient',
      [ROLES.DOCTOR]: '/doctor',
      [ROLES.RECEPTIONIST]: '/receptionist',
      [ROLES.LAB_TECHNICIAN]: '/lab',
      [ROLES.PHARMACIST]: '/pharmacy',
      [ROLES.ADMINISTRATOR]: '/admin',
    };

    return roleRoutes[currentRole] || '/';
  };

  // Get navigation items for current role
  const getNavigationItems = () => {
    const navigationByRole = {
      [ROLES.PATIENT]: [
        { path: '/patient', label: 'Dashboard', icon: 'home' },
        { path: '/patient/profile', label: 'My Profile', icon: 'user' },
        { path: '/patient/records', label: 'Medical Records', icon: 'file-text' },
        { path: '/patient/consent', label: 'Consent Management', icon: 'shield' },
        { path: '/patient/visits', label: 'Appointments', icon: 'calendar' }
      ],
      [ROLES.DOCTOR]: [
        { path: '/doctor', label: 'Dashboard', icon: 'home' },
        { path: '/doctor/patients', label: 'Patients', icon: 'users' },
        { path: '/doctor/appointments', label: 'Appointments', icon: 'calendar' },
        { path: '/doctor/prescriptions', label: 'Prescriptions', icon: 'pill' },
        { path: '/doctor/lab-results', label: 'Lab Results', icon: 'flask' }
      ],
      [ROLES.RECEPTIONIST]: [
        { path: '/receptionist', label: 'Dashboard', icon: 'home' },
        { path: '/receptionist/patients', label: 'Patients', icon: 'users' },
        { path: '/receptionist/appointments', label: 'Appointments', icon: 'calendar' }
      ],
      [ROLES.LAB_TECHNICIAN]: [
        { path: '/lab', label: 'Dashboard', icon: 'home' },
        { path: '/lab/patients', label: 'Patients', icon: 'users' },
        { path: '/lab/tests', label: 'Lab Tests', icon: 'flask' },
        { path: '/lab/results', label: 'Results', icon: 'clipboard' }
      ],
      [ROLES.PHARMACIST]: [
        { path: '/pharmacy', label: 'Dashboard', icon: 'home' },
        { path: '/pharmacy/patients', label: 'Patients', icon: 'users' },
        { path: '/pharmacy/prescriptions', label: 'Prescriptions', icon: 'pill' },
        { path: '/pharmacy/inventory', label: 'Inventory', icon: 'package' }
      ],
      [ROLES.ADMINISTRATOR]: [
        { path: '/admin', label: 'Dashboard', icon: 'home' },
        { path: '/admin/users', label: 'User Management', icon: 'users' },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: 'file-text' },
        { path: '/admin/consents', label: 'Consent Management', icon: 'shield' },
        { path: '/admin/settings', label: 'System Settings', icon: 'settings' }
      ]
    };

    return navigationByRole[currentRole] || [];
  };

  // Check if user can access specific patient data
  const canAccessPatientData = (patientId) => {
    if (!isAuthenticated) return false;

    // Patients can access their own data
    if (currentRole === ROLES.PATIENT) {
      return user.patientId === patientId;
    }

    // Medical staff and admins can access patient data with proper consent
    return [ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST, ROLES.ADMINISTRATOR].includes(currentRole);
  };

  // Check if user can perform specific action on patient data
  const canPerformAction = (action, patientId = null) => {
    if (!isAuthenticated) return false;

    // Check permission first
    if (!hasPermission(action)) return false;

    // If action involves patient data, check access
    if (patientId && !canAccessPatientData(patientId)) return false;

    return true;
  };

  const value = {
    // Role information
    currentRole,
    permissions,

    // Role checking methods
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,

    // Utility methods
    getRoleDisplayName,
    getDashboardRoute,
    getNavigationItems,
    canAccessPatientData,
    canPerformAction,

    // Constants
    ROLES,
    ROLE_PERMISSIONS,
    ROLE_DISPLAY_NAMES,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

// Hook to use role context
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext;
