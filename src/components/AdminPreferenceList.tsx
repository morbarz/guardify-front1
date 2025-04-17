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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await axios.get('/preferences/all', { withCredentials: true });
        setData(res.data.preferences);
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
      <Typography variant="h5" gutterBottom>
        Submitted Shift Preferences
      </Typography>

      <Paper elevation={3}>
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
                <TableCell>{new Date(pref.submittedOn).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminPreferenceList;
