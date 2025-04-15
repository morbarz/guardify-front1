import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
//import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/settings'
import MyShifts from './pages/MyShifts'
import CurrentSchedule from './pages/CurrentSchedule'
import PastSchedules from './pages/PastSchedules'
import HomeRedirect from './pages/HomeRedirect';
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
<Route path="/" element={<HomeRedirect />} /> -בודק אם אדמין או משתמש מסוג אחר ואז יודע לאן להפנות
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> - אם לא אדמין ינתב לכאן
<Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} /> -אם אדמין ינתב לכאן




*/
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />              <Route path="/my-shifts" element={<MyShifts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-schedule" element={<CurrentSchedule />} />
              <Route path="/past-schedules" element={<PastSchedules />} />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;