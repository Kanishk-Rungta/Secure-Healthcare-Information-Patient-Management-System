import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Activity,
  Settings,
  Search,
  Bell,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  User,
  ShieldAlert,
  HardDrive,
  Cpu,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

const AdministratorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  // Mock Admin Stats
  const systemStats = [
    { label: 'Active Sessions', value: '42', icon: Activity, color: 'indigo' },
    { label: 'Security Threats', value: '00', icon: ShieldAlert, color: 'emerald' },
    { label: 'DB Integrity', value: '99.9%', icon: Database, color: 'sky' },
    { label: 'System Load', value: '14%', icon: Cpu, color: 'indigo' },
  ];

  const recentUsers = [
    { id: 'USR-201', name: 'Dr. Sarah Wilson', role: 'Doctor', status: 'Active', login: '2m ago' },
    { id: 'USR-202', name: 'John Marston', role: 'Patient', status: 'Active', login: '15m ago' },
    { id: 'USR-203', name: 'Sr. Tech Varga', role: 'Lab Tech', status: 'Verified', login: '1h ago' },
    { id: 'USR-204', name: 'Sadie Adler', role: 'Pharmacist', status: 'Maintenance', login: '3h ago' },
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
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30">
              <Settings className="text-white w-7 h-7 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">SYSCORE</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Admin Panel</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'inventory', label: 'User Provisioning', icon: Users },
              { id: 'security', label: 'Audit protocols', icon: Lock },
              { id: 'system', label: 'Backend Pulse', icon: HardDrive },
              { id: 'access', label: 'Global Access', icon: ShieldCheck },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all duration-300 group ${activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
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
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Root Access</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold leading-tight italic">Level 5 Security Clearance Verified. All actions are traced.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-5 rounded-3xl font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group border border-transparent hover:border-rose-100 shadow-sm hover:shadow-lg active:scale-95"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">End Terminal</span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Modern Header */}
        <header className="h-28 bg-white/50 backdrop-blur-3xl border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-10 transition-all">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">System Governance</h1>
            <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-2 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Root Node • Secure Healthcare Infrastructure
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="relative group hidden xl:block">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Query system logs or user DB..."
                className="bg-slate-100/80 rounded-3xl pl-14 pr-8 py-4 w-96 outline-none font-bold text-slate-600 placeholder:text-slate-400 border border-transparent focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white ring-4 ring-rose-500/10">!</div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-md transition-all active:scale-95">
                  <Bell className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="flex items-center gap-5 cursor-pointer group">
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-black text-slate-900 leading-none italic uppercase">
                    {user ? `${user.profile?.firstName} ${user.profile?.lastName}` : 'Administrator'}
                  </span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">Super Admin</span>
                </div>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Database className="text-white w-7 h-7 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Clinical Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFF]/50 relative space-y-12">

          {/* Global System Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {systemStats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center border border-${stat.color}-500/10 shadow-inner`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Node 01-A</div>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1.5">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{stat.value}</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mb-1.5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

            {/* Main Sector: User Management Matrix */}
            <div className="xl:col-span-2 space-y-10">

              <section className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
                <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Registry</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">RBAC Access Control Matrix</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                      <RefreshCw className="w-6 h-6" />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95">
                      <Plus className="w-5 h-5" />
                      Provision User
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-slate-100">
                        <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Identity</th>
                        <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Role</th>
                        <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current State</th>
                        <th className="px-12 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocols</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentUsers.map((u) => (
                        <tr key={u.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-12 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 tracking-tight uppercase">{u.name}</p>
                                <p className="text-xs font-bold text-slate-400">Node ID: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-12 py-8">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className={`w-4 h-4 ${u.role === 'Doctor' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                              <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{u.role}</span>
                            </div>
                          </td>
                          <td className="px-12 py-8">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${u.status === 'Maintenance' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'Maintenance' ? 'text-amber-600' : 'text-emerald-600'}`}>{u.status}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Last Ack: {u.login}</p>
                          </td>
                          <td className="px-12 py-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                                <Settings className="w-5 h-5" />
                              </button>
                              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                <ShieldAlert className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Infrastructure Logic */}
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl p-10 space-y-10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-10 opacity-5 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                  <Database className="w-48 h-48" />
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Encrypted Storage Cluster</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cluster-Alpha Optimized</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {[
                    { l: 'Patient DB', v: 82 },
                    { l: 'Medical Log', v: 45 },
                    { l: 'Audit Vault', v: 91 },
                    { l: 'System Core', v: 12 },
                  ].map((cl, i) => (
                    <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] group/card hover:bg-indigo-50 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover/card:text-indigo-600 transition-colors">{cl.l}</p>
                      <div className="flex items-end justify-between gap-4">
                        <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{cl.v}GB</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sector: Global Alerts */}
            <div className="space-y-10">

              {/* Security Health Profile */}
              <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mt-10 -mr-10" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-white/10 backdrop-blur-md">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 tracking-tighter">Security Posture</h3>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10 italic">Global firewall and encryption protocols are operating within standard parameters.</p>

                  <div className="space-y-6 mb-10">
                    {[
                      { l: 'Firewall', c: 'indigo' },
                      { l: 'AES-256 Auth', c: 'emerald' },
                      { l: 'JWT Rotation', c: 'indigo' },
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.l}</span>
                          <span className={`text-[10px] font-black text-${p.c}-400 uppercase`}>Operational</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-${p.c}-500 shadow-[0_0_10px_rgba(var(--${p.c}-rgb),0.5)]`} style={{ width: '100%' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest text-[11px] active:scale-95">
                    Run Comprehensive Audit
                  </button>
                </div>
              </div>

              {/* High Alert Console */}
              <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-xl overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-500">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-500 group-hover:w-4 transition-all" />
                <div className="flex items-center justify-between mb-8 px-2">
                  <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                    Critical Alerts
                  </h3>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Live Trace</span>
                </div>
                <p className="text-sm font-black text-slate-800 tracking-tight leading-relaxed uppercase px-2">Unauthorized access attempt blocked from IP: 192.168.1.XX</p>
                <p className="text-[11px] font-bold text-slate-400 mt-4 leading-relaxed px-2 italic">Standard lockout protocols initiated automatically. No data leakage detected.</p>
                <button className="w-full mt-10 py-5 bg-rose-50 text-rose-600 font-black rounded-3xl uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all">
                  Acknowledge & Clear Alert
                </button>
              </div>

              {/* Server Feed Log */}
              <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-lg shadow-indigo-500/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 px-2 leading-none">System Logs</h3>
                <div className="space-y-8">
                  {[
                    { title: 'User USR-201 Logged In', time: '2m ago', color: 'indigo' },
                    { title: 'Database Backup Complete', time: '14m ago', color: 'emerald' },
                    { title: 'New API Key Provisioned', time: '1h ago', color: 'amber' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-6 group cursor-pointer relative">
                      <div className={`shrink-0 w-3 h-3 rounded-full bg-${log.color}-500 mt-1 shadow-[0_0_10px_rgba(var(--${log.color}-rgb),0.5)] group-hover:scale-125 transition-transform`} />
                      <div className="flex-1">
                        <p className="text-[13px] font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">{log.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Status: Success • {log.time}</p>
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

export default AdministratorDashboard;
