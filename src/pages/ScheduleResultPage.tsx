import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
  alpha,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { adminService } from '../services/api';

const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const safeJoin = (arr: any[] | undefined): string => {
  if (!Array.isArray(arr) || arr.length === 0) return '—';

  return arr
    .map((guard: any) => {
      if (!guard) return null;

      if (typeof guard === 'string') {
        return guard.includes('@') ? guard.split('@')[0] : guard;
      }

      if (typeof guard === 'object') {
        return guard.name || guard.mail || guard.email || null;
      }

      return null;
    })
    .filter((name: string | null): name is string => name !== null)
    .join(', ') || '—';
};

const ScheduleResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const originalSchedule = location.state?.schedule;
  const [schedule, setSchedule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const processSchedule = async () => {
      if (!originalSchedule) {
        setLoading(false);
        return;
      }

      const isEmail = (value: any): boolean =>
        typeof value === 'string' && value.includes('@');

      const hasEmails =
        originalSchedule.firstWeek?.some((day: any) =>
          ['morning', 'noon', 'night'].some(
            (shift) => Array.isArray(day?.[shift]) && day[shift].some((g: any) => isEmail(g))
          )
        ) ||
        originalSchedule.secondWeek?.some((day: any) =>
          ['morning', 'noon', 'night'].some(
            (shift) => Array.isArray(day?.[shift]) && day[shift].some((g: any) => isEmail(g))
          )
        );

      if (hasEmails) {
        try {
          const res = await adminService.convertEmailsToNames(originalSchedule);
          if (res.success) {
            console.log('✅ Converted Schedule:', res.schedule);
            setSchedule(res.schedule);
          } else {
            console.warn('⚠️ Conversion failed:', res.message);
            setSchedule(originalSchedule);
          }
        } catch (err) {
          console.error('❌ Error during schedule conversion:', err);
          setSchedule(originalSchedule);
        }
      } else {
        setSchedule(originalSchedule);
      }

      setLoading(false);
    };

    processSchedule();
  }, [originalSchedule]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          ⚠️ No schedule data received.
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          ← Go Back
        </Button>
      </Box>
    );
  }

  const renderWeek = (week: any[], title: string) => (
    <Card elevation={2} sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarMonthIcon sx={{ fontSize: 24, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5">{title}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {week.map((dayObj: any, i: number) => {
            const dayIndex = i + (title === 'Week 2' ? 7 : 0);
            return (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: dayObj ? alpha(theme.palette.primary.light, 0.05) : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'medium' }}>
                      {daysMap[i]}
                    </Typography>
                    <Chip label={`Day ${dayIndex + 1}`} size="small" color="primary" variant="outlined" />
                  </Box>

                  {dayObj ? (
                    <Stack spacing={1}>
                      {['morning', 'noon', 'night'].map((shiftType) => (
                        <Box key={shiftType}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}
                          </Typography>
                          <Typography variant="body2">{safeJoin(dayObj[shiftType])}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No shifts scheduled
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">Weekly Schedule</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">Schedule ID: {schedule._id}</Typography>
            <Typography variant="body2" color="text.secondary">Created: {new Date(schedule.createdAt).toLocaleString()}</Typography>
          </Box>

          {renderWeek(schedule.firstWeek, 'Week 1')}
          {renderWeek(schedule.secondWeek, 'Week 2')}
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('redirect')}>
              לחזרה לתפריט הראשי
            </Button>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Download Schedule"><IconButton color="primary"><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="Share Schedule"><IconButton color="primary"><ShareIcon /></IconButton></Tooltip>
            <Tooltip title="Print Schedule"><IconButton color="primary"><PrintIcon /></IconButton></Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ScheduleResultPage;
