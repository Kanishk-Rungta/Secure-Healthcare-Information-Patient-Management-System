import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintPriority, setComplaintPriority] = useState('medium');
  const [activeTab, setActiveTab] = useState('complaints');
  const [searchPatient, setSearchPatient] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentPatient, setAssignmentPatient] = useState('');
  const [assignmentDoctor, setAssignmentDoctor] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');

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
      fetchAssignments();
    }
  }, [user]);

  const fetchPatients = async (searchTerm = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = new URL('http://localhost:5000/api/assignments/users/patient');
      url.searchParams.append('limit', '100');
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const response = await fetch(url.toString(), {
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

  const fetchDoctors = async (searchTerm = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = new URL('http://localhost:5000/api/assignments/users/doctor');
      url.searchParams.append('limit', '100');
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const response = await fetch(url.toString(), {
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

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/receptionist/complaints', {
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
      const response = await fetch('http://localhost:5000/api/receptionist/register-complaint', {
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
          receptionistId: user._id
        })
      });

      if (response.ok) {
        alert('Complaint registered successfully!');
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

  const createAssignment = async () => {
    if (!assignmentPatient || !assignmentDoctor) {
      alert('Please select both patient and doctor');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: assignmentPatient,
          doctorId: assignmentDoctor,
          reason: assignmentReason || 'Assigned for regular consultation'
        })
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        setShowAssignmentModal(false);
        setAssignmentPatient('');
        setAssignmentDoctor('');
        setAssignmentReason('');
        fetchAssignments();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const endAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to end this assignment?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Assignment ended');
        fetchAssignments();
      } else {
        alert('Failed to end assignment');
      }
    } catch (error) {
      console.error('Error ending assignment:', error);
      alert('Failed to end assignment');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur border-b border-sky-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                Receptionist Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm leading-4 text-right">
                  <p className="text-gray-900 font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-gray-500 text-xs">Receptionist</p>
                </div>
                <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-sm">
                    {(user?.profile?.firstName || '')?.charAt(0) || ''}{(user?.profile?.lastName || '')?.charAt(0) || ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-rose-50 text-rose-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 shadow-md border border-sky-200 rounded-2xl p-6 sm:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome back, {user?.profile?.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-slate-600">
              Register patient complaints and direct them to appropriate doctors.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-sky-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`py-3 px-1 border-b-2 text-sm ${activeTab === 'complaints'
                  ? 'border-teal-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-sky-300'
                  }`}
              >
                Patient Complaints
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`py-3 px-1 border-b-2 text-sm ${activeTab === 'register'
                  ? 'border-teal-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-sky-300'
                  }`}
              >
                Register Complaint
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-3 px-1 border-b-2 text-sm ${activeTab === 'assignments'
                  ? 'border-teal-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-sky-300'
                  }`}
              >
                Doctor Assignments
              </button>
            </nav>
          </div>

          {/* Complaints List Tab */}
          {activeTab === 'complaints' && (
            <div>
              <div className="bg-white rounded-xl border border-sky-200 shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">
                    Recent Complaints
                  </h3>
                  {complaints.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="text-slate-400 mb-4">
                        <svg className="mx-auto h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints yet</h3>
                      <p className="text-slate-500">Complaints submitted by patients will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.map((complaint) => (
                        <div key={complaint._id} className="border border-sky-200 rounded-lg p-4 bg-sky-50/40">
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
                              <p className="text-slate-700 mb-2">{complaint.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
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
              <div className="bg-white rounded-xl border border-sky-200 shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Register New Patient Complaint
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Patient *
                      </label>
                      <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="w-full border border-sky-200 rounded-md px-3 py-2"
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Assign to Doctor *
                      </label>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full border border-sky-200 rounded-md px-3 py-2"
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Priority Level *
                      </label>
                      <select
                        value={complaintPriority}
                        onChange={(e) => setComplaintPriority(e.target.value)}
                        className="w-full border border-sky-200 rounded-md px-3 py-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Complaint Description *
                      </label>
                      <textarea
                        value={complaintDescription}
                        onChange={(e) => setComplaintDescription(e.target.value)}
                        rows={4}
                        className="w-full border border-sky-200 rounded-md px-3 py-2"
                        placeholder="Describe the patient's complaint in detail..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={registerComplaint}
                        className="bg-teal-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
                      >
                        Register Complaint
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              <div className="bg-white rounded-xl border border-sky-200 shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">
                      Doctor-Patient Assignments
                    </h3>
                    <button
                      onClick={() => setShowAssignmentModal(true)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
                    >
                      + New Assignment
                    </button>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="text-slate-400 mb-4">
                        <svg className="mx-auto h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 8.048M7.5 19H5a2 2 0 01-2-2v-1a6 6 0 0112 0v1a2 2 0 01-2 2h-5.5M9 9h6m-6 4h6m2 5H7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
                      <p className="text-slate-500">Create a new doctor-patient assignment to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment._id} className="border border-sky-200 rounded-lg p-4 bg-sky-50/40">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {assignment.patientId?.profile?.firstName} {assignment.patientId?.profile?.lastName}
                              </h4>
                              <p className="text-slate-600 mb-2">
                                <strong>Assigned Doctor:</strong> Dr. {assignment.doctorId?.profile?.firstName} {assignment.doctorId?.profile?.lastName}
                                {assignment.doctorId?.profile?.professionalInfo?.specialization && ` (${assignment.doctorId.profile.professionalInfo.specialization})`}
                              </p>
                              <p className="text-slate-600 mb-2">
                                <strong>Reason:</strong> {assignment.reason}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <span>Assigned on: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                    assignment.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                                      'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {assignment.status}
                                </span>
                              </div>
                            </div>
                            {assignment.status === 'active' && (
                              <button
                                onClick={() => endAssignment(assignment._id)}
                                className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                              >
                                End
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Assignment Modal */}
              {showAssignmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Assignment</h2>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Select Patient *
                        </label>
                        <input
                          type="text"
                          placeholder="Search patients..."
                          value={searchPatient}
                          onChange={(e) => {
                            setSearchPatient(e.target.value);
                            fetchPatients(e.target.value);
                          }}
                          className="w-full border border-sky-200 rounded-md px-3 py-2 mb-2"
                        />
                        <select
                          value={assignmentPatient}
                          onChange={(e) => setAssignmentPatient(e.target.value)}
                          className="w-full border border-sky-200 rounded-md px-3 py-2"
                        >
                          <option value="">Choose a patient...</option>
                          {patients.map((patient) => (
                            <option key={patient._id} value={patient._id}>
                              {patient.profile?.firstName} {patient.profile?.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Select Doctor *
                        </label>
                        <input
                          type="text"
                          placeholder="Search doctors..."
                          value={searchDoctor}
                          onChange={(e) => {
                            setSearchDoctor(e.target.value);
                            fetchDoctors(e.target.value);
                          }}
                          className="w-full border border-sky-200 rounded-md px-3 py-2 mb-2"
                        />
                        <select
                          value={assignmentDoctor}
                          onChange={(e) => setAssignmentDoctor(e.target.value)}
                          className="w-full border border-sky-200 rounded-md px-3 py-2"
                        >
                          <option value="">Choose a doctor...</option>
                          {doctors.map((doctor) => (
                            <option key={doctor._id} value={doctor._id}>
                              Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                              {doctor.profile?.professionalInfo?.specialization && ` - ${doctor.profile.professionalInfo.specialization}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Assignment Reason (Optional)
                        </label>
                        <textarea
                          value={assignmentReason}
                          onChange={(e) => setAssignmentReason(e.target.value)}
                          rows={3}
                          className="w-full border border-sky-200 rounded-md px-3 py-2"
                          placeholder="Enter reason for assignment..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setShowAssignmentModal(false);
                          setAssignmentPatient('');
                          setAssignmentDoctor('');
                          setAssignmentReason('');
                        }}
                        className="px-4 py-2 border border-sky-200 rounded-md text-sm font-medium text-slate-700 hover:bg-sky-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createAssignment}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                      >
                        Create Assignment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
