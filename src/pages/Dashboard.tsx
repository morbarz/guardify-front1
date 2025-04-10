import React from 'react';
import { Grid, Box } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} item>
          {/* Content */}
        </Grid>
        <Grid xs={12} md={6} item>
          {/* Content */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 