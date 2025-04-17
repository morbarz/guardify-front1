import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { adminService } from '../services/api';

const SubmissionStatus: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await adminService.getSubmissionStatus();
        setIsOpen(result.isOpen);
        setStart(result.scheduleStartDate || null);
        setEnd(result.scheduleEndDate || null);
      } catch (err: any) {
        setError('Failed to load submission status');
      }
    };
    fetchStatus();
  }, []);

  if (isOpen === null) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Current Submission Status</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Alert severity={isOpen ? 'success' : 'info'}>
        Submission is currently <strong>{isOpen ? 'OPEN' : 'CLOSED'}</strong>
      </Alert>

      {start && end && (
        <Typography sx={{ mt: 1 }}>
          Submission dates: <strong>{start}</strong> to <strong>{end}</strong>
        </Typography>
      )}
    </Box>
  );
};

export default SubmissionStatus;
