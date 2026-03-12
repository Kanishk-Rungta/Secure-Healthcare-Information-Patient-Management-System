import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [activeTab, setActiveTab] = useState('patient');

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

  const handleLoginSuccess = (data) => {
    const user = data?.user;
    const tokens = data?.tokens || {};

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        if (response.mfaRequired) {
          setShowOTP(true);
          setLoading(false);
        } else {
          handleLoginSuccess(response.data);
        }
      } else {
        const errorMessage = response?.message || response?.errors?.[0] || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = 'Unable to reach the server. Please check the API URL and backend status.';
      
      if (err?.response?.status === 401 || err?.response?.status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid email or password. Please try again.';
      } else if (err?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        otp: otp
      });

      if (response?.success) {
        handleLoginSuccess(response.data);
      } else {
        setError(response?.message || 'Invalid MFA code');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'MFA verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gradient-to-br from-yellow-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main container with left and right sections */}
      <div className="relative min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Features and benefits */}
            <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight">
                  Secure Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Management</span>
                </h1>
                <p className="text-xl text-white/80">
                  Access patient records, manage appointments, and streamline healthcare operations with enterprise-grade security.
                </p>
              </div>

              {/* Feature cards */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition">
                  <div className="flex-shrink-0 mt-1">
                    <Shield className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">End-to-End Encrypted</h3>
                    <p className="text-sm text-white/70">Your data is encrypted with military-grade security protocols</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition">
                  <div className="flex-shrink-0 mt-1">
                    <Lock className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">HIPAA Compliant</h3>
                    <p className="text-sm text-white/70">Full compliance with healthcare privacy regulations</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Multi-Factor Authentication</h3>
                    <p className="text-sm text-white/70">Protect your account with 2-step verification</p>
                  </div>
                </div>
              </div>

              {/* Testimonials section */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Trusted by Healthcare Professionals</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-sm">DR</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Dr. Sarah Johnson</p>
                      <p className="text-xs text-white/60">"Excellent platform for patient management"</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold text-sm">RA</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Receptionist Amy</p>
                      <p className="text-xs text-white/60">"Streamlined our clinic operations"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm">
                {/* Gradient border wrapper */}
                <div className="p-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 shadow-2xl">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-8 py-10 space-y-8">
                    {/* Logo and header */}
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                          <span className="text-white font-bold text-xl">SH</span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                          SecureHealth
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">Healthcare Intelligence Platform</p>
                      </div>
                    </div>

                    {/* Role selector tabs */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                      {['Patient', 'Doctor', 'Staff'].map((role) => (
                        <button
                          key={role.toLowerCase()}
                          onClick={() => setActiveTab(role.toLowerCase())}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                            activeTab === role.toLowerCase()
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>

                    {/* Form content */}
                    {!showOTP ? (
                      <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error alert */}
                        {error && (
                          <div className="relative bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
                            <div className="flex gap-3">
                              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          </div>
                        )}

                        {/* Success message */}
                        {success && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
                            <div className="flex gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <p className="text-sm text-green-700">{success}</p>
                            </div>
                          </div>
                        )}

                        {/* Email field */}
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                            Email Address
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition">
                              <Mail className="h-5 w-5" />
                            </div>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                              placeholder="you@healthcare.com"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                            />
                          </div>
                          {touched.email && !isEmailValid && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Enter a valid email address
                            </p>
                          )}
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => navigate('/forgot-password')}
                              className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 font-medium transition"
                            >
                              Forgot?
                            </button>
                          </div>
                          <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition">
                              <Lock className="h-5 w-5" />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              required
                              value={formData.password}
                              onChange={handleChange}
                              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                              placeholder="••••••••"
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {touched.password && !isPasswordValid && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Password is required
                            </p>
                          )}
                        </div>

                        {/* Remember me checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">Remember me for 30 days</span>
                        </label>

                        {/* Security info */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>256-bit SSL encryption • HIPAA compliant • Zero-knowledge authentication</span>
                        </div>

                        {/* Submit button */}
                        <button
                          type="submit"
                          disabled={loading || !isFormValid}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                            </>
                          )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-600">Don't have an account?</span>
                          </div>
                        </div>

                        {/* Sign up link */}
                        <button
                          type="button"
                          onClick={() => navigate('/register')}
                          className="w-full border-2 border-gray-300 hover:border-purple-500 text-gray-700 hover:text-purple-600 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          Create New Account
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>
                    ) : (
                      /* OTP Verification Form */
                      <form className="space-y-6" onSubmit={handleVerifyOTP}>
                        {/* OTP header */}
                        <div className="text-center space-y-2">
                          <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
                          <p className="text-sm text-gray-600">
                            We've sent a 6-digit code to <span className="font-semibold">{formData.email}</span>
                          </p>
                        </div>

                        {/* Error message */}
                        {error && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex gap-3">
                              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          </div>
                        )}

                        {/* OTP input */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">Authentication Code</label>
                          <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full px-4 py-4 text-center text-4xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition bg-gray-50"
                          />
                        </div>

                        {/* OTP Timer */}
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Code expires in <span className="font-semibold text-red-600">5:00</span></p>
                          <button type="button" className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-2">
                            Resend Code
                          </button>
                        </div>

                        {/* Verify button */}
                        <button
                          type="submit"
                          disabled={loading || otp.length !== 6}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Verifying...
                            </>
                          ) : (
                            'Verify & Continue'
                          )}
                        </button>

                        {/* Back button */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowOTP(false);
                            setOtp('');
                            setError('');
                          }}
                          className="w-full text-gray-700 hover:text-gray-900 font-medium py-2 transition"
                        >
                          ← Back to login
                        </button>
                      </form>
                    )}

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-200 space-y-3 text-center text-xs text-gray-600">
                      <p>
                        By logging in, you agree to our{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                          Terms of Service
                        </a>
                        {' '}&{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                          Privacy Policy
                        </a>
                      </p>
                      <p className="text-gray-500">Protected by advanced security protocols</p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 flex justify-center gap-6 text-white/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>HIPAA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>ISO 27001</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>SOC 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional UI Components
const SecurityBadge = ({ icon: Icon, label, description }) => (
  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 hover:border-white/20 transition">
    <div className="flex-shrink-0 text-cyan-400">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  </div>
);

// Feature card component for left sidebar
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition duration-300 transform hover:scale-105">
    <div className="flex-shrink-0 mt-1">
      <Icon className="h-6 w-6 text-cyan-300" />
    </div>
    <div>
      <h3 className="font-semibold text-lg text-white">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  </div>
);

// Avatar component for testimonials
const AvatarBadge = ({ initials, gradient }) => (
  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${gradient} text-white font-bold text-sm`}>
    {initials}
  </div>
);

// Loading skeleton for placeholder states
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
  </div>
);

// Info banner component
const InfoBanner = ({ type = 'info', title, message, icon: Icon }) => {
  const styles = {
    info: 'bg-blue-50 border-l-4 border-blue-500',
    success: 'bg-green-50 border-l-4 border-green-500',
    error: 'bg-red-50 border-l-4 border-red-500',
    warning: 'bg-yellow-50 border-l-4 border-yellow-500'
  };

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  };

  return (
    <div className={`${styles[type]} p-4 rounded-lg`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 ${iconColors[type]} flex-shrink-0`} />
        <div>
          {title && <p className="font-semibold text-gray-900">{title}</p>}
          <p className={`text-sm ${type === 'info' ? 'text-blue-700' : type === 'success' ? 'text-green-700' : type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Role-based login variant component
const RoleLoginOption = ({ role, icon: Icon, description, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
      isActive
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
    }`}
  >
    <Icon className={`h-8 w-8 ${isActive ? 'text-purple-600' : 'text-gray-600'}`} />
    <span className={`text-sm font-semibold ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
      {role}
    </span>
    <span className="text-xs text-gray-500">{description}</span>
  </button>
);

// Animated background gradient
const AnimatedGradientBg = () => (
  <div className="absolute inset-0 opacity-30">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
  </div>
);

// Footer links component
const FooterLink = ({ href, children }) => (
  <a
    href={href}
    className="text-purple-600 hover:text-purple-700 font-medium transition duration-200 hover:underline"
  >
    {children}
  </a>
);

// Status badge component
const StatusBadge = ({ status, label }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-600' : status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'}`}></span>
      {label}
    </span>
  );
};

// Input wrapper with validation
const ValidatedInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon: Icon,
  required
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-900">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-gray-50 hover:bg-white ${
          touched && error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    </div>
    {touched && error && (
      <p className="text-xs text-red-600 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

// Enhanced button component
const EnhancedButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-semibold transition transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    secondary: 'border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
      {children}
    </button>
  );
};

// Session timeout warning
const SessionWarning = ({ minutes }) => (
  <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg max-w-sm">
    <div className="flex gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-yellow-900">Session Expiring Soon</p>
        <p className="text-sm text-yellow-800">Your session will expire in {minutes} minutes. Please save your work.</p>
      </div>
    </div>
  </div>
);

// Notification toast component
const Toast = ({ type = 'info', message, onClose }) => {
  const styles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`${styles[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-slide-in`}>
      <p>{message}</p>
      <button onClick={onClose} className="hover:opacity-80 transition">
        ✕
      </button>
    </div>
  );
};

export default Login;
