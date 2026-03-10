import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-white brand-fade">
              Secure Healthcare System
            </h1>
            <nav className="flex space-x-4">
              <button className="text-slate-300 hover:text-white">Dashboard</button>
              <button className="text-slate-300 hover:text-white">Profile</button>
              <button className="text-slate-300 hover:text-white">Logout</button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
