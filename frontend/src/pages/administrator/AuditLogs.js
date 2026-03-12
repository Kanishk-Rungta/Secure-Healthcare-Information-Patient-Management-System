import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    userRole: '',
    resourceType: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...filters
      });
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/admin/logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data?.logs || []);
        setPagination(data.data?.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="hover:text-blue-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-xl font-bold">System Audit Logs (AuditLogs)</h1>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Logs
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Type</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.eventType}
              onChange={e => setFilters({...filters, eventType: e.target.value})}
            >
              <option value="">All Events</option>
              <option value="CREATE">Create</option>
              <option value="READ">Read</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Role</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.userRole}
              onChange={e => { setFilters({...filters, userRole: e.target.value}); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="administrator">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="receptionist">Receptionist</option>
              <option value="lab_technician">Lab Tech</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resource Type</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.resourceType}
              onChange={e => { setFilters({...filters, resourceType: e.target.value}); setPage(1); }}
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="patient">Patient</option>
              <option value="medical_record">Medical Record</option>
              <option value="consent">Consent</option>
              <option value="complaint">Complaint</option>
              <option value="assignment">Assignment</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resource Type</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.resourceType}
              onChange={e => setFilters({...filters, resourceType: e.target.value})}
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="patient">Patient</option>
              <option value="medical_record">Medical Record</option>
              <option value="consent">Consent</option>
              <option value="complaint">Complaint</option>
              <option value="assignment">Assignment</option>
              <option value="system">System</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setFilters({eventType: '', userRole: '', resourceType: ''});
              setPage(1);
            }}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Resource</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No logs found matching criteria.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {new Date(log.systemDetails.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{log.userId?.profile?.firstName} {log.userId?.profile?.lastName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{log.userRole}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                      {log.resourceType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        log.eventType === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        log.eventType === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                        log.eventType === 'UPDATE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">Showing page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;
