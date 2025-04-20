import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Divider,
  Grid,
  Chip,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PastSchedules: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Mock data for demonstration
  const pastSchedules = [
    {
      id: '1',
      period: 'March 1-15, 2024',
      status: 'archived',
      guards: 12,
      shifts: 45
    },
    {
      id: '2',
      period: 'February 15-29, 2024',
      status: 'archived',
      guards: 10,
      shifts: 40
    },
    {
      id: '3',
      period: 'February 1-14, 2024',
      status: 'archived',
      guards: 11,
      shifts: 42
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 28, mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h5">Past Schedules</Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* Search and Filter Section */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="From Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="To Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>

            {/* Schedules Grid */}
            <Grid container spacing={2}>
              {pastSchedules.map((schedule) => (
                <Grid item xs={12} md={4} key={schedule._id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      '&:hover': { 
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {schedule.period}
                          </Typography>
                          <Chip
                            label={schedule.status}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.text.secondary, 0.1),
                              color: theme.palette.text.secondary,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                        
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Guards Assigned: {schedule.guards}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Shifts: {schedule.shifts}
                          </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PastSchedules;
