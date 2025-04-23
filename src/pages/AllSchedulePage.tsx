import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { adminService } from '../services/api';
import { GeneratedSchedule } from '../types/models';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AllSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<GeneratedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<GeneratedSchedule | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllGeneratedSchedules();
      if (response.success && response.data?.schedules) {
        setSchedules(response.data.schedules);
        setError(null);
      } else {
        setSchedules([]);
        setError(response.message || 'Failed to fetch schedules');
      }
    } catch (err) {
      console.error('❌ Failed to fetch schedules:', err);
      setSchedules([]);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (schedule: GeneratedSchedule) => {
    navigate(`/admin/schedule/${schedule._id}`, { state: { schedule } });
  };

  const handleEditSchedule = (schedule: GeneratedSchedule) => {
    navigate(`/admin/schedule/${schedule._id}/edit`, { state: { schedule } });
  };

  const handleDeleteClick = (schedule: GeneratedSchedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;

    try {
      setLoading(true);
      const response = await adminService.deleteSchedule(scheduleToDelete._id);
      if (response.success) {
        await fetchSchedules();
        setError(null);
      } else {
        setError(response.message || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('❌ Failed to delete schedule:', err);
      setError('Failed to delete schedule');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const handleCreateSchedule = async () => {
    try {
      setLoading(true);
      const response = await adminService.createSchedule();
      if (response.success) {
        await fetchSchedules();
        navigate(`/admin/schedule/${response.scheduleId}`, {
          state: { schedule: response.schedule }
        });
      } else {
        setError(response.message || 'Failed to create schedule');
      }
    } catch (err) {
      console.error('❌ Failed to create schedule:', err);
      setError('Failed to create new schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1)
        };
      case 'final':
        return {
          color: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1)
        };
      default:
        return {
          color: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1)
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            סידורי עבודה
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
            disabled={loading}
          >
            צור סידור חדש
          </Button>
        </Box>
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          סידורי עבודה
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateSchedule}
          disabled={loading}
        >
          צור סידור חדש
        </Button>
      </Box>

      {schedules.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          לא נמצאו סידורי עבודה
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {schedules.map((schedule) => (
            <Grid item xs={12} md={6} lg={4} key={schedule._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      {format(new Date(schedule.startDate), 'dd/MM/yyyy', { locale: he })} -
                      {format(new Date(schedule.endDate), 'dd/MM/yyyy', { locale: he })}
                    </Typography>
                    <Chip
                      label={schedule.status === 'draft' ? 'טיוטה' : 'סופי'}
                      size="small"
                      sx={getStatusColor(schedule.status)}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    נוצר: {format(new Date(schedule.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Tooltip title="צפה בסידור">
                      <IconButton
                        onClick={() => handleViewSchedule(schedule)}
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ערוך סידור">
                      <IconButton
                        onClick={() => handleEditSchedule(schedule)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק סידור">
                      <IconButton
                        onClick={() => handleDeleteClick(schedule)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          מחיקת סידור עבודה
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            האם אתה בטוח שברצונך למחוק את סידור העבודה הזה? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllSchedulesPage; 