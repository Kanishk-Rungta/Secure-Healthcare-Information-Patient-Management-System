import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen page-bg">
      <header className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 shadow-lg border-b border-transparent relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-white brand-fade">
                Secure Healthcare System
              </h1>
              <nav className="flex space-x-4">
                <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition">Dashboard</button>
                <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition">Profile</button>
                <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition">Logout</button>
              </nav>
            </div>
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
