import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle
} from '@mui/material';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import HistoryIcon from '@mui/icons-material/History';
import CircleIcon from '@mui/icons-material/Circle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '../contexts/AuthContext';
import { adminService, scheduleService } from '../services/api';
import axios from 'axios';
import { useApi } from '../hooks/useApi';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { User } from '../types/models';
import { scheduleSchema } from '../utils/validationSchemas';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state, execute } = useApi<User>();
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [lastSchedule, setLastSchedule] = useState<any | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

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

        // Fetch last schedule using the correct endpoint
        try {
          const scheduleRes = await scheduleService.getLastSubmittedSchedule();
          if (scheduleRes.success && scheduleRes.schedule) {
            setLastSchedule(scheduleRes.schedule);
          }
        } catch (scheduleErr) {
          console.error('Failed to fetch schedule:', scheduleErr);
          setLastSchedule(null);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setIsOpen(false);
        setLastSubmitted(null);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    execute({
      url: '/api/user/profile',
      method: 'GET',
    });
  }, [execute]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (state.loading) {
    return <DashboardSkeleton />;
  }

  if (state.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
          <Typography color="error" variant="h6">Error: {state.error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* User Welcome Section */}
      <Card elevation={3} sx={{ mb: 4, bgcolor: theme.palette.primary.main, color: 'white' }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: theme.palette.primary.main, width: 56, height: 56, mr: 2 }}>
              <AccountCircleIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
                Welcome back, {user.name}!
              </Typography>
              <Typography variant="subtitle1">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Shift Submission Status Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Shift Submissions</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                {/* Submission Status */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isOpen === null ? (
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                  ) : (
                    <CircleIcon
                      sx={{
                        color: isOpen ? theme.palette.success.main : theme.palette.error.main,
                        fontSize: 12,
                        mr: 1
                      }}
                    />
                  )}
                  <Typography>
                    {isOpen ? 'Submission period is open' : 'Submission period is closed'}
                  </Typography>
                </Box>

                {/* Last Submission Time */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    {lastSubmitted
                      ? `Last submitted: ${lastSubmitted}`
                      : 'No previous submission found'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Stack spacing={2} width="100%">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EditCalendarIcon />}
                  onClick={() => navigate('/submit/current')}
                  disabled={!isOpen}
                >
                  Submit / Edit Preferences
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/submit/history')}
                >
                  View History
                </Button>
              </Stack>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/my-schedule')}
                  startIcon={<CalendarMonthIcon />}
                >
                  View Current Schedule
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/my-shifts')}
                  startIcon={<AccessTimeIcon />}
                >
                  My Shifts
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Last Schedule Card */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Current Schedule</Typography>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label={lastSchedule?.status || 'N/A'}
                  size="small"
                  sx={{
                    color: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              
              {loadingSchedule ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : lastSchedule ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AccessTimeIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(lastSchedule.startDate).toLocaleDateString()} - {new Date(lastSchedule.endDate).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Week Tabs */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant={activeWeek === 1 ? "contained" : "outlined"}
                        onClick={() => setActiveWeek(1)}
                        size="small"
                      >
                        Week 1
                      </Button>
                      <Button
                        variant={activeWeek === 2 ? "contained" : "outlined"}
                        onClick={() => setActiveWeek(2)}
                        size="small"
                      >
                        Week 2
                      </Button>
                    </Stack>
                  </Box>

                  {/* Schedule Grid */}
                  <Grid container spacing={2}>
                    {(activeWeek === 1 ? lastSchedule.firstWeek : lastSchedule.secondWeek)?.map((day: any, index: number) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            height: '100%',
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.light, 0.1),
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'medium' }}>
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}
                            </Typography>
                            <Chip 
                              label={`Day ${activeWeek === 1 ? index + 1 : index + 8}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          
                          <Stack spacing={2}>
                            {['morning', 'noon', 'night'].map((shift) => (
                              <Box key={shift}>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    mb: 0.5
                                  }}
                                >
                                  <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                  {shift.charAt(0).toUpperCase() + shift.slice(1)}
                                </Typography>
                                <Typography variant="body2">
                                  {day[shift]?.join(', ') || '—'}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Alert severity="info">
                  <AlertTitle>No Schedule Available</AlertTitle>
                  There is no schedule available at the moment.
                </Alert>
              )}
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => navigate('/schedule', { state: { schedule: lastSchedule } })}
                  disabled={!lastSchedule}
                >
                  View Full Schedule
                </Button>
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Download Schedule">
                  <IconButton color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Schedule">
                  <IconButton color="primary">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
