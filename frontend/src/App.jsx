import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Landing
import LandingPage from './pages/LandingPage';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Shared
import Dashboard from './pages/shared/Dashboard';
import ProfilePage from './pages/shared/ProfilePage';

// Admin
import StaffDetails from './pages/Admin/StaffDetails';
import ResourcePersons from './pages/Admin/ResourcePersons';
import { Institutions, Courses, CourseCoordinatorsList, ResourceQualifications, ResourcePayments, FoodMaster } from './pages/Admin/AdminPages';

// Coordinator
import TrainingProgrammes from './pages/Coordinator/TrainingProgrammes';
import ParticipantSelection from './pages/Coordinator/ParticipantSelection';
import ApprovalEmails from './pages/Coordinator/ApprovalEmails';
import AttendancePage from './pages/Coordinator/Attendance';
import FeedbackSummary from './pages/Coordinator/FeedbackSummary';

// Participant
import { ApplyTraining, MyApplications, FeedbackForm } from './pages/participant/ParticipantPages';

// Users (Admin)
import UsersControl from './pages/Admin/UsersControl';

const ALL_ROLES      = ['Admin', 'Director', 'Training Officer', 'Course Coordinator', 'Institutional Coordinator', 'Participant', 'Special'];
const ADMIN          = ['Admin'];
const OFFICER        = ['Admin', 'Director', 'Training Officer', 'Course Coordinator'];
const COORD          = ['Admin', 'Training Officer', 'Course Coordinator'];
const PARTICIPANT    = ['Admin', 'Institutional Coordinator', 'Participant'];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '8px', fontSize: '14px' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center flex-col gap-3">
              <h1 className="text-2xl font-bold text-slate-700">403 — Access Denied</h1>
              <p className="text-muted">You don't have permission to view this page.</p>
              <a href="/login" className="btn btn-primary">Return to Login</a>
            </div>
          } />

          {/* Protected App */}
          <Route path="/app" element={<ProtectedRoute roles={ALL_ROLES}><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile"   element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="staff"                   element={<ProtectedRoute roles={ADMIN}><StaffDetails /></ProtectedRoute>} />
            <Route path="institutions"            element={<ProtectedRoute roles={ADMIN}><Institutions /></ProtectedRoute>} />
            <Route path="courses"                 element={<ProtectedRoute roles={ADMIN}><Courses /></ProtectedRoute>} />
            <Route path="coordinators"            element={<ProtectedRoute roles={ADMIN}><CourseCoordinatorsList /></ProtectedRoute>} />
            <Route path="resource-persons"        element={<ProtectedRoute roles={ADMIN}><ResourcePersons /></ProtectedRoute>} />
            <Route path="resource-qualifications" element={<ProtectedRoute roles={ADMIN}><ResourceQualifications /></ProtectedRoute>} />
            <Route path="resource-payments"       element={<ProtectedRoute roles={ADMIN}><ResourcePayments /></ProtectedRoute>} />
            <Route path="food-items"              element={<ProtectedRoute roles={ADMIN}><FoodMaster /></ProtectedRoute>} />
            <Route path="users"                   element={<ProtectedRoute roles={ADMIN}><UsersControl /></ProtectedRoute>} />

            {/* Coordinator / Officer routes */}
            <Route path="training-programmes"   element={<ProtectedRoute roles={OFFICER}><TrainingProgrammes /></ProtectedRoute>} />
            <Route path="participant-selection" element={<ProtectedRoute roles={COORD}><ParticipantSelection /></ProtectedRoute>} />
            <Route path="approval-emails"       element={<ProtectedRoute roles={COORD}><ApprovalEmails /></ProtectedRoute>} />
            <Route path="attendance"            element={<ProtectedRoute roles={COORD}><AttendancePage /></ProtectedRoute>} />
            <Route path="feedback-summary"      element={<ProtectedRoute roles={OFFICER}><FeedbackSummary /></ProtectedRoute>} />

            {/* Participant routes */}
            <Route path="apply"           element={<ProtectedRoute roles={PARTICIPANT}><ApplyTraining /></ProtectedRoute>} />
            <Route path="my-applications" element={<ProtectedRoute roles={PARTICIPANT}><MyApplications /></ProtectedRoute>} />
            <Route path="my-feedback"     element={<FeedbackForm />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
