import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';

const AllSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        console.log("try to get all schedules")
        const res = await adminService.getAllGeneratedSchedules();
        if (res.success) {
          setSchedules(res.schedules);
        }
      } catch (err) {
        console.error('❌ Failed to load schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>All Generated Schedules</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Schedule ID</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule._id}>
                <TableCell>{schedule._id}</TableCell>
                <TableCell>{new Date(schedule.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(schedule.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{schedule.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate(`/admin/schedule/${schedule._id}`, {
                        state: { schedule },
                      })
                    }
                  >
                    הצג
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllSchedulesPage;
