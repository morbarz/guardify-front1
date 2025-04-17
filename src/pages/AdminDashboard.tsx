import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserRoleManager from '../components/UserRoleManager';
import SubmissionControl from '../components/SubmissionControl'; // 👈 נוספה כאן
import SubmissionForm from '../components/SubmissionForm';
import SubmissionStatus from '../components/submissionStatus';
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  console.log(user);

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Access denied: Admins only.
        </Typography>
      </Box>
    );
  }

  return (
<Box sx={{ p: 4 }}>
  <Typography variant="h4" gutterBottom>
    Admin Dashboard
  </Typography>

  <Typography variant="h6" gutterBottom>
    Welcome, {user.name}!
  </Typography>
  <SubmissionStatus /> {/* 👈 כאן זה נכנס */}


  {/* 👇 ניהול משתמשים */}
  <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
    <Typography variant="h6" gutterBottom>Manage Users</Typography>
    <UserRoleManager />
  </Paper>
</Box>

  );
};

export default AdminDashboard;
