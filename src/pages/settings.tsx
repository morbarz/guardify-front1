
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        הגדרות
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">פרטי משתמש</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography><strong>שם:</strong> {user.name}</Typography>
        <Typography><strong>מייל:</strong> {user.mail}</Typography>
        <Typography><strong>תפקיד:</strong> {user.role}</Typography>
      </Paper>

      {/* future sections here */}
    </Box>
  );
};
export default Settings;



