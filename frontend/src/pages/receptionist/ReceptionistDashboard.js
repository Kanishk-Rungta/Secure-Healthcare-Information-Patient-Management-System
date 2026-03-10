import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Search,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Filter,
  UserPlus,
  ArrowLeft,
  CalendarCheck,
  Stethoscope,
  Activity,
  ShieldCheck,
  MoreVertical,
  Check,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [step, setStep] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Algorithm state
  const [schedulingData, setSchedulingData] = useState({
    patientName: '',
    specialty: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [rankedDoctors, setRankedDoctors] = useState([]);

  // Mock Data
  const doctors = [
    { id: 1, name: 'Dr. Sarah Wilson', specialty: 'Cardiology', workload: 85, continuity: true, availability: '10:00 AM' },
    { id: 2, name: 'Dr. James Chen', specialty: 'General Medicine', workload: 30, continuity: false, availability: '09:00 AM' },
    { id: 3, name: 'Dr. Elena Rodriguez', specialty: 'Cardiology', workload: 45, continuity: false, availability: '11:00 AM' },
    { id: 4, name: 'Dr. Robert Miller', specialty: 'Pediatrics', workload: 60, continuity: true, availability: '02:00 PM' },
  ];

  const appointments = [
    { id: 'APP-001', patient: 'John Doe', doctor: 'Dr. Sarah Wilson', time: '10:30 AM', status: 'Confirmed' },
    { id: 'APP-002', patient: 'Jane Smith', doctor: 'Dr. James Chen', time: '11:15 AM', status: 'Pending' },
    { id: 'APP-003', patient: 'Sam Wilson', doctor: 'Dr. Robert Miller', time: '01:00 PM', status: 'Checked-in' },
  ];

  // Weighted Algorithm
  const runAlgorithm = () => {
    const scored = doctors.map(doc => {
      let score = 0;
      const breakdown = { specialty: 0, availability: 0, workload: 0, continuity: 0 };

      // 1. Specialty Match (40 pts)
      if (doc.specialty === schedulingData.specialty) {
        score += 40;
        breakdown.specialty = 40;
      } else if (schedulingData.specialty === 'General Medicine') {
        score += 20;
        breakdown.specialty = 20;
      }

      // 2. Availability (30 pts)
      // Mock logic: 30 for exact morning, 10 for afternoon
      const isMorning = schedulingData.preferredTime?.includes('AM') || !schedulingData.preferredTime;
      if (isMorning && doc.availability.includes('AM')) {
        score += 30;
        breakdown.availability = 30;
      } else {
        score += 10;
        breakdown.availability = 10;
      }

      // 3. Workload Balance (20 pts)
      // Score = 20 * (1 - workload/100)
      const workloadScore = Math.round(20 * (1 - doc.workload / 100));
      score += workloadScore;
      breakdown.workload = workloadScore;

      // 4. Continuity (10 pts)
      if (doc.continuity) {
        score += 10;
        breakdown.continuity = 10;
      }

      return { ...doc, totalScore: score, breakdown };
    }).sort((a, b) => b.totalScore - a.totalScore);

    setRankedDoctors(scored);
    setStep(2);
  };

  const getWorkloadColor = (load) => {
    if (load > 80) return 'bg-red-500';
    if (load > 50) return 'bg-orange-400';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl text-slate-800 tracking-tighter">MEDFLOW</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'appointments', label: 'Appointments', icon: Clock },
            { id: 'patients', label: 'Patient Registry', icon: Users },
            { id: 'reporting', label: 'Analytics', icon: Activity },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-black text-slate-800 uppercase">Access: L1 Reception</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Session Audited</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('authUser');
            localStorage.removeItem('authTokens');
            navigate('/login');
          }}
          className="mt-4 w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>


      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">

        {/* Top Actions Bar */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Front Desk Operations</h1>
            <p className="text-slate-500 font-medium">Tuesday, March 10th • 09:44 AM</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient record..."
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm w-80 font-medium text-slate-700"
              />
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black tracking-tight hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus className="w-5 h-5" />
              Schedule Flow
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main List Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  Active Appointments
                </h3>
                <Filter className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>

              <div className="space-y-4">
                {appointments.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600">
                        {app.time.split(':')[0]}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{app.patient}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{app.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${app.status === 'Confirmed' ? 'bg-green-100 text-green-700 italic border border-green-200' :
                        app.status === 'Pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}>
                        {app.status}
                      </span>
                      <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Grid Visualization */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm overflow-hidden relative">
              <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest text-[11px] text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Capacity Utilization (Next 5 Days)
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                  <div key={day} className="space-y-3">
                    <p className="text-center font-black text-slate-400 text-xs uppercase">{day}</p>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                      <span className="text-xl font-black text-slate-800">12</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Slots</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-3/4 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Physician Workload
              </h3>
              <div className="space-y-6">
                {doctors.map(doc => (
                  <div key={doc.id}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-slate-700 text-sm">{doc.name}</p>
                      <p className="text-xs font-black text-slate-500">{doc.workload}%</p>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${getWorkloadColor(doc.workload)}`}
                        style={{ width: `${doc.workload}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 leading-tight">Emergency Queue Protocol</h3>
                <p className="text-indigo-100 text-sm font-medium mb-6">Automated STAT overrides are active. For immediate triage, use the RED button below.</p>
                <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transform group-hover:scale-105 transition-all">
                  Initiate Redirect
                </button>
              </div>
              <Activity className="absolute bottom-[-10%] right-[-10%] w-32 h-32 opacity-10 rotate-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowWizard(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">

            {/* Wizard Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Step {step} of 3</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {step === 1 ? 'Patient Information' : step === 2 ? 'Doctor Match Results' : 'Confirm Scheduling'}
                </h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-12 h-1.5 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="p-10">

              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-2">Patient Full Name</label>
                      <input
                        type="text"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100"
                        placeholder="e.g. Michael Scott"
                        value={schedulingData.patientName}
                        onChange={(e) => setSchedulingData({ ...schedulingData, patientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-2">Reason (Specialty)</label>
                      <select
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 appearance-none"
                        value={schedulingData.specialty}
                        onChange={(e) => setSchedulingData({ ...schedulingData, specialty: e.target.value })}
                      >
                        <option value="">Select Specialty</option>
                        <option>General Medicine</option>
                        <option>Cardiology</option>
                        <option>Pediatrics</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-2">Preferred Date</label>
                      <input
                        type="date"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100"
                        value={schedulingData.preferredDate}
                        onChange={(e) => setSchedulingData({ ...schedulingData, preferredDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-2">Preferred Shift</label>
                      <div className="flex gap-2">
                        {['Morning AM', 'Afternoon PM'].map(time => (
                          <button
                            key={time}
                            onClick={() => setSchedulingData({ ...schedulingData, preferredTime: time })}
                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border ${schedulingData.preferredTime === time ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={runAlgorithm}
                    disabled={!schedulingData.specialty}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg uppercase tracking-tight shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    Run Match Algorithm
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                    {rankedDoctors.map((doc, idx) => (
                      <div key={doc.id} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center relative shadow-sm">
                              <Stethoscope className="w-6 h-6 text-indigo-600" />
                              {idx === 0 && <div className="absolute -top-2 -right-2 bg-yellow-400 text-[8px] font-black p-1 rounded-lg border-2 border-white uppercase animate-bounce">Top</div>}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-lg">{doc.name}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{doc.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600">{doc.totalScore}</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Match Score</p>
                          </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                          {Object.entries(doc.breakdown).map(([key, val]) => (
                            <div key={key} className="flex-1">
                              <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(val / (key === 'specialty' ? 40 : key === 'availability' ? 30 : key === 'workload' ? 20 : 10)) * 100}%` }} />
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mt-1 text-center">{key}</p>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setStep(3)}
                          className="w-full py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-sm text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                        >
                          Select Physician
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-black text-sm uppercase px-4"><ArrowLeft className="w-4 h-4" /> Back to Parameters</button>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-8">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-green-100">
                    <Check className="w-12 h-12 text-green-600 stroke-[4px]" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-black text-slate-800">Assign & Finalize</h4>
                    <p className="text-slate-500 font-medium px-20">You are assigning <span className="text-indigo-600 font-bold">{schedulingData.patientName}</span> to <span className="text-indigo-600 font-bold">{rankedDoctors[0]?.name}</span> for {schedulingData.preferredDate}.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase mb-1">Time Assigned</p>
                      <p className="font-bold text-slate-800">09:15 AM - Standard Slot</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase mb-1">Clinic Status</p>
                      <p className="font-bold text-green-600">Level 1 Normal Operational</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase text-sm hover:bg-slate-200 transition-all">Previous</button>
                    <button
                      onClick={() => {
                        setShowWizard(false);
                        setStep(1);
                      }}
                      className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
                    >
                      Confirm Appointment
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceptionistDashboard;
