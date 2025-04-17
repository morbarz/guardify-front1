import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Alert, Typography } from '@mui/material';
import { adminService } from '../services/api';

const SubmissionForm: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [startDateConfig, setStartDateConfig] = useState<string | null>(null);
  const [endDateConfig, setEndDateConfig] = useState<string | null>(null);
  
  // Calculate end date (14-day period total → +13 days)
  const calculateEndDate = (start: string): string => {
    const date = new Date(start);
    date.setDate(date.getDate() + 13);
    return date.toISOString().split('T')[0];
  };

  // Fetch current submission status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await adminService.getSubmissionStatus();
        setIsOpen(response.isOpen);
        setStartDateConfig(response.scheduleStartDate || null);
        setEndDateConfig(response.scheduleEndDate || null);
      } catch {
        setError('Failed to load submission status');
      }
    };
    fetchStatus();
  }, []);

  // Open submission period
  const handleOpen = async () => {
    setError('');
    setSuccess('');

    if (!startDate) {
      setError('Start date is required');
      return;
    }

    if (isOpen) {
      setError('Submission is already open');
      return;
    }

    const endDate = calculateEndDate(startDate);

    try {
      await adminService.toggleSubmissionPeriod(true, startDate, endDate);
      setIsOpen(true);
      setSuccess(`Submission opened from ${startDate} to ${endDate}`);
    } catch (err: any) {
      setError(err.message || 'Failed to open submission');
    }
  };

  // Close submission period
  const handleClose = async () => {
    setError('');
    setSuccess('');
    try {
      await adminService.toggleSubmissionPeriod(false);
      setIsOpen(false);
      setSuccess('Submission period closed.');
    } catch (err: any) {
      setError(err.message || 'Failed to close submission');
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shift Submission Management
      </Typography>

      {/* Display current submission status */}
      {isOpen !== null && (
        <Alert severity={isOpen ? 'success' : 'info'} sx={{ mb: 2 }}>
          Submission is currently <strong>{isOpen ? 'OPEN' : 'CLOSED'}</strong>
        </Alert>
      )}
      {startDateConfig && endDateConfig && (
    <Typography variant="body2" sx={{ mb: 2 }}>
        Submission dates: <strong>{startDateConfig}</strong> to <strong>{endDateConfig}</strong>
    </Typography>
    )}


      {/* Input start date for opening submission */}
      <TextField
        label="Start Date"
        type="date"
        fullWidth
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      {/* Buttons: open and close */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleOpen}>
          Open Submission
        </Button>

        {isOpen && (
          <Button variant="contained" color="error" onClick={handleClose}>
            Close Submission
          </Button>
        )}
      </Box>

      {/* Feedback messages */}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
};

export default SubmissionForm;
