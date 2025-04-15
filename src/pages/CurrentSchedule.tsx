import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CurrentSchedule: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        סידור העבודה שלי
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>
          עמוד זה יציג את סידור העבודה הנוכחי שלך. בעתיד תתווסף אפשרות להצגת לוח זמנים.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CurrentSchedule;
