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
                  </span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">Senior Resident</span>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <User className="text-white w-7 h-7 relative z-10" />
                </div>
              </div>
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
