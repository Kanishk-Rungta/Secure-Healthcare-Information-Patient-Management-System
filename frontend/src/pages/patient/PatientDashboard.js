import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Activity,
  Calendar,
  FileText,
  ShieldCheck,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Stethoscope,
  ChevronRight,
  Database,
  Thermometer,
  MoreVertical,
  Settings
} from 'lucide-react';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records');

  // Mock Patient Data
  const stats = [
    { label: 'Next Appt', value: 'Today, 2PM', icon: Calendar, color: 'indigo' },
    { label: 'Blood Type', value: 'A+ Positive', icon: Heart, color: 'rose' },
    { label: 'Verified Files', value: '14 Records', icon: Database, color: 'emerald' },
    { label: 'Health Score', value: 'Optimum', icon: Activity, color: 'sky' },
  ];

  const medicalRecords = [
    { id: 'REC-9941', type: 'Clinical Summary', doctor: 'Dr. Sarah Wilson', date: 'March 08, 2026', status: 'Verified' },
    { id: 'REC-9942', type: 'Laboratory Results', doctor: 'Lab Unit B', date: 'March 05, 2026', status: 'Confidential' },
    { id: 'REC-9943', type: 'Immunization Log', doctor: 'Dr. James Chen', date: 'Feb 20, 2026', status: 'Verified' },
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
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-rose-500/30">
              <Heart className="text-white w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-slate-800 tracking-tight leading-none">MYPORTAL</span>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Health Hub</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'records', label: 'Medical History', icon: FileText },
              { id: 'appointments', label: 'My Visits', icon: Calendar },
              { id: 'consents', label: 'Privacy Control', icon: ShieldCheck },
              { id: 'settings', label: 'Account Data', icon: Settings },
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
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/10" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Encrypt Active</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold leading-tight">Your data is secured using end-to-end HIPAA compliant protocols.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-5 rounded-3xl font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group active:scale-95 border border-transparent hover:border-rose-100"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">End Session</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Modern Header */}
        <header className="h-28 bg-white/50 backdrop-blur-3xl border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-10 transition-all">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
              {user ? `Hello, ${user.profile?.firstName}` : 'Welcome, Back'}
            </h1>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Patient Health Portal • Verified Identity
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white ring-4 ring-indigo-500/10">3</div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:bg-slate-50 transition-all active:scale-95">
                  <Bell className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="flex items-center gap-5 cursor-pointer group">
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 leading-none">
                    {user ? `${user.profile?.firstName} ${user.profile?.lastName}` : 'Guest User'}
                  </span>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-md">Patient #PAT-990</span>
                </div>
                <div className="w-14 h-14 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <User className="text-white w-7 h-7 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Patient Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFF]/50 relative space-y-12">

          {/* Health Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center border border-${stat.color}-500/10`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </div>
                  <div className="p-1 px-3 rounded-full bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">Refreshed</div>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1.5">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* Main Sector: History */}
            <div className="xl:col-span-2 space-y-10">

              <section className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
                <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Documentation</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Medical Files</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Request Access
                  </button>
                </div>

                <div className="divide-y divide-slate-50">
                  {medicalRecords.map((rec) => (
                    <div key={rec.id} className="p-10 flex flex-wrap lg:flex-nowrap items-center gap-10 hover:bg-slate-50/50 transition-all group cursor-pointer">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500 uppercase tracking-tight">#{rec.id}</span>
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">• {rec.date}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{rec.type}</h3>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                          <Stethoscope className="w-4 h-4" />
                          Authorized by: <span className="text-slate-600">{rec.doctor}</span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className={`px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${rec.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {rec.status}
                        </div>
                        <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Lab Result Quickview */}
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl p-10 space-y-10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <Database className="w-40 h-40" />
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">Laboratory Telemetry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[40px] flex items-center gap-6 group/item hover:bg-white transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover/item:bg-indigo-600 transition-colors">
                      <Thermometer className="w-7 h-7 text-indigo-600 group-hover/item:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800 leading-none">Vitals Log</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase mt-2">March 10 Audit</p>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[40px] flex items-center gap-6 grayscale group/item hover:bg-white hover:grayscale-0 transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover/item:bg-rose-500 transition-colors">
                      <Activity className="w-7 h-7 text-slate-300 group-hover/item:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-400 group-hover/item:text-slate-800 leading-none">Imaging Registry</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase mt-2">No Active Data</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Sector: Support & Alerts */}
            <div className="space-y-10">

              {/* Emergency Assistance */}
              <div className="bg-rose-500 rounded-[48px] p-10 text-white shadow-2xl shadow-rose-600/30 relative overflow-hidden group border border-rose-400/50">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-10 border border-white/20 backdrop-blur-lg">
                    <AlertCircle className="w-7 h-7 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tighter">Emergency Support</h3>
                  <p className="text-rose-100 font-bold text-sm leading-relaxed mb-10">Instant access to your verified emergency contacts and nearby medical facilities.</p>
                  <button className="w-full py-5 bg-white text-rose-600 font-black rounded-[32px] shadow-xl hover:bg-rose-50 active:scale-95 transition-all uppercase tracking-widest text-[11px]">
                    Initiate Help Request
                  </button>
                </div>
              </div>

              {/* Health Wellness Pulse */}
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mt-10 -mr-10" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10">Wellness Metrics</h3>
                <div className="space-y-10">
                  {[
                    { label: 'Sleep Consistency', val: '84%', color: 'indigo' },
                    { label: 'Activity Goal', val: '62%', color: 'sky' },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black uppercase tracking-tight text-slate-300">{m.label}</span>
                        <span className="text-sm font-black text-indigo-400">{m.val}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-${m.color}-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-full`} style={{ width: m.val }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/10">
                  View Comprehensive Wellness
                </button>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-lg shadow-indigo-500/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 px-2 leading-none">Notifications</h3>
                <div className="space-y-8">
                  {[
                    { title: 'Appointment Reminder', time: '1h ago', color: 'indigo', detail: 'Consulte Dr. Sarah at 2PM' },
                    { title: 'New Lab Report', time: 'Yesterday', color: 'emerald', detail: 'Hematology Results uploaded' },
                    { title: 'Privacy Update', time: '2d ago', color: 'slate', detail: 'Data consent policy updated' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer relative">
                      <div className={`shrink-0 w-3 h-3 rounded-full bg-${log.color}-500 mt-1.5 shadow-[0_0_10px_rgba(var(--${log.color}-rgb),0.5)] group-hover:scale-125 transition-transform`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">{log.title}</p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">{log.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modern CSS for Scrollbars */}
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
      `}} />
    </div>
  );
};

export default PatientDashboard;
