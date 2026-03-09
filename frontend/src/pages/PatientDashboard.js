import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import {
  Calendar,
  FileText,
  Pill,
  Heart,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  TrendingUp,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import { patientAPI, consentAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    'patientProfile',
    () => patientAPI.getProfile(user.patientId),
    { enabled: !!user.patientId }
  );

  // Fetch medical records
  const { data: medicalRecords, isLoading: recordsLoading } = useQuery(
    'medicalRecords',
    () => patientAPI.getMedicalRecords(user.patientId),
    { enabled: !!user.patientId }
  );

  // Fetch visits
  const { data: visits, isLoading: visitsLoading } = useQuery(
    'patientVisits',
    () => patientAPI.getVisits(user.patientId),
    { enabled: !!user.patientId }
  );

  // Fetch medications
  const { data: medications, isLoading: medsLoading } = useQuery(
    'patientMedications',
    () => patientAPI.getMedications(user.patientId),
    { enabled: !!user.patientId }
  );

  // Fetch consents
  const { data: consents, isLoading: consentsLoading } = useQuery(
    'patientConsents',
    () => consentAPI.getMyConsents(),
    { enabled: !!user.patientId }
  );

  const upcomingVisits = visits?.data?.filter(visit =>
    new Date(visit.date) >= new Date()
  ).slice(0, 3) || [];

  const recentRecords = medicalRecords?.data?.slice(0, 5) || [];
  const activeMedications = medications?.data?.filter(med => med.status === 'active') || [];
  const pendingConsents = consents?.data?.filter(consent => consent.status === 'pending') || [];

  const stats = {
    upcomingVisits: upcomingVisits.length,
    activeMedications: activeMedications.length,
    pendingConsents: pendingConsents.length,
    totalRecords: medicalRecords?.data?.length || 0
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, onClick, color = 'bg-blue-500' }) => (
    <button
      onClick={onClick}
      className={`${color} hover:opacity-90 hover:scale-105 text-white p-4 rounded-xl shadow-sm transition-all duration-200 flex flex-col items-center gap-2 hover:shadow-lg`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{title}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Welcome back, {profile?.data?.firstName || 'Patient'}</h1>
              <p className="text-blue-100 mt-2 text-lg">Manage your health records and appointments in one place</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-blue-200">Last login</p>
                <p className="text-sm font-medium text-white">{format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Upcoming Visits"
            value={stats.upcomingVisits}
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={Pill}
            title="Active Medications"
            value={stats.activeMedications}
            color="bg-green-500"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={FileText}
            title="Medical Records"
            value={stats.totalRecords}
            color="bg-purple-500"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending Consents"
            value={stats.pendingConsents}
            color="bg-orange-500"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              icon={Calendar}
              title="Book Appointment"
              onClick={() => toast.success('Appointment booking coming soon!')}
              color="bg-blue-500"
            />
            <QuickAction
              icon={FileText}
              title="View Records"
              onClick={() => setActiveTab('records')}
              color="bg-green-500"
            />
            <QuickAction
              icon={Settings}
              title="Manage Consents"
              onClick={() => setActiveTab('consents')}
              color="bg-purple-500"
            />
            <QuickAction
              icon={Phone}
              title="Contact Doctor"
              onClick={() => toast.success('Contact feature coming soon!')}
              color="bg-orange-500"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </h2>
              </div>
              <div className="p-6">
                {visitsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingVisits.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingVisits.map((visit) => (
                      <div key={visit._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{visit.type || 'Appointment'}</p>
                            <p className="text-sm text-gray-600">
                              {format(parseISO(visit.date), 'MMM dd, yyyy')} at {visit.time}
                            </p>
                            {visit.doctor && (
                              <p className="text-sm text-gray-500">Dr. {visit.doctor.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isToday(parseISO(visit.date)) && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Today
                            </span>
                          )}
                          {isTomorrow(parseISO(visit.date)) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Tomorrow
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Schedule an appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health Overview */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Overview
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blood Pressure</span>
                  <span className="font-medium text-gray-900">120/80</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Heart Rate</span>
                  <span className="font-medium text-gray-900">72 bpm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight</span>
                  <span className="font-medium text-gray-900">165 lbs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Height</span>
                  <span className="font-medium text-gray-900">5'10"</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentRecords.slice(0, 3).map((record) => (
                    <div key={record._id} className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 rounded">
                        <FileText className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{record.type}</p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(record.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentRecords.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Medications */}
        {activeMedications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Active Medications
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMedications.map((medication) => (
                  <div key={medication._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{medication.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{medication.dosage}</p>
                    <p className="text-xs text-gray-500">
                      Prescribed: {format(parseISO(medication.prescribedDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
};

export default PatientDashboard;
