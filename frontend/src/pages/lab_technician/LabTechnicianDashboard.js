import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}`;

const LabTechnicianDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [labResult, setLabResult] = useState({
    testType: '',
    title: '',
    description: '',
    results: [{ testName: '', value: '', unit: '', status: 'pending' }]
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchConsentedPatients();
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const fetchConsentedPatients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/consent/my-consents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Access consents from the data object
        const consents = data.data?.consents || data.data || [];
        const consentedPatients = consents.map(consent => {
          if (!consent.patientId) return null;
          return {
            _id: consent.patientId._id,
            profile: consent.patientId.userId?.profile || {},
            email: consent.patientId.userId?.email || '',
            consentId: consent._id,
            dataType: consent.dataType
          };
        }).filter(Boolean);
        setPatients(consentedPatients);
      }
    } catch (error) {
      console.error('Error fetching consented patients:', error);
    }
  };

  const handlePublishResult = async () => {
    if (!selectedPatient || !labResult.testType || !labResult.title) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/patients/${selectedPatient._id}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordType: 'lab_result',
          content: {
            title: labResult.title,
            description: labResult.description,
            labResult: {
              testType: labResult.testType,
              resultDate: new Date(),
              results: labResult.results
            }
          }
        })
      });

      if (response.ok) {
        alert('Lab results published successfully!');
        setShowResultModal(false);
        setLabResult({
          testType: '',
          title: '',
          description: '',
          results: [{ testName: '', value: '', unit: '', status: 'pending' }]
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to publish results');
      }
    } catch (error) {
      console.error('Error publishing results:', error);
      alert('Error publishing results');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">
      <nav className="relative bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-800 via-teal-700 to-cyan-700">Lab Technician Portal - LabTechnicianDashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">{user?.profile?.firstName} {user?.profile?.lastName}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 font-semibold">Logout</button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Patients (Consented)</h2>
            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-sm text-slate-500">No patients have granted you access yet.</p>
              ) : (
                patients.map(patient => (
                  <div 
                    key={patient.consentId} 
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedPatient?.consentId === patient.consentId ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300'}`}
                  >
                    <p className="font-medium text-slate-900">
                      {patient.profile?.firstName || 'Unknown'} {patient.profile?.lastName || 'Patient'}
                    </p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight mt-1">
                      Access: {patient.dataType?.replace('_', ' ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            {selectedPatient ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Patient: {selectedPatient.profile.firstName} {selectedPatient.profile.lastName}
                  </h2>
                  <button 
                    onClick={() => setShowResultModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Publish Lab Result
                  </button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Patient Details</h3>
                  <p className="text-sm">Gender: {selectedPatient.profile.gender || 'N/A'}</p>
                  <p className="text-sm">Date of Birth: {selectedPatient.profile.dateOfBirth ? new Date(selectedPatient.profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Select a patient to view details and publish results</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showResultModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Publish Lab Result</h3>
              <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Type</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Blood Work"
                    value={labResult.testType}
                    onChange={e => setLabResult({...labResult, testType: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Complete Blood Count"
                    value={labResult.title}
                    onChange={e => setLabResult({...labResult, title: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  placeholder="Notes about the test..."
                  value={labResult.description}
                  onChange={e => setLabResult({...labResult, description: e.target.value})}
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800">Results</label>
                {labResult.results.map((res, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end border-b border-slate-50 pb-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Parameter</label>
                      <input 
                        type="text" 
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        placeholder="Hemoglobin"
                        value={res.testName}
                        onChange={e => {
                          const newResults = [...labResult.results];
                          newResults[index].testName = e.target.value;
                          setLabResult({...labResult, results: newResults});
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Value</label>
                      <input 
                        type="text" 
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        placeholder="14.2"
                        value={res.value}
                        onChange={e => {
                          const newResults = [...labResult.results];
                          newResults[index].value = e.target.value;
                          setLabResult({...labResult, results: newResults});
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                      <input 
                        type="text" 
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        placeholder="g/dL"
                        value={res.unit}
                        onChange={e => {
                          const newResults = [...labResult.results];
                          newResults[index].unit = e.target.value;
                          setLabResult({...labResult, results: newResults});
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                        value={res.status}
                        onChange={e => {
                          const newResults = [...labResult.results];
                          newResults[index].status = e.target.value;
                          setLabResult({...labResult, results: newResults});
                        }}
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setLabResult({...labResult, results: [...labResult.results, { testName: '', value: '', unit: '', status: 'normal' }]})}
                  className="text-blue-600 text-xs font-bold hover:text-blue-800"
                >
                  + Add Parameter
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublishResult}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                Publish & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTechnicianDashboard;
