import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const isEmailValid = useMemo(() => {
    if (!formData.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  }, [formData.email]);

  const isPasswordValid = useMemo(() => formData.password?.length > 0, [formData.password]);
  const isFormValid = isEmailValid && isPasswordValid;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runWithRetry = async (fn, retries = 2) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const isNetworkError = !err?.response;
        if (!isNetworkError || attempt === retries) {
          throw err;
        }
        await sleep(700 * (attempt + 1));
      }
    }
    throw lastError;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('You appear to be offline. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      const response = await runWithRetry(() => authAPI.login(
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: { 'X-Silent-Errors': 'true' }
        }
      ));

      if (response?.success) {
        const user = response.data?.user;
        const tokens = response.data?.tokens || {};

        if (tokens.accessToken) {
          localStorage.setItem('accessToken', tokens.accessToken);
        }
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('authUser', JSON.stringify(user));
        }
        localStorage.setItem('authTokens', JSON.stringify(tokens));

        const userRole = user?.role;
        switch (userRole) {
          case 'patient':
          case 'PATIENT':
            navigate('/patient');
            break;
          case 'doctor':
          case 'DOCTOR':
            navigate('/doctor');
            break;
          case 'receptionist':
          case 'RECEPTIONIST':
            navigate('/receptionist');
            break;
          case 'lab_technician':
          case 'LAB_TECHNICIAN':
            navigate('/lab');
            break;
          case 'pharmacist':
          case 'PHARMACIST':
            navigate('/pharmacy');
            break;
          case 'administrator':
          case 'ADMINISTRATOR':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(response?.message || 'Login failed');
      }
    } catch (err) {
      const message = err?.response?.data?.message
        || (err?.message?.includes('timeout') ? 'Request timed out. Please try again.' : null)
        || 'Unable to reach the server. Please check the API URL and backend status.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-teal-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm px-8 py-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-semibold">SH</span>
            </div>
            <p className="text-sm text-gray-500">Secure Healthcare System</p>
            <h2 className="text-3xl font-semibold text-gray-900 mt-2">Sign in</h2>
            <p className="mt-2 text-gray-600">Use your Secure Healthcare System account</p>
          </div>

          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm fade-in-soft">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder=" "
                  className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                >
                  Email or phone
                </label>
                {touched.email && !isEmailValid && (
                  <p className="text-xs text-rose-600 mt-2 fade-in-soft">Enter a valid email address.</p>
                )}
                <div className="text-left mt-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot email?
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder=" "
                  className="peer block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {touched.password && !isPasswordValid && (
                  <p className="text-xs text-rose-600 mt-2 fade-in-soft">Password is required.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11a7 7 0 1114 0v3a4 4 0 01-4 4H9a4 4 0 01-4-4v-3z" />
                </svg>
                Secure login • Encrypted communication
              </div>
              <span className="text-blue-600 font-medium">Learn more</span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Create account
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? 'Signing in...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
