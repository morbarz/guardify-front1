import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
  alpha,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { preferencesService, adminService } from '../services/api';

interface ShiftType {
  type: string;
  number: number;
}

interface ShiftPreference {
  day: number;
  shiftIds: boolean[];
}

const CurrentSubmission: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [preferences, setPreferences] = useState<ShiftPreference[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const statusRes = await adminService.getSubmissionStatus();
        setIsOpen(statusRes.isOpen);

        const shiftRes = await axios.get('/users/getAvailableShifts', { withCredentials: true });
        const types: ShiftType[] = shiftRes.data.shiftTypes || [];
        setShiftTypes(types);

        const historyRes = await axios.get('/preferences/my-submissions', { withCredentials: true });
        const latest = historyRes.data?.history?.[0];

        const copied = localStorage.getItem('copiedSubmission');
        if (!latest && copied) {
          const parsed = JSON.parse(copied);
          setPreferences(parsed.map((day: number[], i: number) => ({
            day: i + 1,
            shiftIds: day.map((v) => v === 1)
          })));
          localStorage.removeItem('copiedSubmission');
          return;
        }

        if (statusRes.isOpen && latest?.schedule) {
          setPreferences(
            latest.schedule.map((day: number[], i: number) => ({
              day: i + 1,
              shiftIds: day.map((v) => v === 1)
            }))
          );
          setSubmissionId(latest.id);
          setUpdating(true);
        } else {
          const empty = Array.from({ length: 14 }, (_, i) => ({
            day: i + 1,
            shiftIds: Array(types.length).fill(false)
          }));
          setPreferences(empty);
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to load submission data.' });
      }
    };

    loadData();
  }, []);

  const toggleShift = (day: number, index: number) => {
    setPreferences((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              shiftIds: entry.shiftIds.map((v, i) => (i === index ? !v : v))
            }
          : entry
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const formatted = preferences.map((day) => ({
        day: day.day,
        shiftIds: updating
          ? day.shiftIds.map((v) => (v ? 1 : 0))
          : day.shiftIds.map((v) => (v ? '1' : '0'))
      }));
  
      if (updating) {
        await preferencesService.updatePreference(submissionId!, formatted as { day: number; shiftIds: number[] }[]);
        setMessage({ type: 'success', text: 'Preferences updated successfully.' });
      } else {
        await preferencesService.submitPreferences(formatted as { day: number; shiftIds: string[] }[]);
        setMessage({ type: 'success', text: 'Preferences submitted successfully.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' });
    }
  };

  const handleDelete = async () => {
    try {
      await preferencesService.deletePreference(submissionId!);
      setMessage({ type: 'success', text: 'Submission deleted successfully.' });
      setPreferences((prev) =>
        prev.map(p => ({ ...p, shiftIds: p.shiftIds.map(() => false) }))
      );
      setSubmissionId(null);
      setUpdating(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed.' });
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[(dayNumber - 1) % 7];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">
              {updating ? 'Edit Your Submitted Preferences' : 'Submit Your Shift Preferences'}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          
          {message && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          {!isOpen ? (
            <Alert severity="info">Submission period is currently closed.</Alert>
          ) : (
            <Box>
              {/* Week 1 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Week 1
                </Typography>
                <Grid container spacing={3}>
                  {preferences.slice(0, 7).map((dayPref) => (
                    <Grid item xs={12} sm={6} md={4} key={dayPref.day}>
                      <Card 
                        elevation={2}
                        sx={{
                          height: '100%',
                          bgcolor: dayPref.shiftIds.some(v => v) 
                            ? alpha(theme.palette.primary.light, 0.1)
                            : 'background.paper'
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
                                    size="small"
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2">{shift.type}</Typography>
                                  </Box>
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

              <Divider sx={{ my: 4 }}>
                <Chip label="Week 2" color="primary" />
              </Divider>

              {/* Week 2 */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Week 2
                </Typography>
                <Grid container spacing={3}>
                  {preferences.slice(7, 14).map((dayPref) => (
                    <Grid item xs={12} sm={6} md={4} key={dayPref.day}>
                      <Card 
                        elevation={2}
                        sx={{
                          height: '100%',
                          bgcolor: dayPref.shiftIds.some(v => v) 
                            ? alpha(theme.palette.primary.light, 0.1)
                            : 'background.paper'
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
                                    size="small"
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                                    <Typography variant="body2">{shift.type}</Typography>
                                  </Box>
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
            </Box>
          )}
        </CardContent>
        
        {isOpen && (
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                sx={{ flex: 1 }}
              >
                {updating ? 'Update' : 'Submit'}
              </Button>
              
              {updating && (
                <Tooltip title="Delete this submission">
                  <IconButton
                    color="error"
                    onClick={handleDelete}
                    sx={{ border: `1px solid ${theme.palette.error.main}` }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </CardActions>
        )}
      </Card>
    </Box>
  );
};

export default CurrentSubmission;
