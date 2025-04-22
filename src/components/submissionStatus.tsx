import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Fade
} from '@mui/material';
import { adminService } from '../services/api';
import { AccessTime, CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const SubmissionStatus: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await adminService.getSubmissionStatus();
        setIsOpen(result.isOpen);
        setStart(result.scheduleStartDate || null);
        setEnd(result.scheduleEndDate || null);
      } catch (err: any) {
        setError('שגיאה בטעינת סטטוס ההגשה');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const formatDate = (dateStr: string | null): string =>
    dateStr ? format(new Date(dateStr), "d 'ב'MMMM yyyy", { locale: he }) : '';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in>
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
            סטטוס הגשה נוכחי
          </Typography>

          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <Alert
                  severity={isOpen ? 'success' : 'warning'}
                  iconMapping={{
                    success: <CheckCircle fontSize="inherit" />,
                    warning: <Cancel fontSize="inherit" />
                  }}
                >
                  ההגשה כעת <strong>{isOpen ? 'פתוחה' : 'סגורה'}</strong>
                </Alert>
              </Grid>

              {start && end && (
                <Grid item xs={12}>
                  <Typography align="center" sx={{ mt: 1 }}>
                    טווח ההגשה: <strong>{formatDate(start)}</strong> — <strong>{formatDate(end)}</strong>
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default SubmissionStatus;
