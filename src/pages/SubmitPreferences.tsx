import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import { preferencesService, adminService } from '../services/api';
import axios from 'axios';
import { useApi } from '../hooks/useApi';
import { ShiftPreferenceSkeleton } from '../components/skeletons/ShiftPreferenceSkeleton';
import { ShiftPreference } from '../types/models';
import { useForm } from '../hooks/useForm';
import { shiftPreferenceSchema } from '../utils/validationSchemas';

interface ShiftType {
  type: string;
  number: number;
}

interface ShiftPreference {
  day: number;
  shiftIds: boolean[];
}

const SubmitPreferences: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [preferences, setPreferences] = useState<ShiftPreference[]>([]);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { state: apiState, execute } = useApi<ShiftPreference[]>();
  const theme = useTheme();
  const { state: formState, handleChange, handleBlur, handleSubmit } = useForm(
    {
      date: '',
      shiftType: '',
      preference: '',
      notes: '',
    },
    shiftPreferenceSchema
  );

  // Load user data and preferences on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const statusRes = await adminService.getSubmissionStatus();
        setIsOpen(statusRes.isOpen);

        const shiftRes = await axios.get('/users/getAvailableShifts', { withCredentials: true });
        const types: ShiftType[] = shiftRes.data.shiftTypes;
        setShiftTypes(types);

        const historyRes = await axios.get('/preferences/my-submissions', { withCredentials: true });
        const submissionHistory = historyRes.data?.history ?? [];
        setHistory(submissionHistory);

        if (statusRes.isOpen && submissionHistory.length > 0) {
          const latest = submissionHistory[0];
          if (latest?.schedule) {
            setPreferences(
              latest.schedule.map((day: number[], i: number) => ({
                day: i + 1,
                shiftIds: day.map((v) => v === 1)
              }))
            );
            setSubmissionId(latest.id);
            setUpdating(true);
            return;
          }
        }

        // If no existing submission, create empty preferences
        const initialPrefs: ShiftPreference[] = Array.from({ length: 14 }, (_, i) => ({
          day: i + 1,
          shiftIds: Array(types.length).fill(false)
        }));
        setPreferences(initialPrefs);

      } catch (err: any) {
        setMessage({ type: 'error', text: 'Error loading data.' });
      }
    };

    loadData();
  }, []);

  // Toggle a specific checkbox in preferences
  const toggleShift = (day: number, index: number) => {
    setPreferences((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? { ...entry, shiftIds: entry.shiftIds.map((v, i) => (i === index ? !v : v)) }
          : entry
      )
    );
  };

  const handleSave = async () => {
    try {
      const formatted = preferences.map((day) => ({
        day: day.day,
        shiftIds: day.shiftIds.map((v) => v ? '1' : '0')
      }));
  
      await preferencesService.submitPreferences(formatted);
      setMessage({ type: 'success', text: 'Preferences submitted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed.' });
    }
  };
  


  // Update existing preferences
  const handleUpdate = async () => {
    try {
      if (!submissionId) {
        setMessage({ type: 'error', text: 'Cannot update – no submission ID found.' });
        return;
      }

      const formatted = preferences.map((day) => ({
        day: day.day,
        shiftIds: day.shiftIds.map((v) => (v ? 1 : 0))
      }));

      await preferencesService.updatePreference(submissionId, formatted);
      setMessage({ type: 'success', text: 'Preferences updated.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Update failed.' });
    }
  };

  // Delete current submission
  const handleDelete = async () => {
    try {
      if (!submissionId) {
        setMessage({ type: 'error', text: 'No submission to delete.' });
        return;
      }

      await preferencesService.deletePreference(submissionId);
      setMessage({ type: 'success', text: 'Submission deleted successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed.' });
    }
  };

  // Copy a previous submission into the current state
  const handleCopy = (index: number) => {
    const copy = history[index]?.schedule;
    if (copy) {
      const newPrefs = copy.map((day: number[], i: number) => ({
        day: i + 1,
        shiftIds: day.map((v) => v === 1)
      }));
      setPreferences(newPrefs);
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[(dayNumber - 1) % 7];
  };

  const getWeekNumber = (dayNumber: number) => {
    return dayNumber <= 7 ? 1 : 2;
  };

  if (apiState.loading) {
    return <ShiftPreferenceSkeleton />;
  }

  if (apiState.error) {
    return <div>Error: {apiState.error}</div>;
  }

  const onSubmit = async (values: typeof formState.values) => {
    await execute({
      url: '/api/shift-preferences',
      method: 'POST',
      data: values,
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">
              {updating ? 'Edit Your Submitted Preferences' : 'Submit Your Shift Preferences'}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

          {!isOpen ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Submission period is currently closed.
            </Alert>
          ) : (
            <Box>
              {[1, 2].map((weekNum) => (
                <Box key={weekNum} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    Week {weekNum}
                  </Typography>
                  <Grid container spacing={3}>
                    {preferences
                      .filter((pref) => getWeekNumber(pref.day) === weekNum)
                      .map((dayPref) => (
                        <Grid item xs={12} sm={6} md={4} key={dayPref.day}>
                          <Card
                            elevation={2}
                            sx={{
                              height: '100%',
                              bgcolor: dayPref.shiftIds.some(v => v)
                                ? alpha(theme.palette.primary.light, 0.1)
                                : 'background.paper',
                              transition: 'background-color 0.3s'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ flex: 1 }}>
                                  {getDayName(dayPref.day)}
                                </Typography>
                                <Chip
                                  label={`Day ${dayPref.day}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                              <Stack spacing={1}>
                                {shiftTypes.map((shift, index) => (
                                  <FormControlLabel
                                    key={shift.number}
                                    control={
                                      <Checkbox
                                        checked={dayPref.shiftIds[index]}
                                        onChange={() => toggleShift(dayPref.day, index)}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: dayPref.shiftIds[index]
                                            ? theme.palette.primary.main
                                            : 'text.primary'
                                        }}
                                      >
                                        {shift.type}
                                      </Typography>
                                    }
                                  />
                                ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {updating ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      startIcon={<SaveIcon />}
                      sx={{ mr: 2 }}
                    >
                      Update Preferences
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDelete}
                      startIcon={<DeleteIcon />}
                    >
                      Delete Submission
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                  >
                    Submit Preferences
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Previous Submissions
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {history.map((entry, i) => (
            <Paper key={i} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted: {new Date(entry.submittedAt).toLocaleString()}
                </Typography>
                <Box>
                  <Tooltip title="Expand/Collapse">
                    <IconButton onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                      {expandedIndex === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy this submission">
                    <IconButton onClick={() => handleCopy(i)} color="primary">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Collapse in={expandedIndex === i}>
                <Box sx={{ mt: 2 }}>
                  {entry.schedule.map((day: number[], index: number) => {
                    const selectedShifts = day
                      .map((v, j) => (v === 1 ? shiftTypes[j]?.type : null))
                      .filter(Boolean);

                    return (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <strong>{getDayName(index + 1)}</strong>
                          {selectedShifts.length > 0 ? (
                            <Box sx={{ ml: 2 }}>
                              {selectedShifts.map((shift, idx) => (
                                <Chip
                                  key={idx}
                                  label={shift}
                                  size="small"
                                  sx={{ mr: 0.5 }}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              No shifts selected
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmitPreferences;
