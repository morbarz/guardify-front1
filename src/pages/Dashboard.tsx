import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Optionally show a loader or redirect

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {`Welcome back, ${user.name}!`}
        <br />
        {`Your role is: ${user.role}`}
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        sx={{ mt: 2, mb: 4 }}
      >
        Logout
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Dashboard Panel A</Typography>
            <Typography>Feature content here.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Dashboard Panel B</Typography>
            <Typography>Additional data or UI components here.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
