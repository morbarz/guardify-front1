import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Stack, Divider } from '@mui/material';
import { scheduleService } from '../services/api';

type ShiftType = 'morning' | 'noon' | 'night';
interface DaySchedule {
  morning: any[];
  noon: any[];
  night: any[];
}

const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const MyShifts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myShifts, setMyShifts] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMyShifts = async () => {
      try {
        const res = await scheduleService.getLastSubmittedSchedule();
        if (!res.success || !res.schedule) return;
        console.log(res.schedule)
        console.log(res.schedule.firstWeek)
        console.log(res.schedule.secondWeek)
        const schedule = [...(res.schedule.firstWeek || []), ...(res.schedule.secondWeek || [])];

        const shifts = schedule.map((day: DaySchedule, index) => {
          const shiftsForDay = (['morning', 'noon', 'night'] as ShiftType[]).filter((shift) =>
            day[shift]?.some((g: any) => g?.mail === localStorage.getItem('userEmail'))
          );

          return shiftsForDay.length > 0
            ? { dayIndex: index, dayName: days[index % 7], shifts: shiftsForDay }
            : null;
        }).filter(Boolean);

        setMyShifts(shifts);
      } catch (err) {
        console.error('❌ Failed to fetch shifts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyShifts();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        המשמרות שלי
      </Typography>

      {myShifts.length === 0 ? (
        <Typography color="text.secondary">לא שובצת עדיין למשמרות.</Typography>
      ) : (
        <Stack spacing={2}>
          {myShifts.map(({ dayIndex, dayName, shifts }) => (
            <Paper key={dayIndex} sx={{ p: 2 }}>
              <Typography variant="h6">{dayName}</Typography>
              <Divider sx={{ my: 1 }} />
              {shifts.map((s: string) => (
                <Typography key={s} variant="body2">• משמרת {s === 'morning' ? 'בוקר' : s === 'noon' ? 'צהריים' : 'לילה'}</Typography>
              ))}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MyShifts;