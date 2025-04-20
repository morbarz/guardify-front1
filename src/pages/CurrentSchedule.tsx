// CurrentSchedule.tsx

import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ScheduleSkeleton } from '../components/skeletons/ScheduleSkeleton';
import { Schedule } from '../types/models';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Button,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

const CurrentSchedule: React.FC = () => {
  const theme = useTheme();
  const [schedule, setSchedule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleViewSchedule = async () => {
    try {
      const result = await adminService.getLastSubmittedSchedule();
      console.log(result)
      if (result.success && result.schedule) {
        navigate('/schedule/', { state: { schedule: result.schedule } });
      } else {
        setError(result.message || 'Failed to load schedule');
      }
    } catch (err) {
      console.error('❌ Failed to load schedule:', err);
      setError('Failed to load schedule');
    }
  };

  useEffect(() => {
    const fetchLastSubmittedSchedule = async () => {
      try {
        setLoading(true);
        console.log('Fetching last submitted schedule...');
        const result = await adminService.getLastSubmittedSchedule();
        console.log('Schedule result:', result);
        
        if (result.success && result.schedule) {
          setSchedule(result.schedule);
        } else {
          setError(result.message || 'No schedule found');
        }
      } catch (err) {
        console.error('❌ Failed to load schedule:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchLastSubmittedSchedule();
  }, []);

  if (loading) {
    return <ScheduleSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<ErrorOutlineIcon />}>
          <AlertTitle>Error Loading Schedule</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No schedule data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">Current Schedule</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {schedule._id}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(schedule.createdAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.status}
                      size="small"
                      sx={{
                        color: theme.palette.success.main,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        textTransform: 'capitalize'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Schedule">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleViewSchedule}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Schedule">
                        <IconButton size="small" color="primary">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CurrentSchedule;