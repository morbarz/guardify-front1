import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { format } from 'date-fns';
import { adminService } from '../services/api';

const SubmissionForm: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [startDateConfig, setStartDateConfig] = useState<string | null>(null);
  const [endDateConfig, setEndDateConfig] = useState<string | null>(null);

  const calculateEndDate = (start: Date): string => {
    const date = new Date(start);
    date.setDate(date.getDate() + 13);
    return date.toISOString().split('T')[0];
  };

  const formatDateHebrew = (dateStr: string | null): string =>
    dateStr ? format(new Date(dateStr), "d 'ב'MMMM yyyy", { locale: he }) : '';

  const disableNonSundays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
    
    // Get the day number and ensure we're working with local time
    const localDate = new Date(date);
    const dayNumber = localDate.getDay();
    
    // For debugging
    console.log('Checking date:', localDate.toISOString(), 'Day:', dayNumber);
    
    return dayNumber !== 0 || date < today;
  };

  const getDaysLeft = (): string | null => {
    if (!endDateConfig || !isOpen) return null;

    const now = new Date();
    const end = new Date(endDateConfig);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'תקופת ההגשה הסתיימה';
    if (diffDays === 0) return 'היום הוא היום האחרון להגשה!';
    if (diffDays === 1) return 'נותר עוד יום אחד להגשה';

    return `נותרו עוד ${diffDays} ימים להגשה`;
  };

  const fetchStatus = useCallback(async () => {
    try {
      const response = await adminService.getSubmissionStatus();
      setIsOpen(response.isOpen);
      setStartDateConfig(response.scheduleStartDate || null);
      setEndDateConfig(response.scheduleEndDate || null);
    } catch {
      setError('שגיאה בטעינת סטטוס ההגשה');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleOpen = async () => {
    setError('');
    setSuccess('');

    if (!startDate) {
      setError('יש לבחור תאריך התחלה');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setError('יש לבחור תאריך עתידי בלבד');
      return;
    }

    const dayNumber = startDate.getDay();
    console.log('Selected date:', startDate, 'Day number:', dayNumber);
    
    if (dayNumber !== 0) {
      setError('יש לבחור תאריך שהוא יום ראשון בלבד');
      return;
    }

    if (isOpen) {
      setError('תקופת ההגשה כבר פתוחה');
      return;
    }

    // Format dates ensuring they're in local timezone
    const startStr = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    
    // Calculate end date in local timezone
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    const endStr = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];

    try {
      console.log('Sending dates to backend:', { startStr, endStr });
      await adminService.toggleSubmissionPeriod(true, startStr, endStr);
      setStartDate(null);
      await fetchStatus();
      setSuccess(`ההגשה נפתחה מ־${formatDateHebrew(startStr)} ועד ${formatDateHebrew(endStr)}`);
    } catch (err: any) {
      console.error('Submission toggle error:', err);
      setError(err.message || 'שגיאה בפתיחת ההגשה');
    }
  };

  const handleClose = async () => {
    setError('');
    setSuccess('');

    try {
      await adminService.toggleSubmissionPeriod(false);
      await fetchStatus(); // רענון סטטוס
      setSuccess('תקופת ההגשה נסגרה בהצלחה.');
    } catch (err: any) {
      setError(err.message || 'שגיאה בסגירת ההגשה');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          ניהול תקופת הגשת משמרות
        </Typography>

        {isOpen !== null && (
          <Alert severity={isOpen ? 'success' : 'info'} sx={{ mb: 2 }}>
            ההגשה כעת <strong>{isOpen ? 'פתוחה' : 'סגורה'}</strong>
          </Alert>
        )}

        {startDateConfig && endDateConfig && (
          <Typography align="center" sx={{ mb: 2 }}>
            טווח ההגשה הנוכחי: <strong>{formatDateHebrew(startDateConfig)}</strong> - <strong>{formatDateHebrew(endDateConfig)}</strong>
          </Typography>
        )}

        {isOpen && getDaysLeft() && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {getDaysLeft()}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
          <DatePicker
            label="בחר תאריך התחלה (רק יום ראשון)"
            value={startDate}
            onChange={(newDate) => setStartDate(newDate)}
            shouldDisableDate={disableNonSundays}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
        </LocalizationProvider>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleOpen}
            >
              פתח תקופת הגשה
            </Button>
          </Grid>

          {isOpen && (
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleClose}
              >
                סגור תקופת הגשה
              </Button>
            </Grid>
          )}
        </Grid>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
