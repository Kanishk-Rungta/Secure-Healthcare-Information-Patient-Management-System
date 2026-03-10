import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Beaker,
  Activity,
  ClipboardList,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  Filter,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Database,
  Thermometer,
  ChevronRight,
  MoreVertical,
  Plus,
  FileText
} from 'lucide-react';

const LabTechnicianDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Mock Performance Stats
  const performanceStats = [
    { label: 'Pending', value: '14', trend: '+2', icon: Clock, color: 'sky' },
    { label: 'Processing', value: '06', trend: '-1', icon: Activity, color: 'indigo' },
    { label: 'Completed', value: '32', trend: '+8', icon: CheckCircle2, color: 'emerald' },
    { label: 'Crit. Alerts', value: '03', trend: '! Urgent', icon: AlertCircle, color: 'rose' },
  ];

  // Mock Lab Queue
  const [labQueue, setLabQueue] = useState([
    { id: 'LAB-2041', patient: 'Arthur Morgan', test: 'Differential Leukocyte Count', priority: 'STAT', status: 'Pending', time: '08:45 AM', sample: 'Blood' },
    { id: 'LAB-2042', patient: 'Sadie Adler', test: 'Lipid Profile Screen', priority: 'URGENT', status: 'Processing', time: '09:12 AM', sample: 'Serum' },
    { id: 'LAB-2043', patient: 'John Marston', test: 'HbA1c Glycated Hemoglobin', priority: 'ROUTINE', status: 'Pending', time: '10:05 AM', sample: 'Blood' },
    { id: 'LAB-2044', patient: 'Charles Smith', test: 'Renal Function Test (RFT)', priority: 'ROUTINE', status: 'Completed', time: '07:30 AM', sample: 'Urine' },
  ]);

  // Mock Equipment Status
  const equipment = [
    { id: 1, name: 'Sysmex XN-3100', status: 'Operational', health: 98, lastCal: '2024-03-01' },
    { id: 2, name: 'Roche Cobas c501', status: 'Operational', health: 84, lastCal: '2024-02-15' },
    { id: 3, name: 'Centrifuge CF-90', status: 'Maintenance', health: 42, lastCal: '2024-01-20' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getPriorityStyles = (p) => {
    switch (p) {
      case 'STAT': return 'bg-rose-500/10 text-rose-600 border-rose-200 ring-rose-500/10';
      case 'URGENT': return 'bg-amber-500/10 text-amber-600 border-amber-200 ring-amber-500/10';
      default: return 'bg-indigo-500/10 text-indigo-600 border-indigo-200 ring-indigo-500/10';
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] font-sans antialiased overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-4 ring-indigo-500/10">
              <Beaker className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">LABCORE</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'queue', label: 'Analysis Queue', icon: ClipboardList },
              { id: 'records', label: 'Result Registry', icon: FileText },
              { id: 'equipment', label: 'Lab Assets', icon: Settings },
              { id: 'access', label: 'Security Protocols', icon: ShieldCheck },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all duration-300 group ${activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/30 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Technician Active</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Session ID: #TECH-9902</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-rose-500 hover:bg-rose-50 transition-all group active:scale-95"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Superior Header */}
        <header className="h-24 bg-white/80 backdrop-blur-3xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 transition-all duration-300">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Laboratory Operations</h1>
            <p className="text-slate-400 text-sm font-semibold tracking-wide">Tuesday • March 10, 2026</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query scan result..."
                  className="bg-transparent pl-11 pr-4 py-2.5 w-64 outline-none text-sm font-bold text-slate-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white ring-4 ring-rose-500/10 z-10">3</div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all group-hover:bg-slate-50 group-hover:shadow-md">
                  <Bell className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200 hidden md:block" />
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-slate-800">Sr. Tech J. Varga</p>
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Clinical Pathologist</p>
                </div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex items-center justify-center shadow-inner group overflow-hidden cursor-pointer relative">
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  <Database className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F9FAFF]/50 relative">

          {/* Dashboard Hero Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {performanceStats.map((stat, idx) => (
              <div key={idx} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex justify-between items-start relative z-10 mb-6">
                  <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/10`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-${stat.color}-200 bg-${stat.color}-50 text-${stat.color}-600`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                  <span className="text-xs font-bold text-slate-400 mb-1.5 uppercase">UNITS</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Sector: Interactive Tab Content */}
            <div className="lg:col-span-2 space-y-8">

              {activeTab === 'queue' && (
                <section className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Test Matrix</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase">Live Analytical Interface</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all hover:bg-slate-50">
                        <Filter className="w-5 h-5" />
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
                        <Plus className="w-5 h-5" />
                        New Order
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Matrix Details</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                          <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocols</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {labQueue.map((item) => (
                          <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                            <td className="px-10 py-7">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Thermometer className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <div>
                                  <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">#{item.id}</p>
                                  <p className="text-xs font-extrabold text-slate-400">{item.patient}</p>
                                  <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-wider">{item.test}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-7">
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ring-4 border-emerald-200 ring-emerald-500/5 ${getPriorityStyles(item.priority)}`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="px-10 py-7">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : item.status === 'Processing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className={`text-xs font-black uppercase ${item.status === 'Completed' ? 'text-emerald-600' : 'text-slate-500'}`}>{item.status}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">{item.time}</p>
                            </td>
                            <td className="px-10 py-7 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                {item.status !== 'Completed' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedTest(item);
                                      setShowResultModal(true);
                                    }}
                                    className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <button className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl">
                                    <FileText className="w-5 h-5" />
                                  </button>
                                )}
                                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === 'access' && (
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-xl space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-purple-50 rounded-[28px] flex items-center justify-center shrink-0 border border-purple-100 shadow-inner">
                      <ShieldCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Protocol Audit</h2>
                      <p className="text-sm font-bold text-slate-400 max-w-xl">Technician role is scoped to clinical diagnostics. Every analytical action is cryptographiclly signed and logged for compliance.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permissions Active</h3>
                      <div className="grid gap-3">
                        {['Analytical Result Entry', 'Sample Triage Management', 'Quality Control Log Access', 'LIS Data Integration', 'Asset Diagnostic Initiation'].map(p => (
                          <div key={p} className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[24px] flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all duration-300">
                            <span className="text-sm font-black text-emerald-900 tracking-tight">{p}</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Scope Restrictions</h3>
                      <div className="grid gap-3 opacity-60">
                        {['Patient Medical History Write', 'Pharmacy Order Dispatch', 'Financial Billing Records', 'System Configuration Access', 'Global User Management'].map(p => (
                          <div key={p} className="p-5 bg-slate-50 border border-slate-200 border-dashed rounded-[24px] flex items-center justify-between group grayscale contrast-50 transition-all duration-300">
                            <span className="text-sm font-bold text-slate-400 italic line-through">{p}</span>
                            <AlertCircle className="w-5 h-5 text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-indigo-600 rounded-[32px] text-white flex items-center gap-8 shadow-2xl shadow-indigo-600/30 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/10 -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" />
                    <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md relative z-10">
                      <Database className="w-10 h-10" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xl font-black mb-1">HL7 Interface Protocol Active</h4>
                      <p className="text-indigo-100 font-medium text-sm leading-relaxed max-w-lg">Automatic reporting to the MD Portal is active. Critical values trigger an immediate STAT alert across the nursing station.</p>
                    </div>
                    <ChevronRight className="w-8 h-8 ml-auto text-white/50 relative z-10" />
                  </div>
                </div>
              )}

              {/* Add other tab states similarly... */}

            </div>

            {/* Right Sector: Sidebar Analytics */}
            <div className="space-y-8">

              {/* Equipment Pulse */}
              <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mt-10 -mr-10 transition-transform duration-700 group-hover:scale-150" />
                <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Asset Health
                </h3>
                <div className="space-y-8">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="relative z-10">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-black text-sm tracking-tight">{eq.name}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${eq.status === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>{eq.status}</p>
                        </div>
                        <span className="text-lg font-black text-indigo-400">{eq.health}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${eq.health > 80 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-amber-500'}`}
                          style={{ width: `${eq.health}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Calibration: {eq.lastCal}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                  Initiate Asset Diagnostic
                </button>
              </div>

              {/* Critical Alert Card */}
              <div className="bg-rose-500 rounded-[40px] p-8 text-white shadow-2xl shadow-rose-500/30 relative overflow-hidden group border border-rose-400">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <AlertCircle className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 border border-white/20 backdrop-blur-md">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Active Critical Alert</h3>
                  <p className="text-rose-100 font-bold text-sm leading-relaxed mb-8">Patient #PAT-0092 potassium levels at 6.8 mmol/L. Requires STAT notification to Dr. House.</p>
                  <button className="w-full py-4 bg-white text-rose-500 font-extrabold rounded-2xl shadow-xl shadow-black/10 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Notify Supervising MD
                  </button>
                </div>
              </div>

              {/* Quality Control Widget */}
              <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-xl shadow-slate-200/20">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-1">QC Metrics Today</h3>
                <div className="flex items-center gap-6 justify-between">
                  {['Hematology', 'Chemistry', 'Immunology'].map((area, i) => (
                    <div key={area} className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-50 bg-white shadow-inner flex items-center justify-center relative">
                        <div className={`absolute inset-0 rounded-full border-4 border-${i === 1 ? 'amber' : 'emerald'}-500 border-t-transparent animate-spin-slow`} />
                        <span className="text-xs font-black text-slate-800 tracking-tighter">{(95 + i).toString()}%</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 tracking-tight uppercase">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modern Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all duration-500" onClick={() => setShowResultModal(false)} />
          <div className="relative bg-white rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="px-10 py-10 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                  <Beaker className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Analytical Submission</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedTest?.test}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1">Patient: {selectedTest?.patient}</p>
                </div>
              </div>
              <button onClick={() => setShowResultModal(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-95 shadow-sm">
                <LogOut className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quantitative Metric Value</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter numerical result (e.g. 14.5)"
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] outline-none font-black text-slate-800 text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600/20 transition-all placeholder:text-slate-300"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm tracking-widest px-4 border-l border-slate-200">mEq/L</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Analytical Flag</label>
                  <select className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] outline-none font-black text-slate-800 text-lg focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all">
                    <option>NORMAL (N)</option>
                    <option>HIGH (H)</option>
                    <option>LOW (L)</option>
                    <option className="text-rose-600 font-black">CRITICAL (C)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Methodology</label>
                  <div className="px-8 py-5 bg-slate-100 border border-slate-200 rounded-[28px] font-bold text-slate-500 flex items-center justify-between">
                    <span>Enzymatic</span>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clinical Observations</label>
                <textarea
                  rows="3"
                  placeholder="Technician notes regarding specimen quality or findings..."
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[32px] outline-none font-bold text-slate-700 text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-300"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[28px] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => {
                    setLabQueue(prev => prev.map(item => item.id === selectedTest.id ? { ...item, status: 'Completed' } : item));
                    setShowResultModal(false);
                  }}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Verify & Transmit Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-pulse-subtle {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
    </div>
  );
};

export default LabTechnicianDashboard;
