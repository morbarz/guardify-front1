import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserRoleManager from '../components/userRoleManager'; // <-- זה הקומפוננטה החדשה!

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

      <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>Manage Users</Typography>
        <UserRoleManager /> {/* ← כאן תכנס הטבלה החדשה עם שינויי תפקידים */}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
