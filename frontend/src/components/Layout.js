import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';


const Layout = ({ children, hideHeader = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('API logout failed:', error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900">
      {!hideHeader && (
        <header className="bg-white shadow-sm border-b border-slate-100 z-50 relative">
          <div className="w-full px-6 lg:px-12">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <span className="text-white font-black text-xl">S</span>
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">
                  Secure Healthcare System
                </h1>
              </div>
              <nav className="flex space-x-8 items-center">
                <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Dashboard</button>
                <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Profile</button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="w-full min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};


export default Layout;
