import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const AllSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await adminService.getAllGeneratedSchedules();
        if (res.success) {
          setSchedules(res.schedules);
        }
      } catch (err) {
        console.error('❌ Failed to load schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1)
        };
      case 'published':
        return {
          color: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1)
        };
      case 'archived':
        return {
          color: theme.palette.text.secondary,
          backgroundColor: alpha(theme.palette.text.secondary, 0.1)
        };
      default:
        return {
          color: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1)
        };
    }
  };

  const handleManualAdjust = (schedule: any) => {
    navigate(`/admin/schedule/${schedule._id}/adjust`, {
      state: { schedule }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">
              All Generated Schedules
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Schedule Period</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => {
                  const statusStyle = getStatusColor(schedule.status);
                  return (
                    <TableRow 
                      key={schedule._id}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
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
                            color: statusStyle.color,
                            bgcolor: statusStyle.backgroundColor,
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
                              onClick={() =>
                                navigate(`/admin/schedule/${schedule._id}`, {
                                  state: { schedule },
                                })
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manual Adjustment">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleManualAdjust(schedule)}
                            >
                              <PeopleAltIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Schedule">
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Schedule">
                            <IconButton size="small" color="primary">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Schedule">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AllSchedulesPage;
