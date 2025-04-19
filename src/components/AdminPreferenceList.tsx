import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

interface PreferenceSummary {
  name: string;
  email: string;
  totalDays: number;
  submittedOn: string;
}

const AdminPreferenceList: React.FC = () => {
  const [data, setData] = useState<PreferenceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await axios.get('/preferences/all', { withCredentials: true });
        const sorted = res.data.preferences.sort(
          (a: PreferenceSummary, b: PreferenceSummary) =>
            new Date(b.submittedOn).getTime() - new Date(a.submittedOn).getTime()
        );
        setData(sorted);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submitted Shift Preferences
      </Typography>

      {data.length === 0 ? (
        <Alert severity="info">No preferences submitted yet.</Alert>
      ) : (
        <Paper elevation={3} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Days Submitted</strong></TableCell>
                <TableCell><strong>Submitted On</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((pref, i) => (
                <TableRow key={i}>
                  <TableCell>{pref.name}</TableCell>
                  <TableCell>{pref.email}</TableCell>
                  <TableCell>{pref.totalDays}</TableCell>
                  <TableCell>
                    {new Date(pref.submittedOn).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default AdminPreferenceList;
