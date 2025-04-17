import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider
} from '@mui/material';
import { preferencesService, adminService } from '../services/api';
import axios from 'axios';

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
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<number[][] | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [history, setHistory] = useState<number[][][]>([]);
  const [historyDates, setHistoryDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const statusRes = await adminService.getSubmissionStatus();
        setIsOpen(statusRes.isOpen);

        // Check previous submission
        try {
          const existing = await preferencesService.getPreferences();
          if (existing && existing.preferences?.schedule) {
            const numericSchedule = existing.preferences.schedule.map((day: any[]) =>
              day.map((val) => Number(val) || 0)
            );
            setAlreadySubmitted(true);
            setSubmittedData(numericSchedule);
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            setMessage({ type: 'error', text: 'Error checking existing preferences.' });
            return;
          }
        }

        // Get available shifts
        const shiftRes = await axios.get('/users/getAvailableShifts', { withCredentials: true });
        const types: ShiftType[] = shiftRes.data.shiftTypes;
        setShiftTypes(types);

        const initialPrefs: ShiftPreference[] = Array.from({ length: 14 }, (_, i) => ({
          day: i + 1,
          shiftIds: Array(types.length).fill(false)
        }));

        setPreferences(initialPrefs);

        // Load history if needed
        if (alreadySubmitted) {
          const res = await axios.get('/preferences/my-submissions', { withCredentials: true });
          const clean = res.data.history.map((entry: any) =>
            entry.schedule.map((day: any[]) => day.map((val) => Number(val) || 0))
          );
          setHistory(clean);
          setHistoryDates(res.data.history.map((e: any) => e.submittedAt));
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load data. Please try again later.' });
      }
    };

    fetchInitialData();
  }, [alreadySubmitted]);

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
      setMessage(null);

      const formattedSchedule = preferences.map((dayPref) => ({
        day: dayPref.day,
        shiftIds: dayPref.shiftIds.map((selected) => (selected ? 1 : 0))
      }));

      await preferencesService.submitPreferences(formattedSchedule);
      setMessage({ type: 'success', text: 'Preferences submitted successfully!' });
      setAlreadySubmitted(true);
      setSubmittedData(formattedSchedule.map((p) => p.shiftIds));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' });
    }
  };

  if (!isOpen) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Submission period is currently closed.</Alert>
      </Box>
    );
  }

  if (alreadySubmitted && submittedData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          You have already submitted your preferences. Thank you!
        </Alert>

        <Typography variant="h6" gutterBottom>
          Your Submitted Preferences:
        </Typography>

        {submittedData.map((shifts, i) => (
          <Typography key={i} variant="body2">
            Day {i + 1}:{' '}
            {shifts
              .map((val, idx) => (val === 1 ? shiftTypes[idx]?.type : null))
              .filter(Boolean)
              .join(', ') || 'No shifts selected'}
          </Typography>
        ))}

        {history.length > 1 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Previous Submissions
            </Typography>
            {history.slice(1).map((submission, idx) => (
              <Paper key={idx} elevation={1} sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted at: {new Date(historyDates[idx + 1]).toLocaleString()}
                </Typography>
                {submission.map((shifts, i) => (
                  <Typography key={i} variant="body2">
                    Day {i + 1}:{' '}
                    {shifts
                      .map((val, j) => (val === 1 ? shiftTypes[j]?.type : null))
                      .filter(Boolean)
                      .join(', ') || 'No shifts selected'}
                  </Typography>
                ))}
              </Paper>
            ))}
          </>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Submit Your Shift Preferences
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {preferences.map((dayPref) => (
        <Paper key={dayPref.day} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Day {dayPref.day}</Typography>
          {shiftTypes.map((shift, index) => (
            <FormControlLabel
              key={shift.number}
              control={
                <Checkbox
                  checked={dayPref.shiftIds[index]}
                  onChange={() => toggleShift(dayPref.day, index)}
                />
              }
              label={shift.type}
            />
          ))}
        </Paper>
      ))}

      <Button variant="contained" onClick={handleSubmit}>
        Submit Preferences
      </Button>
    </Box>
  );
};

export default SubmitPreferences;
