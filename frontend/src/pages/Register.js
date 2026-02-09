import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    phone: '',
    dateOfBirth: '',
    dataProcessingConsent: false,
    licenseNumber: '',
    specialization: '',
    department: '',
    receptionistId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const medicalStaffRoles = ['doctor', 'receptionist'];
  const isMedicalStaff = medicalStaffRoles.includes(formData.role.toLowerCase());

  const getPasswordStrength = (value) => {
    if (!value) return { label: 'Weak', color: 'text-rose-600', bar: 'bg-rose-200', width: 'w-1/4' };
    const lengthScore = value.length >= 10 ? 2 : value.length >= 6 ? 1 : 0;
    const varietyScore = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/].reduce(
      (acc, regex) => acc + (regex.test(value) ? 1 : 0),
      0
    );
    const score = lengthScore + varietyScore;

    if (score >= 5) {
      return { label: 'Strong', color: 'text-emerald-600', bar: 'bg-emerald-400', width: 'w-full' };
    }
    if (score >= 3) {
      return { label: 'Medium', color: 'text-amber-600', bar: 'bg-amber-300', width: 'w-2/3' };
    }
    return { label: 'Weak', color: 'text-rose-600', bar: 'bg-rose-300', width: 'w-1/3' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordChecks = useMemo(() => {
    const value = formData.password || '';
    return {
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };
  }, [formData.password]);
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;
  const hasRequiredStaffFields = (() => {
    if (!isMedicalStaff) return true;
    const role = formData.role.toLowerCase();
    if (role === 'doctor') {
      return formData.licenseNumber && formData.department && formData.specialization;
    }
    if (role === 'receptionist') {
      return !!formData.receptionistId;
    }
    return true;
  })();
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    passwordsMatch &&
    isPasswordStrong &&
    formData.dataProcessingConsent &&
    (formData.role !== 'PATIENT' || formData.dateOfBirth) &&
    hasRequiredStaffFields;

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all required fields
    if (!formData.firstName) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName) {
      setError('Last name is required');
      return;
    }
    if (!formData.email) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special characters');
      return;
    }
    if (formData.role === 'PATIENT' && !formData.dateOfBirth) {
      setError('Date of birth is required for patients');
      return;
    }
    if (!formData.dataProcessingConsent) {
      setError('You must agree to data processing consent');
      return;
    }

    // Validate staff-specific fields
    const roleLower = formData.role.toLowerCase();
    if (medicalStaffRoles.includes(roleLower)) {
      if (roleLower === 'doctor') {
        if (!formData.licenseNumber) {
          setError('License number is required for doctors');
          return;
        }
        if (!formData.department) {
          setError('Department is required for doctors');
          return;
        }
        if (!formData.specialization) {
          setError('Specialization is required for doctors');
          return;
        }
      }
      if (roleLower === 'receptionist') {
        if (!formData.receptionistId) {
          setError('Receptionist ID is required for receptionists');
          return;
        }
      }
    }

    setLoading(true);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('You appear to be offline. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.role === 'PATIENT' ? formData.dateOfBirth : '',
          phone: formData.phone,
          professionalInfo: {}
        },
        privacy: {
          dataProcessingConsent: formData.dataProcessingConsent,
          marketingConsent: false
        }
      };

      // Add professional info for medical staff
      if (medicalStaffRoles.includes(formData.role.toLowerCase())) {
        const roleLower = formData.role.toLowerCase();
        if (roleLower === 'doctor') {
          requestData.profile.professionalInfo = {
            licenseNumber: formData.licenseNumber,
            department: formData.department,
            specialization: formData.specialization
          };
        } else if (roleLower === 'receptionist') {
          requestData.profile.professionalInfo = {
            receptionistId: formData.receptionistId
          };
        }
      }

      const response = await runWithRetry(() => authAPI.register(
        requestData,
        { headers: { 'X-Silent-Errors': 'true' } }
      ));

      if (response?.success) {
        setSuccess(true);
        setError('');
      } else {
        const message = response?.message || 'Registration failed';
        const errors = Array.isArray(response?.errors) ? response.errors.join(' ') : '';
        setError(errors ? `${message} ${errors}` : message);
        setLoading(false);
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      const apiErrors = Array.isArray(err?.response?.data?.errors)
        ? err.response.data.errors.join(' | ')
        : err?.response?.data?.errors;
      let message = 'Unable to reach the server. Please check your connection and try again.';
      
      if (apiErrors) {
        message = apiErrors;
      } else if (apiMessage) {
        message = apiMessage;
      } else if (err?.message?.includes('timeout')) {
        message = 'Request timed out. Please try again.';
      }
      
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm px-8 py-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-semibold">SH</span>
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">Create account</h2>
            <p className="mt-2 text-gray-600">Join our secure healthcare platform</p>
          </div>

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm fade-in-soft">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Account Created Successfully!</h3>
                <p className="text-green-700 mb-4">Your account has been registered. Please log in with your credentials to access the platform.</p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Go to Login
                </button>
              </div>
            )}

            {!success && (
            <>
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Personal Information</h3>
                <span className="text-xs text-gray-500">All fields required unless marked optional.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <label
                    htmlFor="firstName"
                    className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                  >
                    First name
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <label
                    htmlFor="lastName"
                    className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                  >
                    Last name
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                >
                  Email address
                </label>
                <p className="text-xs text-gray-500 mt-2">We’ll send verification and account updates here.</p>
              </div>

              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <label
                  htmlFor="phone"
                  className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                >
                  Phone number (optional)
                </label>
                <p className="text-xs text-gray-500 mt-2">Used for important security alerts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required={formData.role === 'PATIENT'}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <label
                    htmlFor="dateOfBirth"
                    className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                  >
                    Date of birth {formData.role === 'PATIENT' && <span className="text-rose-500">*</span>}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Used to verify patient identity.</p>
                </div>

                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="peer block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                  </select>
                  <label
                    htmlFor="role"
                    className="absolute left-4 -top-2 text-xs text-blue-600 bg-white px-1"
                  >
                    Role
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Select your primary role for access.</p>
                </div>
              </div>

              {isMedicalStaff && (
                <div className="space-y-4 border-t border-blue-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900">Professional Information</h4>

                  <>
                    {formData.role.toLowerCase() === 'receptionist' ? (
                      <div className="relative">
                        <input
                          id="receptionistId"
                          name="receptionistId"
                          type="text"
                          required
                          value={formData.receptionistId}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label
                          htmlFor="receptionistId"
                          className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                        >
                          Receptionist ID <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Your internal receptionist identifier.</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            id="licenseNumber"
                            name="licenseNumber"
                            type="text"
                            required
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                          <label
                            htmlFor="licenseNumber"
                            className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                          >
                            License number <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Required to verify your credentials.</p>
                        </div>

                        <div className="relative">
                          <input
                            id="department"
                            name="department"
                            type="text"
                            required
                            value={formData.department}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                          <label
                            htmlFor="department"
                            className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                          >
                            Department <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Example: Cardiology, Emergency, Laboratory.</p>
                        </div>
                      </>
                    )}

                    {formData.role.toLowerCase() === 'doctor' && (
                      <div className="relative">
                        <input
                          id="specialization"
                          name="specialization"
                          type="text"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label
                          htmlFor="specialization"
                          className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                        >
                          Specialization <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Example: Cardiology, Pediatrics.</p>
                      </div>
                    )}
                  </>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Account Security</h3>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label} password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                  <p className="text-xs text-gray-500 mt-2">Use 8+ characters with mix of letters and numbers.</p>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                    <div className={`h-1.5 rounded-full ${passwordStrength.bar} ${passwordStrength.width}`} />
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-4 top-3 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white px-1"
                  >
                    Confirm password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                  <p className={`text-xs mt-2 ${passwordsMatch ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {passwordsMatch ? 'Passwords match' : 'Re-enter the same password.'}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Consent & Terms</h3>
              <div className="flex items-start gap-3">
                <input
                  id="dataProcessingConsent"
                  name="dataProcessingConsent"
                  type="checkbox"
                  checked={formData.dataProcessingConsent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="dataProcessingConsent" className="text-sm text-gray-700">
                  I agree to the processing of my personal data for healthcare purposes.
                  <span className="block text-xs text-gray-500 mt-1">Required to create your account.</span>
                </label>
              </div>
            </section>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign in
                  </button>
                </span>
              </div>
            </div>
            </>
            )}
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-blue-100">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11a7 7 0 1114 0v3a4 4 0 01-4 4H9a4 4 0 01-4-4v-3z" />
            </svg>
            Your data is securely processed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
