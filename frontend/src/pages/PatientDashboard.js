import React from 'react';

const PatientDashboard = () => {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Patient Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Access your records, visits, and care plan in one place.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Book Appointment</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">View Records</button>
          <button className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Request Refill</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Upcoming Visits', value: '2' },
          { label: 'Open Requests', value: '1' },
          { label: 'Prescriptions', value: '4' },
          { label: 'Lab Results', value: '3' },
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
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              { title: 'Primary Care Visit', detail: 'Feb 12 • 10:30 AM • Dr. Rivera' },
              { title: 'Dermatology Follow-up', detail: 'Mar 03 • 02:00 PM • Dr. Kim' },
            ].map((item) => (
              <li key={item.title} className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Care Reminders</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              'Complete annual blood work',
              'Update insurance information',
              'Review consent preferences',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
