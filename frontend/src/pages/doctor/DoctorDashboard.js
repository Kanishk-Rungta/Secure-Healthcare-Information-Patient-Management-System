import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Activity,
  Stethoscope,
  Search,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  User,
  Thermometer,
  Calendar,
  ChevronRight,
  Database
} from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaints');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Mock Data (Simplified for UI/UX demonstration based on original structure)
  const [complaints, setComplaints] = useState([
    { id: 'CMP-101', patientName: 'Arthur Morgan', age: 36, symptom: 'Persistent Chest Pain', priority: 'STAT', time: '10m ago' },
    { id: 'CMP-102', patientName: 'Sadie Adler', age: 29, symptom: 'Acute Respiratory Distress', priority: 'URGENT', time: '25m ago' },
    { id: 'CMP-103', patientName: 'John Marston', age: 41, symptom: 'Glucose Level Volatility', priority: 'ROUTINE', time: '1h ago' },
  ]);

  const stats = [
    { label: 'Active Consults', value: '12', icon: Activity, color: 'indigo' },
    { label: 'Pending RX', value: '05', icon: ClipboardList, color: 'amber' },
    { label: 'Critical Care', value: '02', icon: AlertCircle, color: 'rose' },
    { label: 'Efficiency', value: '98%', icon: TrendingUp, color: 'emerald' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] font-sans antialiased overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Stethoscope className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-slate-800 tracking-tight leading-none">MD PORTAL</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Clinical Unit</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'complaints', label: 'Patient Triage', icon: Activity },
              { id: 'patients', label: 'My Ward', icon: Users },
              { id: 'records', label: 'Clinical History', icon: FileText },
              { id: 'analytics', label: 'Care Metrics', icon: TrendingUp },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all duration-300 group ${activeTab === item.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2'
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/30 mb-8 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600/5 rounded-full blur-xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/10" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">DR MD-ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold leading-tight">Secure session established. Cryptographic logs active.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-5 rounded-3xl font-black text-rose-500 hover:bg-rose-50 transition-all group active:scale-95 border border-transparent hover:border-rose-100"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Terminate Portal</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Modern Header */}
        <header className="h-28 bg-white/50 backdrop-blur-3xl border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Global Care Matrix</h1>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Tuesday • March 10, 2026 • Ward A
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="relative group hidden lg:block">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search patient record ID..."
                className="bg-slate-100/80 rounded-[28px] pl-14 pr-8 py-4 w-80 outline-none font-bold text-slate-600 placeholder:text-slate-400 border border-transparent focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white ring-4 ring-rose-500/10">2</div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:bg-slate-50 transition-all active:scale-95">
                  <Bell className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="flex items-center gap-5 cursor-pointer group">
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 leading-none">
                    {user ? `Dr. ${user.profile?.lastName}` : 'Attending Physician'}
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
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
              <span className="text-xl font-bold tracking-tight text-slate-800">MedPortal <span className="text-indigo-600">Pro</span></span>
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
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">Senior Resident</span>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <User className="text-white w-7 h-7 relative z-10" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors duration-200 text-sm font-semibold"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Clinical Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFF]/50 relative space-y-12">

          {/* Quick Metrics Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center border border-${stat.color}-500/10 shadow-inner`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1.5 rounded-full border border-${stat.color}-200 bg-${stat.color}-100/50 text-${stat.color}-600 uppercase tracking-widest`}>
                    Live
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1.5">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Active</span>
                </div>
              </div>
            ))}
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* Main Sector: Test Pipeline */}
            <div className="xl:col-span-2 space-y-10">

              <section className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
                <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <ClipboardList className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attending Queue</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Triage Priority</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                      <Thermometer className="w-6 h-6" />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/40 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <Plus className="w-5 h-5" />
                      New Consult
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {complaints.map((c) => (
                    <div key={c.id} className="p-10 flex flex-wrap lg:flex-nowrap gap-10 hover:bg-slate-50/50 transition-all group overflow-hidden relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${c.priority === 'STAT' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : c.priority === 'URGENT' ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-tight ${c.priority === 'STAT' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500'}`}>
                            {c.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">• Request ID: {c.id}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{c.patientName}</h3>
                          <p className="text-sm font-bold text-slate-500 mt-1 italic leading-relaxed">"{c.symptom}"</p>
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {c.time}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            <User className="w-3 h-3" />
                            {c.age} Years Old
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
                                  Added 2 hours ago
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  ID: {complaint.patientId?._id?.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-end gap-6 shrink-0">
                        <div className="flex gap-4">
                          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95 group/btn">
                            <Database className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(c);
                              setShowPrescriptionModal(true);
                            }}
                            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:translate-x-1 group/action"
                          >
                            Diagnose & Review
                            <ChevronRight className="w-5 h-5 group-hover/action:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Health Registry Table */}
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl p-10 space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Global Ward Monitoring</h3>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all pb-1">Historical Logs</button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {['Hematology Pulse', 'Vital Metrics', 'Imaging Archive'].map(title => (
                    <div key={title} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] group hover:bg-indigo-50/50 hover:border-indigo-100 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-indigo-600 transition-colors">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-800 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">{title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Systems Optimized</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sector: Sidebar Analytics */}
            <div className="space-y-10">

              {/* Specialized MD Tools */}
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mt-16 -mr-16 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center mb-10 shadow-xl shadow-indigo-600/30">
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tighter">Attending Protocols</h3>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10 italic">Standardized healthcare protocols for Ward Attendants in clinical environments.</p>

                  <div className="space-y-4 mb-10">
                    {['Critical Triage Protocol', 'Infectious Control (IC)', 'NARCO-Log Authorization'].map(p => (
                      <div key={p} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group/p cursor-pointer hover:bg-white/10 transition-all">
                        <span className="text-xs font-black text-slate-300 group-hover/p:text-white transition-colors uppercase tracking-tight">{p}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover/p:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-5 bg-white text-slate-900 font-black rounded-3xl shadow-2xl shadow-black/20 hover:bg-slate-100 active:scale-95 transition-all uppercase tracking-widest text-[11px] mt-auto">
                    View Comprehensive Handbook
                  </button>
                </div>
              </div>

              {/* Critical Alert Override */}
              <div className="bg-rose-500 rounded-[48px] p-10 text-white shadow-2xl shadow-rose-600/30 relative overflow-hidden group border border-rose-400/50">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-lg">
                    <AlertCircle className="w-7 h-7 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tighter">Emergency Override</h3>
                  <p className="text-rose-100 font-bold text-sm leading-relaxed mb-10">Request <strong>STAT Laboratory Protocol</strong> or <strong>Rapid Response</strong> for active patients in Level 1 trauma status.</p>
                  <button className="w-full py-5 bg-white text-rose-600 font-black rounded-[32px] shadow-xl hover:bg-rose-50 active:scale-95 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4" />
                    Bypass Standard Queue
                  </button>
                </div>
              </div>

              {/* Attendance Log */}
              <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-lg shadow-indigo-500/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 px-2 leading-none">attending Feed</h3>
                <div className="space-y-8">
                  {[
                    { title: 'Lab Results: Arthur Morgan', time: '5m ago', color: 'emerald', detail: 'Ready for Review' },
                    { title: 'Stat Consult: Room 204', time: '14m ago', color: 'rose', detail: 'In Progress' },
                    { title: 'Staff Shift Exchange', time: '1h ago', color: 'indigo', detail: 'Logged by Admin' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer relative">
                      <div className={`shrink-0 w-3 h-3 rounded-full bg-${log.color}-500 mt-1 shadow-[0_0_10px_rgba(var(--${log.color}-rgb),0.5)] group-hover:scale-125 transition-transform`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">{log.title}</p>
                          <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{log.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">{log.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-12 py-5 bg-slate-50 border border-slate-100 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  Open Regulatory Console
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

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Records</p>
                      <p className="text-xl font-black text-slate-800">{medicalRecords.length}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xl font-black text-emerald-600">Active</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="font-medium">{selectedPatient.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="font-medium">Insurance verified</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="mt-10 w-full bg-slate-900 text-white px-6 py-4 rounded-2xl text-base font-bold hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Prescription
                  </button>
                  <p className="mt-4 text-center text-xs font-medium text-slate-400 italic">This will update the patient's global records.</p>
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

      {/* Prescription Modal - Redesigned */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPrescriptionModal(false)}></div>

          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Create Prescription</h3>
                <p className="text-sm font-medium text-slate-500">For {selectedPatient.profile?.firstName} {selectedPatient.profile?.lastName}</p>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-8 pb-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Medication Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin"
                    value={prescriptionData.medication}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={prescriptionData.dosage}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily"
                    value={prescriptionData.frequency}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 7 days"
                    value={prescriptionData.duration}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Instructions & Observations</label>
                <textarea
                  placeholder="Additional notes for the patient or pharmacist..."
                  value={prescriptionData.instructions}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={createPrescription}
                  className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Finalize & Send
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modern CSS for aesthetics */}
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #EEF2F7;
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #E2E8F0;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}} />
    </div>
  );
};

const Zap = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 10V3L4 14H11V21L20 10H13Z" />
  </svg>
);

export default DoctorDashboard;
