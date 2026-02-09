import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('complaints');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

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
      fetchComplaints();
      fetchPatients();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/doctor/complaints/${user._id}`, {
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

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/assignments/doctor/${user._id}/patients`, {
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
      console.error('Error fetching assigned patients:', error);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/medical-records`, {
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

  const createPrescription = async () => {
    if (!selectedPatient || !prescriptionData.medication) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/patients/${selectedPatient._id}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordType: 'prescription',
          content: {
            title: `Prescription by Dr. ${user?.profile?.firstName} ${user?.profile?.lastName}`,
            medication: prescriptionData.medication,
            dosage: prescriptionData.dosage,
            frequency: prescriptionData.frequency,
            duration: prescriptionData.duration,
            instructions: prescriptionData.instructions,
            prescribedBy: user._id
          }
        })
      });

      if (response.ok) {
        alert('Prescription created successfully!');
        setShowPrescriptionModal(false);
        setPrescriptionData({
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        });
        if (selectedPatient) {
          fetchPatientRecords(selectedPatient._id);
        }
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to create prescription');
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient._id);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur border-b border-sky-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path d="M18 8v4m-2-2h4" />
                </svg>
              </span>
              <span className="text-xl font-semibold text-gray-900">Doctor Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm leading-4 text-right">
                  <p className="text-gray-900 font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-gray-500 text-xs">{user?.profile?.professionalInfo?.specialization || 'Doctor'}</p>
                </div>
                <div className="h-9 w-9 bg-sky-100 rounded-full flex items-center justify-center">
                  <span className="text-sky-700 font-semibold text-sm">
                    {(user?.profile?.firstName || '')?.charAt(0)}{(user?.profile?.lastName || '')?.charAt(0)}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-md text-sm hover:bg-rose-100">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 shadow-md border border-sky-200 rounded-2xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome back, Dr. {user?.profile?.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-slate-600">Manage patient complaints and create prescriptions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-sky-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Complaints</h3>
                {complaints.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-slate-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-600">No complaints assigned to you yet.</p>
                    <p className="text-slate-500 text-sm mt-1">New patient issues will appear here as they’re triaged.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="border border-sky-200 rounded-lg p-4 bg-sky-50/40">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {complaint.patientId?.profile?.firstName} {complaint.patientId?.profile?.lastName}
                            </h4>
                            <p className="text-sm text-slate-600">{complaint.description}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                            complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {complaint.priority}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePatientSelect(complaint.patientId)}
                          className="bg-sky-600 text-white px-3 py-1 rounded text-sm hover:bg-sky-700"
                        >
                          View Records
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Patient */}
          <div>
            {selectedPatient ? (
              <div className="bg-white rounded-xl border border-sky-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Patient</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Name</p>
                    <p className="text-gray-900">
                      {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Medical Records</p>
                    <p className="text-xs text-slate-500 mt-1">Last updated: Today</p>
                    <p className="text-gray-900">{medicalRecords.length} records</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="w-full bg-sky-600 text-white px-4 py-2 rounded-md text-sm hover:bg-sky-700"
                >
                  Create Prescription
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-sky-200 p-6 text-center shadow-sm">
                <div className="text-slate-400 mb-3">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7a4 4 0 108 0 4 4 0 00-8 0zm-2 9a6 6 0 1112 0v1H6v-1z" />
                  </svg>
                </div>
                <p className="text-slate-600">Select a patient to view details</p>
                <p className="text-sm text-slate-500 mt-1">Choose a complaint to review records and prescribe care.</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </main>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-slate-900/50"></div>
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10 border border-sky-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Prescription</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medication *"
                  value={prescriptionData.medication}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                  className="w-full border border-sky-200 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Dosage *"
                  value={prescriptionData.dosage}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                  className="w-full border border-sky-200 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Frequency *"
                  value={prescriptionData.frequency}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })}
                  className="w-full border border-sky-200 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Duration *"
                  value={prescriptionData.duration}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })}
                  className="w-full border border-sky-200 rounded-md px-3 py-2"
                />
                <textarea
                  placeholder="Instructions"
                  value={prescriptionData.instructions}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                  className="w-full border border-sky-200 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-sky-200 rounded-md text-slate-700 hover:bg-sky-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createPrescription}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
