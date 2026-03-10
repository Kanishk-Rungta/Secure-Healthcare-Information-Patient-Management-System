import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  ClipboardList,
  Package,
  ShieldCheck,
  AlertTriangle,
  Search,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  Box,
  Droplets,
  Zap,
  ChevronRight,
  User,
  Info
} from 'lucide-react';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [showInteractionChecker, setShowInteractionChecker] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Mock Inventory Data
  const inventory = [
    { id: 'INV-101', name: 'Amoxicillin 500mg', stock: 85, threshold: 20, unit: 'Capsules', status: 'Stable' },
    { id: 'INV-102', name: 'Lisinopril 10mg', stock: 12, threshold: 25, unit: 'Tablets', status: 'Low Stock' },
    { id: 'INV-103', name: 'Atorvastatin 20mg', stock: 154, threshold: 30, unit: 'Tablets', status: 'Stable' },
    { id: 'INV-104', name: 'Metformin 850mg', stock: 5, threshold: 50, unit: 'Tablets', status: 'Critical' },
  ];

  // Mock Prescriptions
  const [prescriptions, setPrescriptions] = useState([
    { id: 'RX-7721', patient: 'Arthur Morgan', doctor: 'Dr. John Watson', meds: ['Amoxicillin (500mg)', 'Paracetamol (650mg)'], status: 'Pending', time: '10 mins ago', allergy: 'Penicillin (Secondary check required)' },
    { id: 'RX-7722', patient: 'Sadie Adler', doctor: 'Dr. Gregory House', meds: ['Lisinopril (10mg)'], status: 'Preparing', time: '25 mins ago', allergy: 'None' },
    { id: 'RX-7723', patient: 'John Marston', doctor: 'Dr. Meredith Grey', meds: ['Metformin (850mg)', 'Atorvastatin (20mg)'], status: 'Ready', time: '1 hr ago', allergy: 'Seafood' },
  ]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Ready': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'Preparing': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFF] font-sans antialiased overflow-hidden text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)]">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Pill className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-800 tracking-tighter leading-none">PHARMADIGIT</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Clinical Unit</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'prescriptions', label: 'Order Pipeline', icon: ClipboardList, badge: prescriptions.length },
              { id: 'inventory', label: 'Global Stock', icon: Package, badge: 'Low' },
              { id: 'interactions', label: 'Clinical Alerts', icon: AlertTriangle },
              { id: 'access', label: 'Permission Audit', icon: ShieldCheck },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all duration-300 group ${activeTab === item.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-tight">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-black px-2.5 py-1 rounded-full ${activeTab === item.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 pt-0">
          <div className="p-6 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50 mb-8 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">System Online</span>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-tight">Regulatory encryption active. All dispensing logged.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-5 rounded-3xl font-black text-rose-500 hover:bg-rose-50 transition-all group border border-transparent hover:border-rose-100 active:scale-95"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Terminate Session</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#FBFBFF]">
        {/* Dynamic Header */}
        <header className="h-28 flex items-center justify-between px-12 border-b border-slate-100 bg-white/50 backdrop-blur-3xl sticky top-0 z-10 transition-all">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Pharmacy Operations</h1>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              Real-time Dispensing Audit • 22:04
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="relative group hidden xl:block">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Lookup RX or Patient ID..."
                className="bg-slate-100 rounded-[24px] pl-14 pr-8 py-4 w-80 outline-none font-bold text-slate-600 placeholder:text-slate-400 border border-transparent focus:border-indigo-200 focus:bg-white transition-all shadow-sm focus:shadow-xl focus:shadow-indigo-500/5 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-6">
              <button className="relative w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <Bell className="w-6 h-6 text-slate-600" />
                <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <div className="h-12 w-px bg-slate-200" />
              <div className="flex items-center gap-5 cursor-pointer group">
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 leading-none">Pharm.D Sarah Connor</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">Level 3 Authorized</span>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <User className="text-white w-7 h-7 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Pending RX', value: '18', icon: Droplets, color: 'indigo', trend: '+4 new' },
              { label: 'Interactions', value: '03', icon: Zap, color: 'rose', trend: 'High Risk' },
              { label: 'Out of Stock', value: '02', icon: Box, color: 'amber', trend: 'Manual Req.' },
              { label: 'Efficiency', value: '92%', icon: TrendingUp, color: 'emerald', trend: '+2.4%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center border border-${stat.color}-500/10`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </div>
                  <div className={`text-[10px] font-black px-3 py-1.5 rounded-full border border-${stat.color}-200 bg-${stat.color}-50 text-${stat.color}-600 uppercase tracking-widest`}>
                    {stat.trend}
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.1em] mb-1.5">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* Primary content based on tabs */}
            <div className="xl:col-span-2 space-y-10">

              {activeTab === 'prescriptions' && (
                <section className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
                  <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                        <ClipboardList className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Matrix</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Clinical Workflow</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                      <Plus className="w-5 h-5" />
                      Manual Entry
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="p-10 flex flex-wrap lg:flex-nowrap gap-10 hover:bg-slate-50/50 transition-all group">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">#{rx.id}</span>
                            <span className="text-xs font-bold text-slate-400">• {rx.time}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{rx.patient}</h3>
                          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                            <User className="w-4 h-4" />
                            {rx.doctor}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {rx.meds.map(med => (
                              <span key={med} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 shadow-sm flex items-center gap-2">
                                <Box className="w-3 h-3 text-indigo-400" />
                                {med}
                              </span>
                            ))}
                          </div>
                          {rx.allergy !== 'None' && (
                            <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 group/alert animate-in fade-in slide-in-from-left-4">
                              <AlertCircle className="w-5 h-5 text-rose-500 group-hover/alert:scale-110 transition-transform" />
                              <p className="text-xs font-black text-rose-600 uppercase tracking-tight">Warning: {rx.allergy}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-between items-end gap-6 shrink-0">
                          <span className={`${getStatusStyles(rx.status)} px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border border-current shadow-lg shadow-current/5`}>
                            {rx.status}
                          </span>
                          <div className="flex gap-4">
                            <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:bg-indigo-50/30">
                              <Info className="w-6 h-6" />
                            </button>
                            <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:translate-x-1 group/btn">
                              {rx.status === 'Pending' ? 'Start Dispensing' : rx.status === 'Preparing' ? 'Mark Ready' : 'Confirm Issue'}
                              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'inventory' && (
                <section className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden p-12">
                  <div className="flex items-start justify-between mb-12">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-100 rounded-[30px] flex items-center justify-center border border-white">
                        <Package className="w-8 h-8 text-slate-900" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dynamic Inventory</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">Global Stock Distribution & Health</p>
                      </div>
                    </div>
                    <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {inventory.map((item) => (
                      <div key={item.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[40px] hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all duration-500 group">
                        <div className="flex flex-wrap items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-100 group-hover:border-indigo-200 transition-colors shadow-sm`}>
                              <Box className={`w-7 h-7 ${item.stock < item.threshold ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{item.id}</p>
                              <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                            </div>
                          </div>

                          <div className="flex-1 max-w-sm space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span>Current Utilization</span>
                              <span className={item.stock < item.threshold ? 'text-rose-500' : 'text-indigo-600'}>{item.stock} / 250 {item.unit}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${item.stock < item.threshold ? 'bg-amber-500' : 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`}
                                style={{ width: `${(item.stock / 250) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-8 shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-900 mb-1 tracking-tight">{item.status}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</p>
                            </div>
                            <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                              Restock Req.
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'access' && (
                <div className="bg-white rounded-[48px] border border-slate-100 p-12 shadow-2xl shadow-indigo-500/5 space-y-12">
                  <div className="flex items-start gap-8">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
                      <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security & Governance</h2>
                      <p className="text-sm font-bold text-slate-400 mt-2 max-w-2xl leading-relaxed italic">Pharmacist credentials authorize dispense-only operations. All narcotic handling is subject to Level 4 Audit protocols.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Authorized Scopes</h3>
                      <div className="grid gap-4">
                        {['Dispensing Workflow Init', 'Controlled Substance Audit', 'Clinical Interaction Override', 'Inventory Redistribution', 'Supplier Chain Integration'].map(p => (
                          <div key={p} className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[32px] flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all duration-500">
                            <span className="text-sm font-black text-emerald-900 tracking-tight">{p}</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-emerald-100">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Restricted Zones</h3>
                      <div className="grid gap-4 opacity-50">
                        {['Diagnostic Record Write', 'System User Privilege Admin', 'Billing Rate Configuration', 'Global Laboratory Access', 'External Referral Mgmt'].map(p => (
                          <div key={p} className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-[32px] flex items-center justify-between grayscale transition-all duration-500">
                            <span className="text-sm font-bold text-slate-400 italic line-through">{p}</span>
                            <AlertTriangle className="w-4 h-4 text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Tools */}
            <div className="space-y-10">

              {/* Interaction Checker Tool */}
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mt-16 -mr-16 transition-transform duration-1000 group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-indigo-600/30">
                    <RefreshCw className="w-8 h-8 text-white animate-[spin_10s_linear_infinite]" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Clinical Interaction Checker</h3>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10 italic">Cross-reference active medications against centralized patient allergy and interaction database.</p>
                  <div className="space-y-4 mb-10">
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Pill className="h-4 w-4 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Drug A"
                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-white/20 transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Droplets className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Drug B"
                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-white/20 transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                  <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
                    Run Interaction Protocol
                  </button>
                </div>
              </div>

              {/* Regulatory Compliance Pulse */}
              <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-xl shadow-indigo-500/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 px-1">Analytical Feed</h3>
                <div className="space-y-8">
                  {[
                    { title: 'Level 3 Audit Log Updated', time: '2m ago', color: 'indigo' },
                    { title: 'New RX Batch: Oncology', time: '14m ago', color: 'emerald' },
                    { title: 'Low Stock Alert: Lisinopril', time: '1hr ago', color: 'rose' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer">
                      <div className={`shrink-0 w-3 h-3 rounded-full bg-${log.color}-500 mt-1.5 shadow-[0_0_10px_rgba(var(--${log.color}-rgb),0.5)] group-hover:scale-125 transition-transform`} />
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">{log.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  Open Regulatory Dashboard
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Global Aesthetics */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default PharmacistDashboard;
