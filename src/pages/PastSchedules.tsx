import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PastSchedules: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        סידורים קודמים
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>
          בעמוד זה תוכל לצפות בסידורי העבודה מהעבר. בעתיד תתווסף אפשרות לחיפוש לפי תאריך.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PastSchedules;
