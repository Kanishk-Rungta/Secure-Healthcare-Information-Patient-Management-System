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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">Doctor Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-gray-500 text-xs">{user?.profile?.professionalInfo?.specialization || 'Doctor'}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {(user?.profile?.firstName || '')?.charAt(0)}{(user?.profile?.lastName || '')?.charAt(0)}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {user?.profile?.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">Manage patient complaints and create prescriptions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Complaints</h3>
                {complaints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No complaints assigned to you.</p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {complaint.patientId?.profile?.firstName} {complaint.patientId?.profile?.lastName}
                            </h4>
                            <p className="text-sm text-gray-500">{complaint.description}</p>
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
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
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
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Patient</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">
                      {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Medical Records</p>
                    <p className="text-gray-900">{medicalRecords.length} records</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Create Prescription
                </button>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Prescription</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Medication *"
                  value={prescriptionData.medication}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Dosage *"
                  value={prescriptionData.dosage}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Frequency *"
                  value={prescriptionData.frequency}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Duration *"
                  value={prescriptionData.duration}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <textarea
                  placeholder="Instructions"
                  value={prescriptionData.instructions}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createPrescription}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
