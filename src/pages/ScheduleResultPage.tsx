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
  Skeleton
} from '@mui/material';
import { adminService } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 🧠 מציג רק שמות מהשיבוצים
const safeJoin = (arr: any[] | undefined): string => {
  if (!Array.isArray(arr)) return '—';
  return arr
    .map((v) =>
      typeof v === 'string'
        ? v
        : typeof v === 'object' && v !== null && 'name' in v
        ? v.name
        : typeof v === 'object' && v.fullName
        ? v.fullName
        : typeof v === 'object' && v.mail
        ? v.mail
        : JSON.stringify(v)
    )
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

      const hasEmails =
        originalSchedule.firstWeek?.some((day: any) =>
          ['morning', 'noon', 'night'].some((shift) =>
            day[shift]?.some((g: any) => g?.mail)
          )
        ) ||
        originalSchedule.secondWeek?.some((day: any) =>
          ['morning', 'noon', 'night'].some((shift) =>
            day[shift]?.some((g: any) => g?.mail)
          )
        );

      if (hasEmails) {
        try {
          const res = await adminService.convertEmailsToNames(originalSchedule);
          setSchedule(res.schedule);
        } catch (err) {
          console.error('❌ Failed to convert schedule:', err);
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

  const renderWeek = (week: any[] | undefined, title: string) => {
    if (!Array.isArray(week)) {
      return (
        <Typography color="error" sx={{ mt: 2 }}>
          ⚠️ {title} data is missing or invalid.
        </Typography>
      );
    }

    return (
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 24, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">{title}</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {[...Array(7)].map((_, i) => {
              const dayIndex = i + (title === 'Week 2' ? 7 : 0);
              const dayObj = week.find((d) => d.day === dayIndex);

              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      height: '100%',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: dayObj ? alpha(theme.palette.primary.light, 0.05) : 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'medium' }}>
                        {daysMap[i]}
                      </Typography>
                      <Chip 
                        label={`Day ${dayIndex + 1}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {dayObj ? (
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Morning
                          </Typography>
                          <Typography variant="body2">
                            {safeJoin(dayObj.morning)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Noon
                          </Typography>
                          <Typography variant="body2">
                            {safeJoin(dayObj.noon)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            Night
                          </Typography>
                          <Typography variant="body2">
                            {safeJoin(dayObj.night)}
                          </Typography>
                        </Box>
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
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">
              Weekly Schedule
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Schedule ID: {schedule._id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(schedule.createdAt).toLocaleString()}
            </Typography>
          </Box>

          {renderWeek(schedule.firstWeek, 'Week 1')}
          {renderWeek(schedule.secondWeek, 'Week 2')}
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin')}
            >
              Back to Admin Dashboard
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
            <Tooltip title="Print Schedule">
              <IconButton color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </Box>
  );
};

export default ScheduleResultPage;
