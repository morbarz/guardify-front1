import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Collapse, IconButton, Divider, Alert, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

    // שמירה ל-localStorage כדי שנטען את זה בעמוד /submit/current
    localStorage.setItem('copiedSubmission', JSON.stringify(selected));
    navigate('/submit/current');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Submission History
      </Typography>

      {history.length === 0 ? (
        <Alert severity="info">No previous submissions found.</Alert>
      ) : (
        <>
          <Divider sx={{ my: 3 }} />
          {history.map((entry, i) => (
            <Paper key={i} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted at: {new Date(entry.submittedAt).toLocaleString()}
                </Typography>
                <Box>
                  <IconButton onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                    {expandedIndex === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>

                  {isOpen && (
                    <Button size="small" onClick={() => handleCopy(i)}>
                      Copy to Edit
                    </Button>
                  )}
                </Box>
              </Box>

              <Collapse in={expandedIndex === i}>
                {entry.schedule.map((day: number[], index: number) => (
                  <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                    Day {index + 1}:{' '}
                    {day
                      .map((v, j) => (v === 1 ? shiftTypes[j]?.type : null))
                      .filter(Boolean)
                      .join(', ') || 'No shifts selected'}
                  </Typography>
                ))}
              </Collapse>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};

export default SubmissionHistory;
