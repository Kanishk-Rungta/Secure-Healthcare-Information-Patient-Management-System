import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [consents, setConsents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('all_records');
  const [consentPurpose, setConsentPurpose] = useState('treatment');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMedicalRecords();
      fetchConsents();
      fetchDoctors();
    }
  }, [user]);

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/patients/${user._id}/medical-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalRecords(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const fetchConsents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/consent/patient/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/patients/search?role=doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const grantConsent = async () => {
    if (!selectedDoctor) {
      alert('Please select a doctor');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/consent/grant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedDoctor,
          recipientRole: 'doctor',
          dataType: selectedDataType,
          purpose: consentPurpose,
          duration: 365 // 1 year
        })
      });

      if (response.ok) {
        alert('Consent granted successfully!');
        setShowConsentModal(false);
        setSelectedDoctor('');
        fetchConsents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to grant consent');
      }
    } catch (error) {
      console.error('Error granting consent:', error);
      alert('Failed to grant consent');
    }
  };

  const revokeConsent = async (consentId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/consent/${consentId}/revoke`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Consent revoked successfully!');
        fetchConsents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to revoke consent');
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      alert('Failed to revoke consent');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                Patient Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-gray-500 text-xs">Patient</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {(user?.profile?.firstName || '')?.charAt(0) || ''}{(user?.profile?.lastName || '')?.charAt(0) || ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your medical records and control access to your health information.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'records'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('consent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'consent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Access Control
            </button>
          </nav>
        </div>

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Medical Records
                </h3>
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                    <p className="text-gray-500">You don't have any medical records yet. Records will appear here once doctors add them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{record.content?.title || 'Medical Record'}</h4>
                            <p className="text-sm text-gray-500">Type: {record.recordType}</p>
                            <p className="text-sm text-gray-500">Date: {new Date(record.createdAt).toLocaleDateString()}</p>
                            {record.content?.description && (
                              <p className="mt-2 text-gray-700">{record.content.description}</p>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {record.recordType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Access Control Tab */}
        {activeTab === 'consent' && (
          <div>
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Grant Access to Doctors
                  </h3>
                  <button
                    onClick={() => setShowConsentModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Grant New Access
                  </button>
                </div>

                {consents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No access permissions granted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {consents.map((consent) => (
                      <div key={consent._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Dr. {consent.recipientId?.profile?.firstName} {consent.recipientId?.profile?.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">Access: {consent.dataType?.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">Purpose: {consent.purpose}</p>
                            <p className="text-sm text-gray-500">
                              Status: {consent.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          {consent.isActive && (
                            <button
                              onClick={() => revokeConsent(consent._id)}
                              className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-100"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Grant Consent Modal */}
      {showConsentModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Grant Access to Doctor
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor
                    </label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.profile?.firstName} {doctor.profile?.lastName} - {doctor.profile?.professionalInfo?.specialization || 'General'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Access Type
                    </label>
                    <select
                      value={selectedDataType}
                      onChange={(e) => setSelectedDataType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all_records">All Medical Records</option>
                      <option value="medical_history">Medical History</option>
                      <option value="prescriptions">Prescriptions</option>
                      <option value="lab_results">Lab Results</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose
                    </label>
                    <select
                      value={consentPurpose}
                      onChange={(e) => setConsentPurpose(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="treatment">Treatment</option>
                      <option value="consultation">Consultation</option>
                      <option value="emergency">Emergency Care</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={grantConsent}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Grant Access
                </button>
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
