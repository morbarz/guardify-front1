import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Alert, Button, Checkbox, FormControlLabel,
  Paper, Divider, Collapse, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

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

  // Submit new preferences
  const handleSave = async () => {
    try {
      const formatted = preferences.map((day) => ({
        day: day.day,
        shiftIds: day.shiftIds.map((v) => (v ? 1 : 0))
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Submit Your Shift Preferences
      </Typography>

      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      {isOpen ? (
        <>
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

          {/* Show the correct button depending on mode */}
          {updating ? (
            <>
              <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mr: 2 }}>
                Update Preferences
              </Button>
              <Button variant="outlined" color="error" onClick={handleDelete}>
                Delete Submission
              </Button>
            </>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSave}>
              Submit Preferences
            </Button>
          )}
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Submission period is currently closed.
        </Alert>
      )}

      {/* Previous Submissions */}
      {history.length > 0 && (
        <Box mt={4}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Previous Submissions
          </Typography>
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
                  <Button size="small" onClick={() => handleCopy(i)}>Copy</Button>
                </Box>
              </Box>
              <Collapse in={expandedIndex === i}>
                {entry.schedule.map((day: number[], index: number) => (
                  <Typography key={index} variant="body2">
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
        </Box>
      )}
    </Box>
  );
};

export default SubmitPreferences;
