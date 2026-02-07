import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Administrator</p>
            <h1 className="text-2xl font-semibold text-slate-900">System Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor users, security, and operational health.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">Manage Users</button>
            <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">View Audit Logs</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Active Users', value: '286' },
          { label: 'Pending Approvals', value: '12' },
          { label: 'Security Alerts', value: '2' },
          { label: 'System Uptime', value: '99.98%' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Recent Administrative Activity</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              'Role updated for Nurse Olivia Carter',
              'New department created: Cardiology Wing B',
              'Access review completed for Lab Team',
            ].map((item) => (
              <li key={item} className="px-6 py-4 text-sm text-slate-700">{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Database', status: 'Healthy' },
              { label: 'API Latency', status: 'Stable' },
              { label: 'Backups', status: 'On Schedule' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
