import React from 'react';
import { Box, Skeleton, Grid, Paper } from '@mui/material';

export const ScheduleSkeleton: React.FC = () => {
  return (
    <Box p={3}>
      {/* Schedule Header */}
      <Box mb={4}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>

      {/* Schedule Controls */}
      <Box mb={4} display="flex" gap={2}>
        <Skeleton variant="rectangular" width={200} height={40} />
        <Skeleton variant="rectangular" width={200} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </Box>

      {/* Schedule Grid */}
      <Paper sx={{ p: 2 }}>
        {/* Days Header */}
        <Box display="flex" mb={2}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box key={day} flex={1} textAlign="center">
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          ))}
        </Box>

        {/* Schedule Rows */}
        {[1, 2, 3, 4, 5].map((week) => (
          <Box key={week} display="flex" mb={2}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <Box key={day} flex={1} p={1}>
                <Skeleton variant="rectangular" width="100%" height={100} />
              </Box>
            ))}
          </Box>
        ))}
      </Paper>

      {/* Schedule Summary */}
      <Box mt={4}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Paper sx={{ p: 2 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={32} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}; 