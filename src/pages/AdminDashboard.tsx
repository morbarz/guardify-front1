import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserRoleManager from '../components/UserRoleManager';
import SubmissionStatus from '../components/SubmissionStatus';
import AdminPreferenceList from '../components/AdminPreferenceList';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // גישה למנהלים בלבד
  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          גישה נדחתה: למנהלים בלבד.
        </Typography>
      </Box>
    );
  }

  // יצירת סידור חדש
  const handleCreateSchedule = async () => {
    setLoading(true);
    try {
      const res = await adminService.createSchedule();

      if (res.success && res.schedule) {
        navigate(`/admin/schedule/${res.scheduleId}`, {
          state: { schedule: res.schedule },
        });
      } else {
        alert('נכשל ביצירת הסידור: ' + res.message);
      }
    } catch (error) {
      console.error('נכשל בייצור הסידור:', error);
      alert('נכשל בייצור הסידור.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        לוח בקרה למנהל
      </Typography>

      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 4 }}>
        ברוך הבא, {user.name}!
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                סטטוס הגשות
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SubmissionStatus />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                יצירת סידור חדש
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>
                לחץ כאן ליצירת סידור שבועי חדש
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateSchedule}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'צור סידור שבועי חדש'
                )}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                העדפות שהוגשו
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <AdminPreferenceList />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
