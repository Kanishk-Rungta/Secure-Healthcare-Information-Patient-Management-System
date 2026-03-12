import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showBillModal, setShowBillModal] = useState(false);
  const [bill, setBill] = useState({
    title: 'Pharmacy Bill',
    description: '',
    amount: 0,
    items: [{ description: '', cost: 0 }]
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
      const response = await fetch('http://localhost:5000/api/consent/my-consents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const consentedPatients = data.data.map(consent => ({
          _id: consent.patientId._id,
          profile: consent.patientId.userId.profile,
          consentId: consent._id,
          dataType: consent.dataType
        }));
        setPatients(consentedPatients);
      }
    } catch (error) {
      console.error('Error fetching consented patients:', error);
    }
  };

  const fetchPatientPrescriptions = async (patientId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/medical-records?recordType=prescription`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.data.records || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientPrescriptions(selectedPatient._id);
    }
  }, [selectedPatient]);

  const handleGenerateBill = async () => {
    if (!selectedPatient || bill.amount <= 0) {
      alert('Please enter a valid amount');
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
          recordType: 'billing',
          content: {
            title: bill.title,
            description: bill.description,
            billing: {
              amount: bill.amount,
              currency: 'USD',
              items: bill.items,
              status: 'pending',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            }
          }
        })
      });

      if (response.ok) {
        alert('Bill generated successfully!');
        setShowBillModal(false);
        setBill({
          title: 'Pharmacy Bill',
          description: '',
          amount: 0,
          items: [{ description: '', cost: 0 }]
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to generate bill');
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error generating bill');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      <nav className="relative bg-gradient-to-r from-emerald-600 via-lime-600 to-yellow-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 via-lime-700 to-yellow-700">Pharmacist Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">{user?.profile?.firstName} {user?.profile?.lastName}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 font-semibold">Logout</button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Patients (Consented)</h2>
            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-sm text-slate-500">No patients have granted you access yet.</p>
              ) : (
                patients.map(patient => (
                  <div 
                    key={patient._id} 
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedPatient?._id === patient._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}
                  >
                    <p className="font-medium text-slate-900">{patient.profile.firstName} {patient.profile.lastName}</p>
                    <p className="text-xs text-slate-500">Access: {patient.dataType}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
              {selectedPatient ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Patient: {selectedPatient.profile.firstName} {selectedPatient.profile.lastName}
                    </h2>
                    <button 
                      onClick={() => setShowBillModal(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
                    >
                      Generate Bill
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Prescriptions</h3>
                    {prescriptions.length === 0 ? (
                      <p className="text-sm text-slate-400">No prescriptions found for this patient.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {prescriptions.map(pres => (
                          <div key={pres._id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                            <div className="flex justify-between">
                              <p className="font-bold text-slate-800">{pres.content.prescription.medicationName}</p>
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                {pres.content.prescription.dosage}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{pres.content.prescription.instructions}</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              <span>Freq: {pres.content.prescription.frequency}</span>
                              <span>Qty: {pres.content.prescription.quantity}</span>
                              <span>Refills: {pres.content.prescription.refills}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p>Select a patient to view prescriptions and generate bills</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showBillModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Generate Pharmacy Bill</h3>
              <button onClick={() => setShowBillModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bill Title</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={bill.title}
                  onChange={e => setBill({...bill, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Items & Costs</label>
                {bill.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Medication name"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                      value={item.description}
                      onChange={e => {
                        const newItems = [...bill.items];
                        newItems[index].description = e.target.value;
                        setBill({...bill, items: newItems});
                      }}
                    />
                    <input 
                      type="number" 
                      placeholder="Cost"
                      className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                      value={item.cost}
                      onChange={e => {
                        const newItems = [...bill.items];
                        newItems[index].cost = parseFloat(e.target.value) || 0;
                        const newTotal = newItems.reduce((sum, i) => sum + i.cost, 0);
                        setBill({...bill, items: newItems, amount: newTotal});
                      }}
                    />
                  </div>
                ))}
                <button 
                  onClick={() => setBill({...bill, items: [...bill.items, { description: '', cost: 0 }]})}
                  className="text-emerald-600 text-xs font-bold"
                >
                  + Add Item
                </button>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-emerald-600">${bill.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateBill}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-200"
              >
                Create Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;
