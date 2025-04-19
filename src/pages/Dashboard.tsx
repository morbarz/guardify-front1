import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Box, Typography, Paper, Button, Stack, CircularProgress
} from '@mui/material';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import HistoryIcon from '@mui/icons-material/History';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusRes = await adminService.getSubmissionStatus();
        setIsOpen(statusRes.isOpen);

        const historyRes = await axios.get('/preferences/my-submissions', { withCredentials: true });
        const latest = historyRes.data?.history?.[0];
        if (latest?.submittedAt) {
          setLastSubmitted(new Date(latest.submittedAt).toLocaleString());
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setIsOpen(false);
        setLastSubmitted(null);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

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
            <Typography variant="h6" gutterBottom>
              Shift Submissions
            </Typography>

            {/* סטטוס פתיחה */}
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {isOpen === null ? (
                <CircularProgress size={14} sx={{ mr: 1 }} />
              ) : (
                <>
                  <CircleIcon
                    sx={{
                      color: isOpen ? 'green' : 'red',
                      fontSize: 12,
                      mr: 1
                    }}
                  />
                  {isOpen ? 'Submission period is open' : 'Submission period is closed'}
                </>
              )}
            </Typography>

            {/* תאריך הגשה אחרונה */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lastSubmitted
                ? `Last submitted at: ${lastSubmitted}`
                : 'No previous submission found.'}
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditCalendarIcon />}
                onClick={() => navigate('/submit/current')}
              >
                Submit / Edit Current Preferences
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/submit/history')}
              >
                View Submission History
              </Button>
            </Stack>
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
