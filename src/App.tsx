import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ManualScheduleAdjustment from './pages/ManualScheduleAdjustment';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Settings = lazy(() => import('./pages/settings'));
const MyShifts = lazy(() => import('./pages/MyShifts'));
const CurrentSchedule = lazy(() => import('./pages/CurrentSchedule'));
const PastSchedules = lazy(() => import('./pages/PastSchedules'));
const HomeRedirect = lazy(() => import('./pages/HomeRedirect'));
const AdminSubmissionStatus = lazy(() => import('./pages/AdminSubmissionStatus'));
const SubmitPreferences = lazy(() => import('./pages/SubmitPreferences'));
const AdminPreferenceList = lazy(() => import('./components/AdminPreferenceList'));
const CurrentSubmission = lazy(() => import('./pages/CurrentSubmission'));
const SubmissionHistory = lazy(() => import('./pages/SubmissionHistory'));
const ScheduleResultPage = lazy(() => import('./pages/ScheduleResultPage'));
const AllSchedulesPage = lazy(() => import('./pages/AllSchedulePage')); // Fixed typo in import path
// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>
            <Router>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
                    <Route path="/" element={<HomeRedirect />} />

                    {/* Protected for all authenticated users */}
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/my-shifts" element={<PrivateRoute><MyShifts /></PrivateRoute>} />
                    <Route path="/my-schedule" element={<PrivateRoute><CurrentSchedule /></PrivateRoute>} />
                    <Route path="/past-schedules" element={<PrivateRoute><PastSchedules /></PrivateRoute>} />
                    <Route path="/submit-preferences" element={<PrivateRoute><SubmitPreferences /></PrivateRoute>} />
                    <Route path="/submit/current" element={<PrivateRoute><CurrentSubmission /></PrivateRoute>} />
                    <Route path="/submit/history" element={<PrivateRoute><SubmissionHistory /></PrivateRoute>} />
                    <Route path="/schedule" element={<PrivateRoute><ScheduleResultPage /></PrivateRoute>} />
                    <Route path="/schedule/:id" element={<PrivateRoute><ScheduleResultPage /></PrivateRoute>} />
                    <Route path="/schedule/last-submited" element={<PrivateRoute><CurrentSchedule /></PrivateRoute>} />

                    {/* Admin-only Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/submission-status" element={<AdminRoute><AdminSubmissionStatus /></AdminRoute>} />
                    <Route path="/admin/submitted-preferences" element={<AdminRoute><AdminPreferenceList /></AdminRoute>} />
                    <Route path="/admin/schedule/:id" element={<AdminRoute><ScheduleResultPage /></AdminRoute>} />
                    <Route path="/admin/schedules" element={<AdminRoute><AllSchedulesPage /></AdminRoute>} />
                    <Route path="/admin/schedule/:id/adjust" element={
                      <AdminRoute>
                        <ManualScheduleAdjustment />
                      </AdminRoute>
                    } />
                  </Routes>
                </Suspense>
              </MainLayout>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
