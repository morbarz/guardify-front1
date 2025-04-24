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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { adminService } from '../services/api';

interface PreferenceSummary {
  _id: string;
  name: string;
  email: string;
  totalDays: number;
  submittedOn: string;
  preferences: Array<{
    day: number;
    shiftIds: number[];
  }>;
}

const AdminPreferenceList: React.FC = () => {
  const [data, setData] = useState<PreferenceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllPreferences();
        console.log('Preferences response:', response);
        if (response.success) {
          const sorted = response.data.sort(
            (a: PreferenceSummary, b: PreferenceSummary) =>
              new Date(b.submittedOn).getTime() - new Date(a.submittedOn).getTime()
          );
          setData(sorted);
          setError(null);
        } else {
          setError(response.message || 'Failed to load preferences');
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch preferences:', err);
        setError(err.message || 'An error occurred while fetching preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const getShiftName = (shiftId: number) => {
    switch (shiftId) {
      case 0: return 'Morning';
      case 1: return 'Noon';
      case 2: return 'Night';
      default: return 'Unknown';
    }
  };

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
                <TableCell><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((pref) => (
                <TableRow key={pref._id}>
                  <TableCell>{pref.name}</TableCell>
                  <TableCell>{pref.email}</TableCell>
                  <TableCell>{pref.totalDays}</TableCell>
                  <TableCell>{new Date(pref.submittedOn).toLocaleString()}</TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>View Preferences</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Day</TableCell>
                              <TableCell>Shifts</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pref.preferences.map((day) => (
                              <TableRow key={day.day}>
                                <TableCell>Day {day.day}</TableCell>
                                <TableCell>
                                  {day.shiftIds
                                    .map((value, index) => value === 1 ? getShiftName(index) : null)
                                    .filter(Boolean)
                                    .join(', ') || 'No shifts selected'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
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
