import React from 'react';
import { Box, Skeleton, Grid, Paper } from '@mui/material';

export const ShiftPreferenceSkeleton: React.FC = () => {
  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Form Header */}
        <Box mb={4}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Form Fields */}
        <Grid container spacing={3}>
          {/* Date Field */}
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Grid>

          {/* Shift Type Field */}
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Grid>

          {/* Preference Field */}
          <Grid item xs={12}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Grid>

          {/* Notes Field */}
          <Grid item xs={12}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={120} />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" width={120} height={40} />
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Preferences */}
      <Box>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 2 }}>
          {[1, 2, 3].map((item) => (
            <Box key={item} display="flex" alignItems="center" mb={2}>
              <Skeleton variant="rectangular" width="20%" height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width="20%" height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width="20%" height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width="20%" height={40} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}; 