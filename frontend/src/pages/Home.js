import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-200 to-indigo-200">
      {/* Navigation */}
      <nav className="bg-white border-b slide-in-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900">
                SecureHealth
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 slide-in-right">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Healthcare Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive platform for managing patient records, appointments, and healthcare operations.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-6 py-3 text-sm hover:bg-blue-700"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-gray-300 text-gray-700 px-6 py-3 text-sm hover:bg-gray-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 slide-in-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Records</h3>
              <p className="text-gray-600">Encrypted patient data with role-based access control</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Management Systems</h3>
              <p className="text-gray-600">Streamlined workflows and unified management tools</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Role Access</h3>
              <p className="text-gray-600">Specialized interfaces for all healthcare roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-16 slide-in-right">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            User Roles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-blue-100 text-blue-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Patient
              </h3>
              <p className="text-gray-600 text-sm">Access records, schedule appointments, manage consents</p>
            </div>
            <div className="border border-indigo-200 rounded-lg p-6 bg-indigo-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-indigo-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-indigo-100 text-indigo-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                Doctor
              </h3>
              <p className="text-gray-600 text-sm">Manage patients, create records, prescribe medications</p>
            </div>
            <div className="border border-emerald-200 rounded-lg p-6 bg-emerald-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-emerald-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                </span>
                Receptionist
              </h3>
              <p className="text-gray-600 text-sm">Coordinate patient intake, schedule visits, and manage front-desk workflow</p>
            </div>
            <div className="border border-amber-200 rounded-lg p-6 bg-amber-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-amber-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-amber-100 text-amber-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2v6l-4.5 7.5A4 4 0 008 21h8a4 4 0 003.5-5.5L15 8V2" />
                  </svg>
                </span>
                Lab Technician
              </h3>
              <p className="text-gray-600 text-sm">Process tests, manage results, ensure quality</p>
            </div>
            <div className="border border-purple-200 rounded-lg p-6 bg-purple-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-purple-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-purple-100 text-purple-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                  </svg>
                </span>
                Pharmacist
              </h3>
              <p className="text-gray-600 text-sm">Dispense medications, manage inventory</p>
            </div>
            <div className="border border-rose-200 rounded-lg p-6 bg-rose-50/70 backdrop-blur transition transform hover:shadow-lg hover:-translate-y-1 hover:bg-rose-100/80">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-rose-100 text-rose-600 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Administrator
              </h3>
              <p className="text-gray-600 text-sm">Manage system, users, settings, and security</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16 slide-in-left">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of healthcare professionals using our platform
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-6 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 slide-in-right">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 SecureHealth. HIPAA Compliant & GDPR Ready.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
