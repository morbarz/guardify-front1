import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserRoleManager from '../components/UserRoleManager';
import SubmissionStatus from '../components/SubmissionStatus';
import AdminPreferenceList from '../components/AdminPreferenceList';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔐 גישה למנהלים בלבד
  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Access denied: Admins only.
        </Typography>
      </Box>
    );
  }

  // 🛠️ יצירת סידור חדש
  const handleCreateSchedule = async () => {
    setLoading(true);
    try {
      const res = await adminService.createSchedule();

      if (res.success && res.schedule) {
        navigate(`/admin/schedule/${res.scheduleId}`, {
          state: { schedule: res.schedule },
        });
      } else {
        alert('❌ Failed to create schedule: ' + res.message);
      }
    } catch (error) {
      console.error('❌ Failed to generate schedule:', error);
      alert('Failed to generate schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Typography variant="h6" gutterBottom>
        Welcome, {user.name}!
      </Typography>

      {/* 🔄 סטטוס פתיחה */}
      <SubmissionStatus />

      {/* 🔘 כפתור יצירת סידור */}
      <Box sx={{ my: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateSchedule}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create New Weekly Schedule'
          )}
        </Button>
      </Box>

      {/* 👤 ניהול משתמשים */}
      <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Manage Users
        </Typography>
        <UserRoleManager />
      </Paper>

      {/* 📋 הגשות המשתמשים */}
      <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Submitted Preferences
        </Typography>
        <AdminPreferenceList />
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
