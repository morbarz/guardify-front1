import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { adminService } from '../services/api';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface UnassignedUser {
  id: string;
  name: string;
  email: string;
  preferences?: number[][];
}

// Helper function to get shift preferences for a specific day
const getShiftPreferences = (preferences: number[][] | undefined): { morning: boolean, noon: boolean, night: boolean }[] => {
  if (!preferences || !Array.isArray(preferences)) return [];
  
  return preferences.map(day => ({
    morning: day[0] === 1,
    noon: day[1] === 1,
    night: day[2] === 1
  }));
};

// Helper function to count total preferred shifts
const countPreferredShifts = (preferences: { morning: boolean, noon: boolean, night: boolean }[]) => {
  return preferences.reduce((acc, day) => {
    return acc + (day.morning ? 1 : 0) + (day.noon ? 1 : 0) + (day.night ? 1 : 0);
  }, 0);
};

const ManualScheduleAdjustment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [schedule, setSchedule] = useState<any>(null);
  const [unassignedUsers, setUnassignedUsers] = useState<UnassignedUser[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSchedule = async () => {
      try {
        const scheduleData = location.state?.schedule;
        if (!scheduleData) {
          setLoading(false);
          return;
        }

        // Ensure schedule has proper structure
        const processedSchedule = {
          ...scheduleData,
          firstWeek: scheduleData.firstWeek || Array(7).fill({ morning: [], noon: [], night: [] }),
          secondWeek: scheduleData.secondWeek || Array(7).fill({ morning: [], noon: [], night: [] })
        };

        setSchedule(processedSchedule);

        // Fetch unassigned users
        if (processedSchedule._id) {
          const response = await adminService.getUnassignedUsers(processedSchedule._id);
          setUnassignedUsers(response.users || []);
        }
      } catch (error) {
        console.error('Failed to initialize schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSchedule();
  }, [location.state]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Handle drag from unassigned list to schedule
    if (source.droppableId === 'unassigned-users' && destination.droppableId.includes('shift-')) {
      const [day, shift] = destination.droppableId.split('shift-')[1].split('-');
      const user = unassignedUsers[source.index];
      
      // Update schedule
      const newSchedule = { ...schedule };
      const weekType = parseInt(day) <= 7 ? 'firstWeek' : 'secondWeek';
      const dayIndex = parseInt(day) <= 7 ? parseInt(day) - 1 : parseInt(day) - 8;
      
      if (!newSchedule[weekType][dayIndex][shift]) {
        newSchedule[weekType][dayIndex][shift] = [];
      }
      
      // Add user to shift with all necessary information
      newSchedule[weekType][dayIndex][shift].push({
        id: user.id,
        name: user.name,
        mail: user.email,
        fullName: user.name
      });

      // Remove from unassigned users
      const newUnassignedUsers = [...unassignedUsers];
      newUnassignedUsers.splice(source.index, 1);

      setSchedule(newSchedule);
      setUnassignedUsers(newUnassignedUsers);
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveUser = (weekType: string, dayIndex: number, shift: string, userIndex: number) => {
    const newSchedule = { ...schedule };
    const removedAssignment = newSchedule[weekType][dayIndex][shift][userIndex];
    newSchedule[weekType][dayIndex][shift].splice(userIndex, 1);
    
    // Convert the removed assignment back to unassigned user format
    const removedUser = {
      id: removedAssignment.id || `temp-${Date.now()}`,
      name: removedAssignment.name || removedAssignment.fullName || 'Unknown',
      email: removedAssignment.mail || removedAssignment.email || ''
    };
    
    setUnassignedUsers([...unassignedUsers, removedUser]);
    setSchedule(newSchedule);
    setHasUnsavedChanges(true);
  };

  const handleSaveSchedule = async () => {
    try {
      await adminService.updateScheduleWithManualAssignments(schedule._id, {
        schedule,
        unassignedUsers
      });
      setHasUnsavedChanges(false);
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const renderShift = (weekType: string, dayIndex: number, shift: string, assignments: any[] = []) => (
    <Droppable droppableId={`shift-${dayIndex + 1}-${shift}`}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: snapshot.isDraggingOver
              ? alpha(theme.palette.primary.main, 0.1)
              : 'transparent',
            border: `1px dashed ${snapshot.isDraggingOver
              ? theme.palette.primary.main
              : theme.palette.divider}`
          }}
        >
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
              {shift.charAt(0).toUpperCase() + shift.slice(1)}
            </Typography>
            {assignments.map((assignment, index) => {
              // Get the display name from the assignment
              const displayName = typeof assignment === 'string' 
                ? assignment 
                : assignment?.name || assignment?.fullName || assignment?.mail || 'Unknown';

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }}
                >
                  <Typography variant="body2">{displayName}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveUser(weekType, dayIndex, shift, index)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
            {provided.placeholder}
          </Stack>
        </Box>
      )}
    </Droppable>
  );

  const renderWeek = (week: any[] = [], weekType: string, title: string) => (
    <Card elevation={2} sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarMonthIcon sx={{ fontSize: 24, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5">{title}</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {(week || []).map((day, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.primary.light, 0.05)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'medium' }}>
                    {daysMap[day?.day % 7 || index]}
                  </Typography>
                  <Chip
                    label={`Day ${(day?.day || index) + 1}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Stack spacing={2}>
                  {renderShift(weekType, index, 'morning', day?.morning || [])}
                  {renderShift(weekType, index, 'noon', day?.noon || [])}
                  {renderShift(weekType, index, 'night', day?.night || [])}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderShiftPreferenceIcons = (user: UnassignedUser) => {
    const dayPreferences = getShiftPreferences(user.preferences);
    const totalPreferences = countPreferredShifts(dayPreferences);
    
    // If no preferences are set, show all shifts as available
    if (totalPreferences === 0) {
      return (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Available for Morning Shifts">
            <WbSunnyIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
          </Tooltip>
          <Tooltip title="Available for Noon Shifts">
            <WbTwilightIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
          </Tooltip>
          <Tooltip title="Available for Night Shifts">
            <DarkModeIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </Tooltip>
        </Stack>
      );
    }

    // Count preferences for each shift type
    const shiftCounts = dayPreferences.reduce(
      (acc, day) => ({
        morning: acc.morning + (day.morning ? 1 : 0),
        noon: acc.noon + (day.noon ? 1 : 0),
        night: acc.night + (day.night ? 1 : 0)
      }),
      { morning: 0, noon: 0, night: 0 }
    );

    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {shiftCounts.morning > 0 && (
          <Tooltip title={`Prefers ${shiftCounts.morning} Morning Shifts`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WbSunnyIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{shiftCounts.morning}</Typography>
            </Box>
          </Tooltip>
        )}
        {shiftCounts.noon > 0 && (
          <Tooltip title={`Prefers ${shiftCounts.noon} Noon Shifts`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WbTwilightIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{shiftCounts.noon}</Typography>
            </Box>
          </Tooltip>
        )}
        {shiftCounts.night > 0 && (
          <Tooltip title={`Prefers ${shiftCounts.night} Night Shifts`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DarkModeIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>{shiftCounts.night}</Typography>
            </Box>
          </Tooltip>
        )}
      </Stack>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>No Schedule Data</AlertTitle>
          No schedule data was provided for adjustment.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/schedules')}
          sx={{ mt: 2 }}
        >
          Return to Schedules
        </Button>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h5">Manual Schedule Adjustment</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/admin/schedules')}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSchedule}
                  disabled={!hasUnsavedChanges}
                >
                  Save Changes
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={9}>
                {renderWeek(schedule?.firstWeek || [], 'firstWeek', 'Week 1')}
                {renderWeek(schedule?.secondWeek || [], 'secondWeek', 'Week 2')}
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card variant="outlined" sx={{ position: 'sticky', top: 24 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Unassigned Users ({unassignedUsers?.length || 0})
                    </Typography>
                    <Droppable droppableId="unassigned-users">
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          variant="outlined"
                          sx={{
                            p: 1,
                            bgcolor: snapshot.isDraggingOver
                              ? alpha(theme.palette.primary.main, 0.1)
                              : 'transparent'
                          }}
                        >
                          <List dense>
                            {(unassignedUsers || []).map((user, index) => (
                              <Draggable
                                key={user.id}
                                draggableId={user.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      mb: 1,
                                      borderRadius: 1,
                                      bgcolor: snapshot.isDragging
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.background.default, 0.6),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                                      }
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <Typography variant="body2" fontWeight="medium">
                                            {user.name}
                                          </Typography>
                                          {renderShiftPreferenceIcons(user)}
                                        </Box>
                                      }
                                      secondary={user.email}
                                      secondaryTypographyProps={{
                                        variant: 'caption'
                                      }}
                                    />
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </List>
                        </Paper>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DragDropContext>
  );
};

export default ManualScheduleAdjustment; 