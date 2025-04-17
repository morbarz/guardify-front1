import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { adminService } from '../services/api';

const SubmissionControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current submission state from server
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await adminService.getSubmissionStatus();
        setIsOpen(result.isOpen);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch submission status');
      }
    };
    fetchStatus();
  }, []);

  const toggleSubmission = async () => {
    try {
      const newState = !isOpen;
      const result = await adminService.toggleSubmissionPeriod(newState);
      setIsOpen(result.isOpen);
    } catch (err: any) {
      setError(err.message || 'Failed to update submission period');
    }
  };

  if (isOpen === null) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Shift Submission Control
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Alert severity={isOpen ? 'success' : 'warning'} sx={{ mb: 2 }}>
        Shift submission is currently <strong>{isOpen ? 'OPEN' : 'CLOSED'}</strong>
      </Alert>

      <Button variant="contained" color={isOpen ? 'error' : 'primary'} onClick={toggleSubmission}>
        {isOpen ? 'Close Submission' : 'Open Submission'}
      </Button>
    </Box>
  );
};

export default SubmissionControl;
