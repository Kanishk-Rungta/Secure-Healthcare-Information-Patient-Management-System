import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintPriority, setComplaintPriority] = useState('medium');
  const [activeTab, setActiveTab] = useState('complaints');

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
      fetchPatients();
      fetchDoctors();
      fetchComplaints();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/patients/search?role=patient', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
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

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/nurse/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const registerComplaint = async () => {
    if (!selectedPatient || !selectedDoctor || !complaintDescription) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/nurse/register-complaint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          assignedDoctorId: selectedDoctor,
          description: complaintDescription,
          priority: complaintPriority,
          nurseId: user._id
        })
      });

      if (response.ok) {
        alert('Complaint registered successfully!');
        setShowComplaintModal(false);
        setSelectedPatient('');
        setSelectedDoctor('');
        setComplaintDescription('');
        setComplaintPriority('medium');
        fetchComplaints();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to register complaint');
      }
    } catch (error) {
      console.error('Error registering complaint:', error);
      alert('Failed to register complaint');
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
        <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 animate-spin"></div>
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
                Nurse Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-gray-500 text-xs">Nurse</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
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
            Register patient complaints and direct them to appropriate doctors.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'complaints'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Patient Complaints
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'register'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Register Complaint
            </button>
          </nav>
        </div>

        {/* Complaints List Tab */}
        {activeTab === 'complaints' && (
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Complaints
                </h3>
                {complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                    <p className="text-gray-500">No patient complaints have been registered yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {complaint.patientId?.profile?.firstName} {complaint.patientId?.profile?.lastName}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {complaint.priority} priority
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{complaint.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Assigned to: Dr. {complaint.assignedDoctorId?.profile?.firstName} {complaint.assignedDoctorId?.profile?.lastName}</span>
                              <span>Registered: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${complaint.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                  complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {complaint.status?.replace('_', ' ') || 'pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Register Complaint Tab */}
        {activeTab === 'register' && (
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Register New Patient Complaint
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Patient *
                    </label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.profile?.firstName} {patient.profile?.lastName} - {patient.profile?.dateOfBirth ? new Date(patient.profile.dateOfBirth).toLocaleDateString() : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to Doctor *
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
                      Priority Level *
                    </label>
                    <select
                      value={complaintPriority}
                      onChange={(e) => setComplaintPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint Description *
                    </label>
                    <textarea
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Describe the patient's complaint in detail..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={registerComplaint}
                      className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Register Complaint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NurseDashboard;
