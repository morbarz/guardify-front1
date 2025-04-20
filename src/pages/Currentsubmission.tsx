import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Alert, Button, Checkbox,
  FormControlLabel, Paper
} from '@mui/material';
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

  // טען הגשה נוכחית והעתקה מ-localStorage אם קיימת
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

        // אם יש העתקה זמינה מ־localStorage
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

  // החלף מצב של משמרת ליום מסוים
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
          ? day.shiftIds.map((v) => (v ? 1 : 0))       // ⬅️ למספרים עבור update
          : day.shiftIds.map((v) => (v ? '1' : '0'))   // ⬅️ למחרוזות עבור submit
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
  


  // מחיקת ההגשה הנוכחית
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {updating ? 'Edit Your Submitted Preferences' : 'Submit Your Shift Preferences'}
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ my: 2 }}>
          {message.text}
        </Alert>
      )}

      {!isOpen ? (
        <Alert severity="info">Submission period is currently closed.</Alert>
      ) : (
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

          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
            {updating ? 'Update' : 'Submit'}
          </Button>

          {updating && (
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete Submission
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default CurrentSubmission;
