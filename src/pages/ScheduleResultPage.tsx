import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import { adminService } from '../services/api';

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

  // בעת טעינת הקומפוננטה – נשלח לשרת להמרה אם צריך
  useEffect(() => {
    const processSchedule = async () => {
      if (!originalSchedule) {
        setLoading(false);
        return;
      }

      // בדיקה אם יש צורך להמיר
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
          setSchedule(originalSchedule); // fallback
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
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Loading schedule...</Typography>
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
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>{title}</Typography>
        <Grid container spacing={2}>
          {[...Array(7)].map((_, i) => {
            const dayIndex = i + (title === 'Week 2' ? 7 : 0);
            const dayObj = week.find((d) => d.day === dayIndex);

            return (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {daysMap[i]}
                  </Typography>

                  {dayObj ? (
                    <>
                      <Typography><strong>Morning:</strong> {safeJoin(dayObj.morning)}</Typography>
                      <Typography><strong>Noon:</strong> {safeJoin(dayObj.noon)}</Typography>
                      <Typography><strong>Night:</strong> {safeJoin(dayObj.night)}</Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">No shifts</Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🗓️ Weekly Schedule Created
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Schedule ID: {schedule._id}
      </Typography>

      {renderWeek(schedule.firstWeek, 'Week 1')}
      {renderWeek(schedule.secondWeek, 'Week 2')}

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/admin')}>
          ← Back to Admin Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default ScheduleResultPage;
