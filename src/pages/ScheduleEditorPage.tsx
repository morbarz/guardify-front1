import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, Box, Chip, TableContainer
} from '@mui/material';
import { scheduleService, userService } from '../services/api';
import { format } from 'date-fns';
import { he as heLocale } from 'date-fns/locale';
import { GeneratedSchedule, DaySchedule } from '../types/models';

interface Guard {
  name: string;
  mail: string;
  role: string;
}

interface GuardAssignment {
  email: string;
  name: string;
  shiftType: string;
  priority: number;
}

interface ScheduleDay extends DaySchedule {
  date: Date;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const idealPerShift = 2;
const shiftTypes = ['morning', 'noon', 'night'] as const;
type ShiftType = typeof shiftTypes[number];

const shiftLabels: Record<ShiftType, string> = {
  morning: 'בוקר',
  noon: 'צהריים',
  night: 'לילה'
};

const getCellColor = (list: (string | GuardAssignment)[]) => {
  if (list.length === 0) return 'error';
  if (list.length < idealPerShift) return 'warning';
  return 'success';
};

const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const ScheduleEditorPage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [scheduleId, setScheduleId] = useState<string>('');
  const [guards, setGuards] = useState<Guard[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<{ index: number, shift: ShiftType } | null>(null);
  const [selectedGuard, setSelectedGuard] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResponse, guardsResponse] = await Promise.all([
          scheduleService.getLatestGeneratedSchedule(),
          userService.getAll()
        ]);

        if (!scheduleResponse.success) {
          throw new Error(scheduleResponse.message || 'Failed to fetch schedule');
        }

        if (!guardsResponse.success) {
          throw new Error(guardsResponse.message || 'Failed to fetch guards');
        }

        const scheduleData = scheduleResponse.data;
        const fullSchedule = [...scheduleData.firstWeek, ...scheduleData.secondWeek].map((item, idx) => {
          const date = new Date(scheduleData.startDate);
          date.setDate(date.getDate() + idx);
          return {
            ...item,
            date: date,
          };
        });

        setSchedule(fullSchedule);
        setGuards(guardsResponse.data || []);
        setScheduleId(scheduleData._id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  const handleAddClick = (index: number, shift: ShiftType) => {
    setSelected({ index, shift });
    setSelectedGuard('');
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!selected || !selectedGuard) return;

    const guard = guards.find(g => g.mail === selectedGuard);
    if (!guard) return;

    try {
      const response = await scheduleService.updateShift(scheduleId, selected.index, selected.shift, {
        name: guard.name,
        email: guard.mail
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update shift');
      }

      const updated = [...schedule];
      const shiftList = updated[selected.index][selected.shift];
      shiftList.push({
        email: guard.mail,
        name: guard.name,
        shiftType: selected.shift,
        priority: 0
      });
      setSchedule(updated);
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift');
      console.error('Failed to update shift:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        ניהול סידור עבודה - עריכה ידנית (מגונרט)
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>תאריך</strong></TableCell>
              {shiftTypes.map((shift) => (
                <TableCell key={shift}><strong>{shiftLabels[shift]}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((day, index) => (
              <TableRow key={index}>
                <TableCell>
                  {dayNames[day.date.getDay()]}<br />
                  {format(day.date, 'dd/MM/yyyy', { locale: heLocale })}
                </TableCell>
                {shiftTypes.map((shift) => (
                  <TableCell key={shift}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {day[shift].map((g, i: number) => (
                        <Chip 
                          key={i} 
                          label={typeof g === 'string' ? g : g.name || g.email} 
                          color="default" 
                        />
                      ))}
                      <Button
                        variant="outlined"
                        color={getCellColor(day[shift])}
                        onClick={() => handleAddClick(index, shift)}
                        size="small"
                      >
                        הוסף
                      </Button>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>הוספת מאבטח למשמרת</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedGuard}
            onChange={(e) => setSelectedGuard(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>בחר מאבטח</MenuItem>
            {guards
              .filter(g => g.role === 'guard')
              .map((g, i) => (
                <MenuItem key={i} value={g.mail}>
                  {g.name} ({g.mail})
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleSave} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduleEditorPage;