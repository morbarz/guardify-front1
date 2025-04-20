import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  Divider,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  alpha,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

interface ShiftType {
  type: string;
  number: number;
}

const SubmissionHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const statusRes = await adminService.getSubmissionStatus();
        setIsOpen(statusRes.isOpen);

        const res = await axios.get('/preferences/my-submissions', { withCredentials: true });
        setHistory(res.data?.history || []);

        const shiftRes = await axios.get('/users/getAvailableShifts', { withCredentials: true });
        setShiftTypes(shiftRes.data.shiftTypes || []);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };

    fetchHistory();
  }, []);

  const handleCopy = (index: number) => {
    const selected = history[index]?.schedule;
    if (!selected) return;

    localStorage.setItem('copiedSubmission', JSON.stringify(selected));
    navigate('/submit/current');
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
              Submission History
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          {history.length === 0 ? (
            <Alert severity="info">No previous submissions found.</Alert>
          ) : (
            <Stack spacing={3}>
              {history.map((entry, i) => (
                <Card key={i} elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          Submission #{history.length - i}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {new Date(entry.submittedAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title={expandedIndex === i ? "Collapse" : "Expand"}>
                          <IconButton onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                            {expandedIndex === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Tooltip>
                        {isOpen && (
                          <Tooltip title="Copy to Edit">
                            <IconButton 
                              onClick={() => handleCopy(i)}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Collapse in={expandedIndex === i}>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        {entry.schedule.map((day: number[], index: number) => {
                          const selectedShifts = day
                            .map((v, j) => (v === 1 ? shiftTypes[j]?.type : null))
                            .filter(Boolean);
                          
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 2,
                                  bgcolor: selectedShifts.length > 0 
                                    ? alpha(theme.palette.primary.light, 0.1)
                                    : 'background.paper',
                                  border: `1px solid ${theme.palette.divider}`
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                    {getDayName(index + 1)}
                                  </Typography>
                                  <Chip 
                                    label={`Day ${index + 1}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedShifts.length > 0 
                                    ? selectedShifts.join(', ')
                                    : 'No shifts selected'}
                                </Typography>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmissionHistory;
