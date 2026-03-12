import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdministratorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'administrator') {
        navigate('/unauthorized');
        return;
      }
      setUser(parsedUser);
      fetchStats();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
        setRecentLogs(data.data.recentLogs);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-indigo-50">
      <nav className="relative bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">System Administration</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/admin/logs" className="text-sm font-medium hover:text-blue-400 transition-colors">Audit Logs</Link>
          <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all">Logout</button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 to-indigo-100">
            <p className="text-sm font-bold text-indigo-600 uppercase">Total Users</p>
            <p className="text-3xl font-black text-indigo-900 mt-1">{stats?.totalUsers || 0}</p>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <p className="text-sm font-bold text-blue-600 uppercase">Registered Patients</p>
            <p className="text-3xl font-black text-blue-900 mt-1">{stats?.totalPatients || 0}</p>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-green-50 to-green-100">
            <p className="text-sm font-bold text-green-600 uppercase">Medical Records</p>
            <p className="text-3xl font-black text-green-900 mt-1">{stats?.totalRecords || 0}</p>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
            <p className="text-sm font-bold text-yellow-600 uppercase">System Status</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-bold text-emerald-600">Healthy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Recent System Activity</h3>
                <Link to="/admin/logs" className="text-xs font-bold text-blue-600 hover:underline">View All Logs</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <div key={log._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        log.eventType === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        log.eventType === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                        log.eventType === 'UPDATE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.eventType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] text-slate-400 font-medium">User: {log.userId?.profile?.firstName} ({log.userRole})</p>
                      <p className="text-[10px] text-slate-400 font-medium">Time: {new Date(log.systemDetails.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Role Distribution</h3>
              <div className="space-y-4">
                {stats?.roleBreakdown.map((role) => (
                  <div key={role._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 uppercase">{role._id}</span>
                      <span className="font-bold text-slate-900">{role.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${(role.count / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdministratorDashboard;
