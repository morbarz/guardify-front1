import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/settings';
import MyShifts from './pages/MyShifts';
import CurrentSchedule from './pages/CurrentSchedule';
import PastSchedules from './pages/PastSchedules';
import HomeRedirect from './pages/HomeRedirect';
import AdminSubmissionStatus from './pages/AdminSubmissionStatus';
import SubmitPreferences from './pages/SubmitPreferences';
import AdminPreferenceList from './components/AdminPreferenceList';
import CurrentSubmission from './pages/CurrentSubmission';
import SubmissionHistory from './pages/SubmissionHistory';
import ScheduleResultPage from './pages/ScheduleResultPage';
import AllSchedulesPage from './pages/AllSchedulePage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; // 👈 ודא שהקומפוננטה קיימת

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

/*
📌 הסבר על ראוטים מרכזיים:
- "/" → HomeRedirect מחליט אם להפנות ל-admin או dashboard
- "/dashboard" → משתמש רגיל
- "/admin" → אדמין בלבד
*/

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <MainLayout>
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

              {/* Admin-only Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/submission-status" element={<AdminRoute><AdminSubmissionStatus /></AdminRoute>} />
              <Route path="/admin/submitted-preferences" element={<AdminRoute><AdminPreferenceList /></AdminRoute>} />
              <Route path="/admin/schedule/:id" element={<AdminRoute><ScheduleResultPage /></AdminRoute>} />
              <Route path="/admin/schedules" element={<AdminRoute><AllSchedulesPage /></AdminRoute>} />

            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
