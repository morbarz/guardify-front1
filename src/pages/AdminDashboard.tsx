import React, { useState, useEffect } from 'react';
import { scheduleService, adminService } from '../services/api';
import { Schedule } from '../types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
//import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [draftSchedule, setDraftSchedule] = useState<Schedule | null>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current schedule
        const scheduleResponse = await scheduleService.getCurrentSchedule();
        if (scheduleResponse.success && scheduleResponse.data) {
          setCurrentSchedule(scheduleResponse.data);
        }
        
        // Fetch draft schedule
        const draftResponse = await scheduleService.getDraftSchedule();
        if (draftResponse.success && draftResponse.data) {
          setDraftSchedule(draftResponse.data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleGenerateSchedule = async () => {
    try {
      setGenerating(true);
      const response = await adminService.generateSchedule();
      if (response.success && response.data) {
        setDraftSchedule(response.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate schedule';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSubmission = async () => {
    try {
      const newState = !isSubmissionOpen;
      const response = await adminService.toggleSubmissionPeriod(newState);
      if (response.success) {
        setIsSubmissionOpen(newState);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle submission period';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submission Period
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isSubmissionOpen}
                  onChange={handleToggleSubmission}
                  color="primary"
                />
              }
              label={isSubmissionOpen ? "Open for submissions" : "Closed for submissions"}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Schedule
            </Typography>
            {currentSchedule ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Schedule from 
                </Typography>
                <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                  View Full Schedule
                </Button>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No current schedule available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Draft Schedule
            </Typography>
            {draftSchedule ? (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Draft schedule from 
                </Typography>
                <Button variant="outlined" color="primary" sx={{ mt: 2, mr: 1 }}>
                  View Draft
                </Button>
                <Button variant="contained" color="success" sx={{ mt: 2 }}>
                  Publish
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No draft schedule available
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={handleGenerateSchedule}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Schedule'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;