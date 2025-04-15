import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MyShifts: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        המשמרות שלי
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>
          כאן יופיעו כל המשמרות שלך בעתיד. פונקציונליות להצגה, סינון ועריכה תתווסף בהמשך.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MyShifts;
