import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, isToday, parseISO, startOfDay, endOfDay } from 'date-fns';
import {
  Search,
  UserPlus,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  Filter,
  RefreshCw,
  UserCheck,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react';
import { patientAPI, receptionistAPI, assignmentAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Fetch today's appointments/visits
  const { data: todaysVisits, isLoading: visitsLoading } = useQuery(
    'todaysVisits',
    () => patientAPI.getVisits(null, {
      startDate: startOfDay(new Date()).toISOString(),
      endDate: endOfDay(new Date()).toISOString()
    }),
    { enabled: !!user }
  );

  // Fetch complaints
  const { data: complaints, isLoading: complaintsLoading } = useQuery(
    'complaints',
    () => receptionistAPI.getComplaints(),
    { enabled: !!user }
  );

  // Fetch assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery(
    'assignments',
    () => assignmentAPI.getAllAssignments(),
    { enabled: !!user }
  );

  // Search patients mutation
  const searchPatientsMutation = useMutation(
    (searchParams) => patientAPI.search(searchParams),
    {
      onSuccess: (data) => {
        // Handle search results
      }
    }
  );

  // Register complaint mutation
  const registerComplaintMutation = useMutation(
    receptionistAPI.registerComplaint,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('complaints');
        toast.success('Complaint registered successfully');
      },
      onError: (error) => {
        toast.error('Failed to register complaint');
      }
    }
  );

  const todaysAppointments = todaysVisits?.data || [];
  const pendingComplaints = complaints?.data?.filter(c => c.status === 'pending') || [];
  const activeAssignments = assignments?.data || [];

  const stats = {
    todaysAppointments: todaysAppointments.length,
    pendingComplaints: pendingComplaints.length,
    activeAssignments: activeAssignments.length,
    totalPatients: 0 // Would need to fetch from API
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, subtitle }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, onClick, color = 'bg-blue-500', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-xl shadow-sm transition-all duration-200 flex flex-col items-center gap-2 hover:shadow-lg hover:scale-105`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{title}</span>
    </button>
  );

  const AppointmentCard = ({ appointment, onStatusChange }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{appointment.type || 'Appointment'}</p>
            <p className="text-sm text-gray-600">{appointment.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appointment.status === 'confirmed' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Confirmed
            </span>
          )}
          {appointment.status === 'pending' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Pending
            </span>
          )}
          {appointment.status === 'cancelled' && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Cancelled
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {appointment.patient?.firstName} {appointment.patient?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {appointment.doctor && `Dr. ${appointment.doctor.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange(appointment._id, 'confirmed')}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={() => onStatusChange(appointment._id, 'cancelled')}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const ComplaintCard = ({ complaint }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Complaint #{complaint._id.slice(-6)}</p>
            <p className="text-sm text-gray-600">{format(parseISO(complaint.createdAt), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {complaint.priority}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">{complaint.description}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {complaint.patient?.firstName} {complaint.patient?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            Assigned to: Dr. {complaint.doctor?.name}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
          complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {complaint.status}
        </span>
      </div>
    </div>
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchPatientsMutation.mutate({ search: searchTerm });
    }
  };

  const handleStatusChange = (appointmentId, status) => {
    // This would need an API endpoint to update appointment status
    toast.success(`Appointment ${status}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Receptionist Dashboard</h1>
              <p className="text-purple-100 mt-2 text-lg">Manage patients, appointments, and complaints efficiently</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-purple-200">Welcome back</p>
                <p className="text-sm font-medium text-white">{user?.name || 'Receptionist'}</p>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <UserCheck className="h-8 w-8 text-white" />
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
            title="Today's Appointments"
            value={stats.todaysAppointments}
            color="bg-blue-500"
            bgColor="bg-blue-50"
            subtitle="Scheduled for today"
          />
          <StatCard
            icon={AlertTriangle}
            title="Pending Complaints"
            value={stats.pendingComplaints}
            color="bg-orange-500"
            bgColor="bg-orange-50"
            subtitle="Require attention"
          />
          <StatCard
            icon={UserCheck}
            title="Active Assignments"
            value={stats.activeAssignments}
            color="bg-green-500"
            bgColor="bg-green-50"
            subtitle="Doctor-patient pairs"
          />
          <StatCard
            icon={Users}
            title="Total Patients"
            value={stats.totalPatients}
            color="bg-purple-500"
            bgColor="bg-purple-50"
            subtitle="Registered patients"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickAction
              icon={UserPlus}
              title="Register Patient"
              onClick={() => setShowPatientModal(true)}
              color="bg-blue-500"
            />
            <QuickAction
              icon={Calendar}
              title="Schedule Appointment"
              onClick={() => setShowAppointmentModal(true)}
              color="bg-green-500"
            />
            <QuickAction
              icon={Search}
              title="Search Patients"
              onClick={() => setActiveTab('search')}
              color="bg-purple-500"
            />
            <QuickAction
              icon={FileText}
              title="File Complaint"
              onClick={() => toast.success('Complaint filing coming soon!')}
              color="bg-orange-500"
            />
            <QuickAction
              icon={UserCheck}
              title="Manage Assignments"
              onClick={() => setActiveTab('assignments')}
              color="bg-indigo-500"
            />
            <QuickAction
              icon={RefreshCw}
              title="Refresh Data"
              onClick={() => queryClient.invalidateQueries()}
              color="bg-gray-500"
            />
          </div>
        </div>

        {/* Patient Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Search</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Appointments
                </h2>
                <span className="text-sm text-gray-500">{stats.todaysAppointments} appointments</span>
              </div>
              <div className="p-6">
                {visitsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled for today</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Schedule an appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Complaints */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Complaints
                </h2>
              </div>
              <div className="p-6">
                {complaintsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingComplaints.length > 0 ? (
                  <div className="space-y-4">
                    {pendingComplaints.slice(0, 3).map((complaint) => (
                      <ComplaintCard key={complaint._id} complaint={complaint} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending complaints</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Assignments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Active Assignments
                </h2>
              </div>
              <div className="p-6">
                {assignmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : activeAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {activeAssignments.slice(0, 4).map((assignment) => (
                      <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.patient?.firstName} {assignment.patient?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Dr. {assignment.doctor?.name}
                          </p>
                        </div>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active assignments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
