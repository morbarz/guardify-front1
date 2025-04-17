import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SubmissionStatus from '../components/SubmissionStatus';
import SubmissionForm from '../components/SubmissionForm';
import { useAuth } from '../contexts/AuthContext';

const AdminSubmissionStatus: React.FC = () => {
  const { user } = useAuth();

  // רק אדמין יכול לגשת לדף הזה
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
        Submission Management
      </Typography>

      <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
        {/* תצוגת סטטוס ההגשה */}
        <SubmissionStatus />

        {/* טופס פתיחה/סגירה של תקופת הגשה */}
        <SubmissionForm />
      </Paper>
    </Box>
  );
};

export default AdminSubmissionStatus;
