import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="ml-3 text-xl font-semibold text-slate-900">
                  Secure Healthcare
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-sm">
                  <p className="text-slate-900 font-medium">
                    {user?.profile?.firstName || user?.firstName || ''} {user?.profile?.lastName || user?.lastName || ''}
                  </p>
                  <p className="text-slate-500 text-xs capitalize">{user?.role?.toLowerCase() || ''}</p>
                </div>
                <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {(user?.profile?.firstName || user?.firstName || '')?.charAt(0) || ''}{(user?.profile?.lastName || user?.lastName || '')?.charAt(0) || ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg mb-8">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_55%)]" />
            <div className="relative px-6 py-8 sm:px-10">
              <p className="text-sm uppercase tracking-widest text-white/80">Dashboard Overview</p>
              <h1 className="text-3xl sm:text-4xl font-semibold mt-2">
                Welcome back, {user?.profile?.firstName || user?.firstName || 'User'}
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Quick insights across patient flow, appointments, and compliance. Stay on top of what matters today.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-slate-100">
                  View Schedule
                </button>
                <button className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30">
                  Create Record
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: 'Total Patients', value: '1,234', color: 'from-indigo-500 to-blue-500' },
              { label: 'Appointments Today', value: '24', color: 'from-emerald-500 to-green-500' },
              { label: 'Pending Tasks', value: '8', color: 'from-amber-500 to-yellow-500' },
              { label: 'Urgent Alerts', value: '3', color: 'from-rose-500 to-red-500' },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="text-2xl font-semibold text-slate-900 mt-1">{item.value}</p>
                    </div>
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                      <div className="h-2 w-2 rounded-full bg-white/90" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Updated just now</p>
                </div>
              </div>
            ))}
          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Today’s Schedule</h3>
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View all</button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { time: '09:00 AM', title: 'Dr. Smith • Cardiology', meta: '6 patients • Room 3A' },
                  { time: '11:30 AM', title: 'Lab Review • Blood Panel', meta: '2 pending results' },
                  { time: '02:00 PM', title: 'New Patient Onboarding', meta: '3 arrivals' },
                ].map((item) => (
                  <div key={item.time} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                <p className="text-sm text-slate-500 mt-1">Common tasks at a glance.</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                {[
                  { label: 'New Patient' },
                  { label: 'Schedule' },
                  { label: 'Records' },
                  { label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="px-3 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity + Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {[
                  { title: 'New patient John Doe registered', time: '2 minutes ago', tone: 'bg-emerald-500' },
                  { title: 'Appointment scheduled with Dr. Smith', time: '15 minutes ago', tone: 'bg-blue-500' },
                  { title: 'Lab results ready for Jane Wilson', time: '1 hour ago', tone: 'bg-amber-500' },
                ].map((item) => (
                  <li key={item.title} className="px-6 py-4 flex items-center gap-4">
                    <div className={`h-9 w-9 rounded-full ${item.tone} flex items-center justify-center text-white text-xs font-semibold`}>✓</div>
                    <div>
                      <p className="text-sm text-slate-900 font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Security & Compliance</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Audit Logs</p>
                    <p className="text-xs text-slate-500">All systems operational</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Consent Checks</p>
                    <p className="text-xs text-slate-500">3 requests awaiting</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Data Backups</p>
                    <p className="text-xs text-slate-500">Last run: 2 hours ago</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">On Track</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
