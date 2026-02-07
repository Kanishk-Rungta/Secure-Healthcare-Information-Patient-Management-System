import React from 'react';

const DoctorDashboard = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your appointments, patients, and tasks.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">Start Rounds</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Write Notes</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">New Prescription</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Appointments', value: '9' },
          { label: 'Inpatients', value: '4' },
          { label: 'Lab Results', value: '3' },
          { label: 'Follow-ups', value: '6' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Today’s Patients</h2>
            <span className="text-sm text-slate-500">9 scheduled</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              { name: 'Emily Green', detail: '10:00 AM • Annual Checkup' },
              { name: 'James Patel', detail: '11:15 AM • Cardiac Review' },
              { name: 'Sophia Nguyen', detail: '01:30 PM • Follow-up' },
            ].map((item) => (
              <li key={item.name} className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Priority Tasks</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              'Review lab panel for Ward 2B',
              'Approve discharge summary',
              'Sign consent for procedure',
            ].map((task) => (
              <div key={task} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <p className="text-sm text-slate-700">{task}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
