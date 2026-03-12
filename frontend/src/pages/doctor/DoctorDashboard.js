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
  const [patientDocId, setPatientDocId] = useState(null);
  const [activeTab, setActiveTab] = useState('complaints');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryType, setEntryType] = useState('prescription');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // Prescription fields
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    // Diagnosis fields
    diagnosisName: '',
    icd10Code: '',
    severity: 'mild',
    // Lab Recommendation fields
    testType: '',
    urgency: 'routine'
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/receptionist/complaints`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/assignments/doctor/${user._id}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const patientList = data.data.map(assignment => ({
          ...assignment.patientId,
          assignmentId: assignment._id
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
    }
  };

  const fetchPatientDocId = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Search for patient by user ID to get the medical Patient Document ID
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/patients/search?q=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const patient = data.data.patients.find(p => (p.userId?._id === userId || p.userId === userId));
        if (patient) {
          setPatientDocId(patient._id);
          fetchPatientRecords(patient._id);
          return patient._id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching patient doc ID:', error);
      return null;
    }
  };

  const fetchPatientRecords = async (pDocId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/patients/${pDocId}/medical-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalRecords(data.data?.records || []);
      } else if (response.status === 403) {
        // Explicitly set to null to indicate forbidden (no consent)
        setMedicalRecords(null);
      } else {
        setMedicalRecords([]);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setMedicalRecords([]);
    }
  };

  const createMedicalRecord = async () => {
    if (!patientDocId) {
      alert('Error: No patient medical profile found. Please select a patient correctly.');
      return;
    }

    if (!formData.title.trim()) {
      alert('Validation Error: Record title is required.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Validation Error: Clinical notes/description are required.');
      return;
    }

    // Type-specific rigorous validation
    if (entryType === 'prescription') {
      if (!formData.medicationName.trim() || !formData.dosage.trim() || !formData.frequency.trim() || !formData.duration.trim()) {
        alert('Validation Error: Please fill all prescription details: Medication Name, Dosage, Frequency, and Duration.');
        return;
      }
    } else if (entryType === 'diagnosis') {
      if (!formData.diagnosisName.trim()) {
        alert('Validation Error: Diagnosis name is required.');
        return;
      }
    } else if (entryType === 'lab_result') {
      if (!formData.testType.trim()) {
        alert('Validation Error: Test type is required for lab recommendations.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      let content = {
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      if (entryType === 'prescription') {
        content.prescription = {
          medicationName: formData.medicationName.trim(),
          dosage: formData.dosage.trim(),
          frequency: formData.frequency.trim(),
          duration: formData.duration.trim(),
          instructions: formData.instructions.trim()
        };
      } else if (entryType === 'diagnosis') {
        content.diagnosis = {
          diagnosisName: formData.diagnosisName.trim(),
          icd10Code: formData.icd10Code.trim(),
          severity: formData.severity
        };
      } else if (entryType === 'lab_result') {
        content.labResult = {
          testType: formData.testType.trim(),
          collectionDate: new Date(),
          results: [{
            testName: formData.testType.trim(),
            status: 'pending',
            notes: `Urgency: ${formData.urgency}. ${formData.description.trim()}`
          }]
        };
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/patients/${patientDocId}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordType: entryType,
          content
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Success: Medical record added successfully!');
        setShowEntryModal(false);
        resetForm();
        fetchPatientRecords(patientDocId);
      } else {
        alert(`Error: ${result.message || 'Failed to add record'}. Code: ${result.code || 'UNKNOWN'}`);
      }
    } catch (error) {
      console.error('Error creating record:', error);
      alert('System Error: Failed to communicate with the server. Please try again later.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      diagnosisName: '',
      icd10Code: '',
      severity: 'mild',
      testType: '',
      urgency: 'routine'
    });
  };

  const updateComplaintStatus = async (complaintId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/receptionist/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setActiveTab('records');
    const docId = await fetchPatientDocId(patient._id);
    if (!docId) {
      alert('Could not find medical profile for this patient. Ensure they have one.');
      setMedicalRecords([]);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600/80 backdrop-blur-md border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path d="M18 8v4m-2-2h4" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-600 to-pink-600">MedPortal <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-600 to-pink-600">Pro</span></span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">Dr. {user?.profile?.firstName} {user?.profile?.lastName}</p>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1">{user?.profile?.professionalInfo?.specialization || 'General Physician'}</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-white font-bold text-sm">
                    {(user?.profile?.firstName || '')?.charAt(0)}{(user?.profile?.lastName || '')?.charAt(0)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors duration-200 text-sm font-semibold"              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dr. {user?.profile?.firstName || 'User'}</span>
              </h1>
              <p className="mt-3 text-lg text-slate-500 font-medium">
                You have <span className="text-indigo-600 font-bold">{complaints.length} new regular patients</span> to review today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 overflow-hidden">
                {patients.slice(0, 4).map((p, i) => (
                  <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {p.profile?.firstName?.charAt(0)}
                  </div>
                ))}
                {patients.length > 4 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-xs font-bold text-slate-500">
                    +{patients.length - 4}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Pool</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Complaints List Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Inbound Consultations</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">All Cases</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Urgent</span>
                  </div>
                </div>
              </div>

              <div className="p-0">
                {complaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">All caught up!</h4>
                    <p className="text-slate-500 mt-2 max-w-sm">No new patient complaints assigned to you at the moment. Take a short break!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {complaints.map((complaint) => (
                      <div
                        key={complaint._id}
                        className={`group p-6 transition-all duration-200 hover:bg-indigo-50/30 cursor-pointer ${selectedPatient?._id === complaint.patientId?._id ? 'bg-indigo-50/50' : ''}`}
                        onClick={() => handlePatientSelect(complaint.patientId)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ring-1 ring-inset ${complaint.priority === 'high' ? 'bg-rose-50 text-rose-600 ring-rose-100' :
                                complaint.priority === 'medium' ? 'bg-amber-50 text-amber-600 ring-amber-100' :
                                  'bg-emerald-50 text-emerald-600 ring-emerald-100'
                              }`}>
                              {complaint.patientId?.profile?.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {complaint.patientId?.profile?.firstName} {complaint.patientId?.profile?.lastName}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${complaint.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                                    complaint.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                      'bg-emerald-100 text-emerald-700'
                                  }`}>
                                  {complaint.priority}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-1 italic">"{complaint.description}"</p>
                              <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-400">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  Added {new Date(complaint.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  Status: {complaint.status}
                                </span>
                              </div>
                              {complaint.status === 'open' && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateComplaintStatus(complaint._id, 'in_progress');
                                    }}
                                    className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                  >
                                    Accept Case
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientSelect(complaint.patientId);
                              }}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Patient Details Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            {selectedPatient ? (
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transform transition-all duration-300">
                <div className="relative h-24 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="absolute -bottom-10 left-6">
                    <div className="h-20 w-20 rounded-2xl bg-white p-1 hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-indigo-600 border border-slate-100">
                        {selectedPatient.profile?.firstName?.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-14 p-6">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}
                  </h3>
                  <p className="text-sm font-bold text-indigo-600 mt-1">Patient Profile</p>

                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Medical History</h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {medicalRecords.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400">No records accessible</p>
                          <p className="text-[10px] text-slate-400 mt-1">Ensure patient has granted consent</p>
                        </div>
                      ) : (
                        medicalRecords.map((record) => (
                          <div key={record._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-black text-slate-900 line-clamp-1">{record.content?.title || record.recordType}</p>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{new Date(record.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {record.content?.description || record.content?.medication || 'No details available'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="font-medium">{selectedPatient.email || 'No email provided'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEntryType('prescription');
                      setFormData({ ...formData, title: 'New Prescription' });
                      setShowEntryModal(true);
                    }}
                    className="mt-10 w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl text-base font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Medical Entry
                  </button>
                  <p className="mt-4 text-center text-xs font-medium text-slate-400 italic">Add prescriptions, diagnoses, or lab recommendations.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7a4 4 0 108 0 4 4 0 00-8 0zm-2 9a6 6 0 1112 0v1H6v-1z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800">No Patient Selected</h4>
                <p className="mt-2 text-sm text-slate-500 font-medium">Click on a consultation entry on the left to start reviewing the case.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Unified Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowEntryModal(false)}></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">New Medical Entry</h3>
                <p className="text-sm font-medium text-slate-500">For {selectedPatient?.profile?.firstName} {selectedPatient?.profile?.lastName}</p>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-8 pb-10">
              {/* Entry Type Selector */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                {['prescription', 'diagnosis', 'lab_result'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setEntryType(type);
                      setFormData({ ...formData, title: `New ${type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}` });
                    }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${entryType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {type === 'lab_result' ? 'Lab Rec' : type}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Record Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {entryType === 'prescription' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Medication</label>
                        <input
                          type="text"
                          value={formData.medicationName}
                          onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Dosage</label>
                        <input
                          type="text"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Frequency</label>
                        <input
                          type="text"
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Duration</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {entryType === 'diagnosis' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Diagnosis Name</label>
                      <input
                        type="text"
                        value={formData.diagnosisName}
                        onChange={(e) => setFormData({ ...formData, diagnosisName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">ICD-10 Code</label>
                        <input
                          type="text"
                          value={formData.icd10Code}
                          onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Severity</label>
                        <select
                          value={formData.severity}
                          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {entryType === 'lab_result' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Test Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Blood Count (CBC)"
                        value={formData.testType}
                        onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Urgency</label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="stat">STAT</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Clinical Notes</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setShowEntryModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={createMedicalRecord}
                    className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Finalize & Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;