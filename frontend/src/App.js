import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Role-specific pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReceptionistDashboard from './pages/nurse/NurseDashboard';
import LabTechnicianDashboard from './pages/lab_technician/LabTechnicianDashboard';
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import AdministratorDashboard from './pages/administrator/AdministratorDashboard';

// Patient pages
import PatientProfile from './pages/patient/PatientProfile';
import PatientRecords from './pages/patient/PatientRecords';
import PatientConsent from './pages/patient/PatientConsent';
import PatientVisits from './pages/patient/PatientVisits';

// Medical staff pages
import PatientSearch from './pages/medical/PatientSearch';
import PatientDetails from './pages/medical/PatientDetails';
import MedicalRecords from './pages/medical/MedicalRecords';
import CreateMedicalRecord from './pages/medical/CreateMedicalRecord';

// Admin pages
import UserManagement from './pages/administrator/UserManagement';
import AuditLogs from './pages/administrator/AuditLogs';
import SystemSettings from './pages/administrator/SystemSettings';

// Error pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Styles
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

          {/* Role-specific Dashboards */}
          <Route path="/patient" element={<Layout><PatientDashboard /></Layout>} />
          <Route path="/doctor" element={<Layout><DoctorDashboard /></Layout>} />
          <Route path="/receptionist" element={<Layout><ReceptionistDashboard /></Layout>} />
          <Route path="/lab" element={<Layout><LabTechnicianDashboard /></Layout>} />
          <Route path="/pharmacy" element={<Layout><PharmacistDashboard /></Layout>} />
          <Route path="/admin" element={<Layout><AdministratorDashboard /></Layout>} />

          {/* Patient Routes */}
          <Route path="/patient/profile" element={<Layout><PatientProfile /></Layout>} />
          <Route path="/patient/records" element={<Layout><PatientRecords /></Layout>} />
          <Route path="/patient/consent" element={<Layout><PatientConsent /></Layout>} />
          <Route path="/patient/visits" element={<Layout><PatientVisits /></Layout>} />

          {/* Medical Staff Routes */}
          <Route path="/patients/search" element={<Layout><PatientSearch /></Layout>} />
          <Route path="/patients/:id" element={<Layout><PatientDetails /></Layout>} />
          <Route path="/medical-records" element={<Layout><MedicalRecords /></Layout>} />
          <Route path="/medical-records/new" element={<Layout><CreateMedicalRecord /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/admin/audit-logs" element={<Layout><AuditLogs /></Layout>} />
          <Route path="/admin/settings" element={<Layout><SystemSettings /></Layout>} />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
